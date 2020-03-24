function draw_scree_plot(eigen_values, source) {
    var mData = JSON.parse(eigen_values);
    metaData = mData[source]
    data = []
    populateDataTable(metaData['significance'])
    // data.push({'pca': 0, 'pcaCumSum': 0})
    pcaLine = { x: -1, y: -1 };

    for (i = 0; i < metaData['pca'].length; i++) {
        data.push({ 'pca': metaData['pca'][i], 'pcaCumSum': metaData['pcaCumSum'][i] })
        if (pcaLine.x == -1 && metaData['pcaCumSum'][i] > 0.70) {
            pcaLine = { x: i, y: metaData['pca'][i] };
        }
    }

    document.getElementById("screeplotContainer").innerHTML = "";

    var margin = { top: 20, right: 20, bottom: 50, left: 70 };
    var width = parseInt(d3.select("#screeplotContainer").style("width")) - margin.left - margin.right;
    var height = 420 - margin.top - margin.bottom;

    var x = d3.scaleLinear().domain([0, data.length]).range([0, width]);
    var y = d3.scaleLinear().domain([0, 1]).range([height, 0]);


    var valueline = d3.line()
        .x(function (d, i) { return x(i); })
        .y(function (d) { return y(d.pcaCumSum); })
        .curve(d3.curveCardinal);

    var xAxis = d3.axisBottom().scale(x).ticks(16)
        .tickFormat(function (d) { return d + 1 });
    var yAxis = d3.axisLeft().scale(y).ticks(10)

    var svg
    var div
    svg = d3.select("#screeplotContainer").append("svg")
        .attr("width", "100%")
        .attr("height", "90%")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    div = d3.select("#screeplotContainer").append("div")
        .attr("class", "tooltiptext")
        .style("opacity", 0);

    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueline);

    // Add PCA Line
    if (pcaLine.x != -1) {
        svg.append("line")
            .attr("x1", x(pcaLine.x))
            .attr("x2", x(pcaLine.x))
            .attr("y1", y(pcaLine.y))
            .attr("y2", y(1.0))
            .attr("stroke", 'teal')
            .attr("stroke-dasharray", "5,5")
            .attr("stroke-width", 1)

        svg.append("line")
            .attr("x1", x(0))
            .attr("x2", x(data.length))
            .attr("y1", y(0.7))
            .attr("y2", y(0.7))
            .attr("stroke", 'teal')
            .attr("stroke-dasharray", "5,5")
            .attr("stroke-width", 1)
    }

    svg.append("g")
        .attr("class", "x axis-text")
        .attr("transform", "translate(0," + (height + 15) + ")")
        .call(xAxis);

    svg.append("text")
        .attr("y", height + 70)
        .attr("dx", width / 2 - margin.left)
        .attr("text-anchor", "start")
        .text('PCA Dimensions')

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d, i) { return x(i) - 10; })
        .attr("y", function (d) { return y(d.pca); })
        .attr("width", 20)
        .attr("height", function (d) { return height - y(d.pca) })

    svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", function (d, i) { return x(i) })
        .attr("cy", function (d) { return y(d.pcaCumSum) })
        .attr("r", 5)
        .on("mouseover", function (d, i) {
            var html = "<span style='font-weight: bolder; color: teal;'>" +
                (i + 1) + "</span>" +
                "<br/><span style='color: orange;'> " +
                (Math.round((d.pcaCumSum * 100000)) / 1000) + "%</span>";

            div.transition()
                .duration(200)
                .style("opacity", 1);
            div.html(html)
                .style("left", parseFloat(d3.select(this).attr("cx")) + 38 + "px")
                .style("top", parseFloat(d3.select(this).attr("cy")) - 40 + "px")
                .style("line-height", "18px");
        }).on("mouseout", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

    svg.append("g")
        .attr("class", "yaxis")
        .attr("transform", "translate(-20,0)")
        .call(yAxis);

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "end")
        .text("Variance (0-1)")

}


function populateDataTable(data) {
    $('#significanceTable').DataTable().clear().draw();
    Object.keys(data).forEach(key => {
        $('#significanceTable').DataTable().row.add( [
            key,
            Math.round(data[key] * 1000) / 1000
        ]).draw( false );
    });  
}
