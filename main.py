import json
import os
import sys
import random

from flask import Flask, jsonify
from flask_cors import CORS
from flask import flash, redirect, render_template, request, session, abort

import numpy as np
import pandas as pd
import matplotlib as plt
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.manifold import MDS
from scipy.spatial.distance import cdist

randomSample = pd.DataFrame()
adaptiveSample = pd.DataFrame()
overallSamples = 2000
sampleSize = 1500
specs_csv = pd.DataFrame()
copy_specs_csv = pd.DataFrame()
mainColumns = []
inertias = []
sqaureLoadings = {}
topFeatures = dict()

app = Flask(__name__)
CORS(app)


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/test')
def welcome():
    return 'Welcome'


def init():
    # Read CSV
    global specs_csv
    global copy_specs_csv
    global mainColumns
    global sampleSize
    global topFeatures
    specs_csv = pd.read_csv('data/football.csv', low_memory=False)
    copy_specs_csv = specs_csv.copy()
    del specs_csv['Name']
    del specs_csv['Value']
    del specs_csv['Potential']
    #specs_csv = specs_csv.sample(overallSamples)
    sampleSize = int(len(specs_csv) / 2)
    # print(list(specs_csv.columns))
    specs_csv.reset_index(inplace=True)
    del specs_csv['index']

    print('Loaded data : ' + str(specs_csv.shape))
    mainColumns = list(specs_csv.columns)
    
    #mainColumns.remove('Name')
    #print(mainColumns)
    clustering(specs_csv)
    clusteringForK()
    
    generateRandomSample()
    generateAdaptiveSample()
    for i in range(0, 3):
        sig = {}
        source, name = dataSourceMapping(i)
        sl = loadSquareLoadings(source, 10)
        sqaureLoadings[name] = sl
        i = 0
        for col in mainColumns:
            sig[col] = sl[i]
            i = i+1
        topFeatures[name] = []
        for w in sorted(sig, key=sig.get, reverse=True):
            topFeatures[name].append(w)

def dataSourceMapping(index, excludeClusterId=True):
    if index == 0:
        return randomSample[mainColumns] if excludeClusterId else randomSample, 'randomSample'
    if index == 1:
        return adaptiveSample[mainColumns] if excludeClusterId else adaptiveSample, 'adaptiveSample'
    if index == 2:
        return specs_csv[mainColumns] if excludeClusterId else specs_csv, 'sample'


def clusteringForK():
    k = 4
    X_std = StandardScaler().fit_transform(specs_csv)
    kmeans = KMeans(n_clusters=k)
    kmeans.fit(X_std)
    labels = kmeans.labels_
    specs_csv['clusterId'] = pd.Series(labels)


def generateRandomSample():
    global randomSample
    chosen_idx = np.random.choice(sampleSize, replace=False, size=sampleSize)
    randomSample = specs_csv.iloc[chosen_idx]
    randomSample.reset_index(inplace=True)
    del randomSample['index']


def generateAdaptiveSample():
    global adaptiveSample

    stratifiedCluster = {}
    lenData = len(specs_csv)

    for i in range(4):
        cluster = specs_csv[specs_csv['clusterId'] == i]
        clusterSize = len(cluster) * sampleSize / lenData
        chosen_idx = np.random.choice(
            int(clusterSize), replace=False, size=int(clusterSize))
        stratifiedCluster[i] = cluster.iloc[chosen_idx]

    for i in range(4):
        adaptiveSample = adaptiveSample.append(stratifiedCluster[i])

    adaptiveSample.reset_index(inplace=True)
    del adaptiveSample['index']
    print(adaptiveSample['clusterId'].value_counts())


def generateEigenValues(data):
    covMat = np.cov(data.T)
    eigenValues, eigenVectors = np.linalg.eig(covMat)

    ev = eigenValues.argsort()[::-1]
    eigenValues = eigenValues[ev]
    eigenVectors = eigenVectors[:, ev]
    return eigenValues, eigenVectors


def loadSquareLoadings(data, dimen):
    eigenValues, eigenVectors = generateEigenValues(data)
    squaredLoadings = []

    featureCount = len(eigenVectors)
    for fId in range(0, featureCount):
        loadings = 0
        for compId in range(0, dimen):
            loadings = loadings + \
                eigenVectors[compId][fId] * eigenVectors[compId][fId]
        squaredLoadings.append(loadings)
    return squaredLoadings


def performPCA(data, numberOfPC=15):
    # Standardize the data
    X_std = StandardScaler().fit_transform(data)
    # Create a PCA instance
    pca = PCA(n_components=numberOfPC)
    principalComponents = pca.fit_transform(X_std)
    return pca.explained_variance_ratio_, pca.explained_variance_ratio_.cumsum()


def performPCAForScatter(Xdata):
    X_std = StandardScaler().fit_transform(Xdata)
    pca = PCA(n_components=2)
    principalComponents = pca.fit_transform(X_std)
    df = pd.DataFrame(principalComponents)
    return df

@app.route("/elbow_curve")
def getInteria():
    return json.dumps({'inertia': inertias})

def clustering(Xdata): 
    global inertias
    X_std = StandardScaler().fit_transform(Xdata)
    for k in range(1, 20):
        model = KMeans(n_clusters=k)
        model.fit(X_std)
        inertias.append(model.inertia_)

@app.route("/plot_scree")
def plot_scree():
    sourceArray = {}
    pcaCumSum = []
    pca = []
    for i in range(0, 3):
        source, name = dataSourceMapping(i)
        try:
            pca, pcaCumSum = performPCA(source)
        except:
            e = sys.exc_info()[0]
            print(e)

        sig = {}
        squaredLoadings = sqaureLoadings[name]

        i = 0
        for col in mainColumns:
            sig[col] = squaredLoadings[i]
            i = i+1

        sourceArray[name] = {'pca': pca.tolist(),
                             'pcaCumSum': pcaCumSum.tolist(),
                             'significance': sig
                             }

    return json.dumps(sourceArray)


@app.route("/plot_scattered_pca")
def plot_scattered_pca():
    typ = request.args.get('dataType')

    source, name = dataSourceMapping(int(typ))
    sourceC, nameC = dataSourceMapping(int(typ), False)
    res = performPCAForScatter(source)
   
    res['cluster'] = sourceC['clusterId']
    res['name'] = copy_specs_csv['Name']
    #print(res.isna().value_counts())
    print(res['cluster'].value_counts())
    # res = res.head(6000)
    return res.to_json()

@app.route("/plot_mds")
def plot_mds():
    sourceArray = {}
    typ = request.args.get('dataType')
    diss = request.args.get('dissimilarity')
    df = pd.DataFrame()

    if diss == 'euclidean':
        df = euclidean_mds(int(typ))
    else:
        df = precomputed_mds(int(typ))

    return df.to_json()

def euclidean_mds(t):
    source, name = dataSourceMapping(t)
    sourceC, nameC = dataSourceMapping(t, False)
    X_std = StandardScaler().fit_transform(source)
    model = MDS(n_components=2, random_state=1)
    res = model.fit_transform(X_std)
    df = pd.DataFrame(res)
    df['cluster'] = sourceC['clusterId']
    df['name'] = copy_specs_csv['Name']
    return df

def precomputed_mds(t):
    source, name = dataSourceMapping(t)
    sourceC, nameC = dataSourceMapping(t, False)
    X_std = StandardScaler().fit_transform(source)
    Y = cdist(X_std, X_std, 'correlation')
    model = MDS(n_components=2, random_state=1, dissimilarity='precomputed', n_jobs=-1)
    res = model.fit_transform(Y)
    df = pd.DataFrame(res)
    df['cluster'] = sourceC['clusterId']
    df['name'] = copy_specs_csv['Name']
    return df

@app.route("/plot_pairplot")
def plot_pairplot():
    typ = request.args.get('dataType')

    source, name = dataSourceMapping(int(typ), False)
    #df = pd.DataFrame()
    df = source[topFeatures[name][:3]].copy()
    df['cluster'] = source['clusterId']
    return df.to_json()

if __name__ == '__main__':
    init()
    port = 8081
    app.run(host='0.0.0.0', port=port, debug=True)
