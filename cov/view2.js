(function(window) {
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;


    var x = d3.scale.linear().range([0, width]);//.range([0, width]);


    var y = d3.scale.linear().range([height,0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var svg = d3.select("#view2").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    d3.csv('histogram.csv', function (err, data) {
        if (err) throw err;

        data.forEach(function (d) {
            d.x = +d.x;
            d.y = +d.y;
        });

        x.domain(d3.extent(data, function (d) {
            return d.x;
        })).nice();
        y.domain(d3.extent(data, function (d) {
            return d.y;
        })).nice();

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.x); })
            .attr("width",5)
            .attr("y", function(d) { return y(d.y); })
            .attr("height", function(d) { return  height-y(d.y); });


    });
})(window);