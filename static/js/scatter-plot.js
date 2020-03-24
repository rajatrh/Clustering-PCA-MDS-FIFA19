// var scatterMaxPC1 = { min: -10, max: -10}
// var scatterMaxPC2 = { min: -10, max: -10}

function draw_scatter_plot(eigen_values, container="scatterplotContainer") {
    var mData = JSON.parse(eigen_values);
    var data = modifyDataSet(mData)

    document.getElementById(container).innerHTML = "";

    var margin = { top: 20, right: 20, bottom: 50, left: 70 };
    var width = parseInt(d3.select("#" + container).style("width")) - margin.left - margin.right;
    var height = 420 - margin.top - margin.bottom;

    var svg
    svg = d3.select("#" + container).append("svg")
        .attr("width", "100%")
        .attr("height", "90%")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    var x = d3.scaleLinear()
        .domain([
            d3.min(data, function (d) { return d.x - 1; }),
            d3.max(data, function (d) { return d.x + 1; })])
        .range([0, width]);

    svg.append("g")
        .attr("transform", "translate(0," + (height + 15) + ")")
        .call(d3.axisBottom(x));

    var y = d3.scaleLinear()
        .domain(
            [
                d3.min(data, function (d) { return d.y - 1; }),
                d3.max(data, function (d) { return d.y + 1; })]
        )
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y));


    // Color scale: give me a specie name, I return a color
    var color = d3.scaleOrdinal()
        .domain([0, 1, 2, 3, 4, 5])
        .range(["red", "green", "yellow", "blue", "violet", "gray"])


    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.x); })
        .attr("cy", function (d) { return y(d.y); })
        .attr("r", 3)
        .style("opacity", 0.5)
        .style("fill", function (d) { return color(d.cluster) })

    svg.append("text")
        .attr("y", height + 70)
        .attr("dx", width / 2 - margin.left)
        .attr("text-anchor", "start")
        .text('PCA 2')

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "end")
        .text("PCA 1")

    //     .on("mouseover", function (d, i) {
    //         var html = "<span style='font-weight: bolder; color: teal;'>" +
    //             (i + 1) + "</span>" +
    //             "<br/><span style='color: orange;'> " +
    //             (Math.round((d.pcaCumSum * 100000)) / 1000) + "%</span>";

    //         div.transition()
    //             .duration(200)
    //             .style("opacity", 1);
    //         div.html(html)
    //             .style("left", parseFloat(d3.select(this).attr("cx")) + 38 + "px")
    //             .style("top", parseFloat(d3.select(this).attr("cy")) - 40 + "px")
    //             .style("line-height", "18px");
    //     }).on("mouseout", function (d) {
    //         div.transition()
    //             .duration(500)
    //             .style("opacity", 0);
    //     });
}

function modifyDataSet(data) {

    newData = []
    for (let i = 0; i < Object.keys(data['0']).length; i++) {
        newData.push({ 'x': data['0'][i], 'y': data['1'][i], cluster: data['cluster'][i] })
    }

    return newData
}
