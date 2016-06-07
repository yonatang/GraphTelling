define(['d3'],function(d3) {
    function set_domain(x_or_y, data, accessor){
        var min=d3.min(data);
        var max=d3.max(data);
        if (min==max){
            x_or_y.domain([min-1,max+1]).nice();
        } else {
            x_or_y.domain([min,max]).nice();
        }
    }
    return function (data, selector) {
        var margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;


        var x = d3.scale.linear().range([0, width]);

        var y = d3.scale.linear().range([0, height]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var svg = d3.select(selector).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        set_domain(x,d3.extent(data, function (d) {return d.x;}));
        set_domain(y,d3.extent(data, function (d) {return d.y;}));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);
        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .style("fill", function (d) {
                return "steelblue";
            })
            .attr("r", 1)
            .attr("cx", function (d) {
                return x(d.x);
            })
            .attr("cy", function (d) {
                return y(d.y);
            });

    };
});