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

    function draw(selector, ctx) {
        var data=ctx.data,
            xAxis = ctx.axis.xAxis,
            yAxis = ctx.axis.yAxis,
            x = ctx.scale.x,
            y = ctx.scale.y,
            width = ctx.dimension.width,
            height = ctx.dimension.height,
            margin = ctx.dimension.margin;

        var svg;
        if (ctx.svg){
            svg=ctx.svg;
        } else {
            svg = d3.select(selector).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            ctx.svg=svg;
        }

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
            .style("fill", "steelblue")
            .attr("r", 2)
            .attr("cx", function (d) { return x(d.x); })
            .attr("cy", function (d) { return y(d.y); });

    }
    function generateContext(data){
        var ctx = {};
        var margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var x = d3.scale.linear().range([0, width]);
        var y = d3.scale.linear().range([0, height]);
        set_domain(x, d3.extent(data, function (d) {return d.x;}));
        set_domain(y, d3.extent(data, function (d) {return d.y;}));

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");
        ctx.dimension = {
            width: width,
            height: height,
            margin:margin
        };
        ctx.axis = {
            xAxis: xAxis,
            yAxis: yAxis
        };
        ctx.scale = {
            x: x,
            y: y
        };
        ctx.data = data;
        return ctx;
    }

    var result = {
        generateContext : generateContext,
        draw : draw
    };
    return result;
});