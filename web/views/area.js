define(['d3', 'views/absXYView'], function(d3, AbsXYView) {
    var Area = function (data, obj) {
        AbsXYView.call(this, data, obj);
    };
    Area.prototype = Object.create(AbsXYView.prototype);
    Area.prototype.class = Area;
    var _super = AbsXYView.prototype;

    Area.prototype.getScale = function (data, dimension) {
        var width = dimension.width,
            height = dimension.height;

        var x=d3.scale.ordinal()
            .domain(data.map(function(d){return d.bucket;}))
            .rangePoints([0,width]);

        var y = d3.scale.linear().range([height, 0]);
        // y.domain(d3.extent(data, function (d) { return d.height; })).nice();
        y.domain([0,d3.max(data, function(d) { return d.y0 + d.y; })])
        console.log(y.domain())
        //d3.extent(data, function (d) { return d.height; })).nice();
        return {
                x: x,
                y: y
            };
    };
    // var x = d3.time.scale()
    //     .range([0, width]);
    // x.domain(d3.extent(data, function(d) { return d.date; }));
    //
    // var y = d3.scale.linear()
    //     .range([height, 0]);
    // y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

    Area.prototype.drawXAxis = function(){}
    Area.prototype.drawData = function () {
        var ctx = this.ctx,
            x = ctx.scale.x,
            y = ctx.scale.y,
            data = ctx.data;

        var nestedData= d3.nest()
            .key(function(d){ return d.set })
            .sortValues(
                function(a,b){
                    return a.set-b.set;
                }
            )
            .entries(data);
        console.log(nestedData);
        //https://bl.ocks.org/mbostock/3020685

        var stack = d3.layout.stack()
            .offset("zero")
            .values(function(d) { return d.values; })
            .x(function(d) { return d.bucket; })
            .y(function(d) { return d.height; });

        var layers = stack(nestedData);
        y.domain([0,d3.max(data, function(d) { return d.y0 + d.y; })])

        var area = d3.svg.area()
            .interpolate("cardinal")
            .x(function(d) {console.log(d.bucket,x(d.bucket));
                return x(d.bucket); })
            .y0(function(d) { return y(d.y0); })
            .y1(function(d) { return y(d.y0 + d.y); });

        ctx.svg.selectAll(".layer")
            .data(layers)
                .enter().append("path")
                .attr("class", "layer")
                .attr("d", function(d) { return area(d.values); })
                .style("fill", function(d, i) { return d.values[0].color; });
    };

    return Area;
});