function draw_scree_plot(eigen_values) {
    var metaData = JSON.parse(eigen_values);
    data = []
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

    // var area = d3.area()
    //     .x(function (d) { return x(d.date); })
    //     .y0(height)
    //     .y1(function (d) { return y(d.nps); })
    //     .curve(d3.curveCardinal);

    // var grid = d3.line()
    //     .x(function (d) { return x(d); }) // set the x values for the line generator
    //     .y(function (d) {
    //         var sum = 0;
    //         var avg = 0;
    //         lineData.forEach(function (e) {
    //             sum += e.nps;
    //         });

    //         avg = sum / lineData.length;

    //         return y(20);
    //     });

    // var xAxis = d3.axisBottom().scale(x)

    var xAxis = d3.axisBottom().scale(x).ticks(15)
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

    // svg.append("path")
    //     .data([data])
    //     .attr("class", "area")
    //     .attr("d", area);

    // svg[i].append("linearGradient")
    //     .attr("id", "temperature-gradient")
    //     .attr("gradientUnits", "userSpaceOnUse")
    //     .attr("x1", 0).attr("y1", y(5))
    //     .attr("x2", 0).attr("y2", y(75))
    //     .selectAll("stop")
    //     .data([
    //         { offset: "0%", color: "#F8FCFE" },
    //         { offset: "50%", color: "#E7F5FE" },
    //         { offset: "100%", color: "#E1F2FC" }
    //     ])
    //     .enter().append("stop")
    //     .attr("offset", function (d) { return d.offset; })
    //     .attr("stop-color", function (d) { return d.color; });

    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueline);

    // Add PCA Line
    if (pcaLine.x != -1) {
        console.log(pcaLine.x)
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
        .text('PCA Features')

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
        .on("mouseover", function (d) {
            var html = d.pcaCumSum
            // "<br/><span style='margin-left: 10px; color: #666;'>" + inc_rate + "% \
            //         <span style='color: #09CE4F;'>&uarr;</span></span>";

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
