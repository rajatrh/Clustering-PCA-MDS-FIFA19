import json
import os
import sys
import random

from flask import Flask, jsonify
from flask_cors import CORS
from flask import flash, redirect, render_template, request, session, abort

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA

randomSample = pd.DataFrame()
adaptiveSample = pd.DataFrame()
sampleSize = 12000
specs_csv = pd.DataFrame()
std_specs_csv = []
ftrs = ["MRSP"]

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
    global std_specs_csv
    specs_csv = pd.read_csv('data/car_spec.csv', low_memory=False)
    # Normalize the data and keep
    std_specs_csv = StandardScaler().fit_transform(specs_csv)
    print('Loaded data : ' + str(specs_csv.shape))
    clustering()
    generate_random_sample()
    generate_adaptive_sample()
    #squared_loadings = plot_intrinsic_dimensionality_pca(specs_csv, 6)
    #imp_ftrs = sorted(range(len(squared_loadings)), key=lambda k: squared_loadings[k], reverse=True)
    #print(imp_ftrs)

def clustering():
    k = 6
    kmeans = KMeans(n_clusters=k)
    kmeans.fit(specs_csv)
    labels = kmeans.labels_
    specs_csv['clusterId'] = pd.Series(labels)
    
# Task 1A - Generate a random sample
def generate_random_sample():
    global randomSample
    chosen_idx = np.random.choice(sampleSize, replace = False, size=sampleSize)
    randomSample = specs_csv.iloc[chosen_idx]

# Task 1A - Generate a stratified sample
def generate_adaptive_sample():
    global adaptiveSample

    stratifiedCluster = {}
    lenData = len(specs_csv)

    for i in range(6):
        cluster = specs_csv[specs_csv['clusterId'] == i]
        clusterSize = len(cluster) * sampleSize / lenData
        chosen_idx = np.random.choice(int(clusterSize), replace = False, size=int(clusterSize))
        stratifiedCluster[i] = cluster.iloc[chosen_idx]
    
    for i in range(6):
        adaptiveSample = adaptiveSample.append(stratifiedCluster[i])

# def plot_intrinsic_dimensionality_pca(data, k):
#     [eigenValues, eigenVectors] = generate_eigenValues(data)
#     squaredLoadings = []
#     ftrCount = len(eigenVectors)
#     for ftrId in range(0, ftrCount):
#         loadings = 0
#         for compId in range(0, k):
#             loadings = loadings + eigenVectors[compId][ftrId] * eigenVectors[compId][ftrId]
#         squaredLoadings.append(loadings)
#     return squaredLoadings

def perform_PCA(data, numberOfPC=15):
    # Standardize the data to have a mean of ~0 and a variance of 1
    X_std = StandardScaler().fit_transform(adaptiveSample)
    # Create a PCA instance: pca
    pca = PCA(n_components=numberOfPC)
    principalComponents = pca.fit_transform(X_std)
    return pca.explained_variance_ratio_, pca.explained_variance_ratio_.cumsum()

@app.route("/plot_scree")
def scree_adaptive():
    pcaCumSum = []
    pca = []
    print("Inside scree")
    # Plotting scree plot using random samples
    try:
        pca, pcaCumSum = perform_PCA(adaptiveSample)
    except:
        e = sys.exc_info()[0]
        print(e)
    return json.dumps({'pca': pca.tolist(), 'pcaCumSum' : pcaCumSum.tolist()})

if __name__ == '__main__':
    init()
    port = 8081
    app.run(host='0.0.0.0', port=port, debug=True)
    
    