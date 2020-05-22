function draw_pair_plot(jsonData, container = "scatterplotContainer") {
    var mData = JSON.parse(jsonData);
    var data = modifyDataSetForPairPlot(mData)
    columns = Object.keys(data[0]).filter(d => d !== "cluster")
    
    document.getElementById(container).innerHTML = "";

    var margin = { top: 20, right: 20, bottom: 50, left: 70 };

    padding = 20
    size = 220

    var svg
    svg = d3.select("#" + container).append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

   
    x = columns.map(c => d3.scaleLinear()
        .domain(d3.extent(data, d => d[c]))
        .rangeRound([padding / 2, size - padding / 2]))

    y = x.map(x => x.copy().range([size - padding / 2, padding / 2]))

    z = d3.scaleOrdinal()
        .domain([0, 1, 2, 3, 4, 5])
        .range(["red", "green", "yellow", "blue", "violet", "gray"])

    const axisX = d3.axisBottom()
        .ticks(6)
        .tickSize(size * columns.length);
    xAxis = svg.append("g").selectAll("g").data(x).join("g")
        .attr("transform", (d, i) => `translate(${i * size},0)`)
        .each(function (d) { return d3.select(this).call(axisX.scale(d)); })
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").attr("stroke", "#ddd"))


    const axisY = d3.axisLeft()
        .ticks(6)
        .tickSize(-size * columns.length)

    yAxis = svg.append("g").selectAll("g").data(y).join("g")
        .attr("transform", (d, i) => `translate(0,${i * size})`)
        .each(function (d) { return d3.select(this).call(axisY.scale(d)); })
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").attr("stroke", "#ddd"))

    const cell = svg.append("g")
        .selectAll("g")
        .data(d3.cross(d3.range(columns.length), d3.range(columns.length)))
        .join("g")
        .attr("transform", ([i, j]) => `translate(${i * size},${j * size})`);

    cell.append("rect")
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 5)
        .attr("x", padding / 2 + 0.5)
        .attr("y", padding / 2 + 0.5)
        .attr("width", size - padding)
        .attr("height", size - padding);

    cell.each(function ([i, j]) {
        d3.select(this).selectAll("circle")
            .data(data)
            .join("circle")
            .attr("cx", d => x[i](d[columns[i]]))
            .attr("cy", d => y[j](d[columns[j]]));
    });

    const circle = cell.selectAll("circle")
        .attr("r", 3.5)
        .attr("fill-opacity", 0.8)
        .attr("fill", d => z(d.cluster));

    svg.append("g")
        .attr("fill", "white")
        .style("pointer-events", "none")
        .selectAll("text")
        .data(columns)
        .join("text")
        .attr("transform", (d, i) => `translate(${i * size},${i * size})`)
        .attr("x", padding)
        .attr("y", padding)
        .attr("dy", ".71em")
        .text(d => d);
}

function modifyDataSetForPairPlot(data) {

    newData = []
    keys = []
    minLen = 100000
    Object.keys(data).forEach(key => {
        keys.push(key)
        minLen = Math.min(minLen, Object.keys(data[key]).length)
    });

    for (let i = 0; i < minLen; i++) {
        obj = {}
        keys.forEach(k => {
            obj[k] = data[k][i]
        })
        newData.push(obj)
    }

    console.log(newData)
    return newData
}
