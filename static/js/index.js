$(document).ready(function () {
  $('#significanceTable').DataTable({
    "paging": false,
    "filter": false,
    "order": [[1, "desc"]],
    "info": false,
    "scrollY": "43vh",
    "scrollCollapse": true
    // "columnDefs": [
    //   { "width": "60px", "targets": 0 }
    // ]
  });

});

tabRowToURLMapping = {
  'tab10': { url: '/elbow_curve', title: 'K Means Cluster', desc: '', data: {} },
  // 'tab11': { url: '/elbow_curve', title: 'K Means Clustering', desc: '', data: {} },
  // 'tab12': { url: '/elbow_curve', title: 'Stratified Sampling', desc: '', data: {} },
  'tab20': { url: '/plot_scree', title: 'PCA Whole Dataset', desc: 'sample', data: {} },
  'tab21': { url: '/plot_scree#alreadyLoaded', title: 'PCA Random Sample', desc: 'randomSample', data: {} },
  'tab22': { url: '/plot_scree#alreadyLoaded', title: 'PCA Adaptive Sample', desc: 'adaptiveSample', data: {} },
  'tab30': { url: '/plot_scattered_pca', title: 'PCA - Whole Dataset', desc: 'sample', data: { dataType: 2 } },
  'tab31': { url: '/plot_scattered_pca', title: 'PCA - Random Sample', desc: 'randomSample', data: { dataType: 0 } },
  'tab32': { url: '/plot_scattered_pca', title: 'PCA - Adaptive Sample', desc: 'adaptiveSample', data: { dataType: 1 } },
  'tab40': { url: '/plot_mds', title: 'MDS - Euclidean distance - Random Sample', desc: '', data: { dataType: 0, dissimilarity: 'euclidean'} },
  'tab41': { url: '/plot_mds', title: 'MDS - Euclidean distance - Adaptive Sample', desc: '', data: { dataType: 1, dissimilarity: 'euclidean'} },
  'tab42': { url: '/plot_mds', title: 'MDS - Correlation distance - Random Sample', desc: '', data: { dataType: 0, dissimilarity: 'precomputed' } },
  'tab43': { url: '/plot_mds', title: 'MDS - Correlation distance - Adaptive Sample', desc: '', data: { dataType: 1, dissimilarity: 'precomputed' } },
  'tab50': { url: '/plot_pairplot', title: 'Scatter Matrix - Whole Dataset', desc: '', data: {dataType: 0} },
  'tab51': { url: '/plot_pairplot', title: 'Scatter Matrix - Random Sample', desc: '', data: {dataType: 1} },
  'tab52': { url: '/plot_pairplot', title: 'Scatter Matrix - Adaptive Sample', desc: '', data: {dataType: 2} }
}

cachedResult = {};

tab = 'tab1', row = 0
onRowClick(0)

function onRowClick(r) {
  $(".well").hide();
  $("#loading").show();
  
  $('#' + tab + String(r)).addClass('active').siblings().removeClass('active');
  row = r
  formUrl()
}

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
  var target = $(e.target).attr("href") // activated tab
  tab = target.split('#')[1];
  row = 0
  onRowClick(0)
});

function formUrl() {
  rowObj = tabRowToURLMapping[(tab + String(row))]
  $("#" + tab + "Canvas > h5").html(rowObj.title)
  if (rowObj.url.includes("alreadyLoaded") > 0) {
    loadResult(rowObj, cachedResult)
  } else {
    $.ajax({
      type: 'GET',
      url: rowObj.url,
      data: rowObj.data,
      contentType: 'application/json; charset=utf-8',
      headers: {
      },
      success: function (result) {
        cachedResult = result;
        loadResult(rowObj, result)
      },
      error: function (result) {
        $("#error").html(result);
      }
    });
  }
}

function loadResult(rowObj, result) {
  $("#loading").hide();
  $(".well").show();
  if (rowObj.url.includes('/elbow_curve')) {
    draw_line_plot(result, rowObj.desc)
  } else if (rowObj.url.includes('/plot_scree')) {
    draw_scree_plot(result, rowObj.desc)
  } else if (rowObj.url.includes('/plot_scattered')) {
    draw_scatter_plot(result, "scatterplotContainer")
  } else if (rowObj.url.includes('/plot_mds')) {
    draw_scatter_plot(result, "scatterplotContainer1")
  } else if(rowObj.url.includes("/plot_pairplot")) {
    draw_pair_plot(result, "pairplotContainer")
  }
}