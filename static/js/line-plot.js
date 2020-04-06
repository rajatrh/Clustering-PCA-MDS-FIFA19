function draw_line_plot(d, source) {
    var mData = JSON.parse(d);
    console.log(mData)
    data = []

    for (i = 0; i < mData['inertia'].length; i++) {
        data.push({ 'i': i, 'inertia': mData['inertia'][i] })
    }

    document.getElementById("lineplotContainer").innerHTML = "";

    var margin = { top: 20, right: 20, bottom: 50, left: 140 };
    var width = parseInt(d3.select("#lineplotContainer").style("width")) - margin.left - margin.right;
    var height = 420 - margin.top - margin.bottom;

    var x = d3.scaleLinear().domain([1, data.length]).range([0, width]);
    var y = d3.scaleLinear().domain([d3.min(data, function (d) { return d.inertia; }),
    d3.max(data, function (d) { return d.inertia; })])
        .range([height, 0]);

    var valueline = d3.line()
        .x(function (d, i) { return x(i + 1); })
        .y(function (d) { return y(d.inertia); })
        .curve(d3.curveCardinal);

    var xAxis = d3.axisBottom().scale(x).ticks(16)
        .tickFormat(function (d) { return d });
    var yAxis = d3.axisLeft().scale(y).ticks(10)

    var svg
    var div
    svg = d3.select("#lineplotContainer").append("svg")
        .attr("width", "100%")
        .attr("height", "90%")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    div = d3.select("#lineplotContainer").append("div")
        .attr("class", "tooltiptext")
        .style("opacity", 0);

    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueline);

    svg.append("g")
        .attr("class", "x axis-text")
        .attr("transform", "translate(0," + (height + 15) + ")")
        .call(xAxis);

    svg.append("text")
        .attr("y", height + 70)
        .attr("dx", width / 2 - margin.left)
        .attr("text-anchor", "start")
        .attr("fill", "white")
        .text('Number of Clusters (k)')

    svg.append("line")
        .attr("x1", x(4))
        .attr("x2", x(4))
        .attr("y1", y(d3.min(data, function (d) { return d.inertia; })))
        .attr("y2", y(d3.max(data, function (d) { return d.inertia; })))
        .attr("stroke", 'white')
        .attr("stroke-dasharray", "5,5")
        .attr("stroke-width", 3)

    svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", function (d, i) { return x(i + 1) })
        .attr("cy", function (d) { return y(d.inertia) })
        .attr("r", 5)
        .on("mouseover", function (d, i) {
            var html = "<span style='font-weight: bolder; color: black;'>" +
                (i + 1) + "</span>" +
                "<br/><span style='color: orange;'> " +
                (Math.round((d.inertia * 1000)) / 1000) + "</span>";

            div.transition()
                .duration(200)
                .style("opacity", 1);
            div.html(html)
                .style("left", parseFloat(d3.select(this).attr("cx")) + 110 + "px")
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
        .attr("fill", "white")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -90)
        .attr("text-anchor", "end")
        .text("Sum of Squared Errors")

}
