tabRowToURLMapping = {
    'tab10' : {url: '/test', title: 'Random Sampling', desc: ''},
    'tab11' : {url: '/test', title: 'K Means Clustering', desc: ''},
    'tab12' : {url: '/test', title: 'Stratified Sampling', desc: ''},
    'tab20' : {url: '/test', title: 'PCA Random Sampling', desc: ''},
    'tab21' : {url: '/test', title: 'PCA Adaptive Sampling', desc: ''},
    'tab30' : {url: '/test', title: 'MDS Euclidean Random Sampling', desc: ''},
    'tab31' : {url: '/test', title: 'MDS Euclidean Adaptive Sampling', desc: ''},
    'tab32' : {url: '/test', title: 'MDS Correlation Random Sampling', desc: ''},
    'tab33' : {url: '/test', title: 'MDS Correlation Adaptive Sampling', desc: ''},
    'tab34' : {url: '/test', title: 'Scatter Matrix Random Sampling', desc: ''},
    'tab35' : {url: '/test', title: 'Scatter Matrix Adaptive Sampling', desc: ''}
}

tab = 'tab1', row = 0
onRowClick(0)

function onRowClick(r) {
    $('#' + tab + String(r)).addClass('active').siblings().removeClass('active');
    row = r
    console.log(r)
    formUrl()
}

$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    var target = $(e.target).attr("href") // activated tab
    tab = target.split('#')[1];
    row = 0
    onRowClick(0)
    console.log(tab)
});

function formUrl() {
    rowObj = tabRowToURLMapping[(tab+String(row))]
    $( "#" + tab + "Canvas > h5").html(rowObj.title)
    console.log(rowObj)
	$.ajax({
	  type: 'GET',
	  url: rowObj.url,
      contentType: 'application/text; charset=utf-8',
	  xhrFields: {
		withCredentials: false
	  },
	  headers: {
	  },
	  success: function(result) {
          console.log(result)
	  },
	  error: function(result) {
		$("#error").html(result);
	  }
	});
}