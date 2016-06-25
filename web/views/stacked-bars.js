define(['d3', 'views/absXYView'], function(d3, AbsXYView){
    var StackedBars = function(){
        AbsXYView.call();
    };
    StackedBars.prototype = Object.create(AbsXYView.prototype);
    StackedBars.prototype.class = StackedBars;
    var _super=AbsXYView.prototype;

    StackedBars.prototype.getScale = function(data, dimension){
        var x = d3.scale.ordinal();//.range([0, width]).rangePoints([0, width],1);
        var y = d3.scale.linear().range([dimension.height, 0]);

        var xOrder = {};
        data.forEach(function (d) {
            xOrder[d.x] = d.xOrder;
        });

        y.domain([d3.min(data.sort(), function (d) { return d.y0; }), d3.max(data, function (d) { return d.y1; })]);

        x.domain(data.map(function (d) { return d.x; }).sort(function(a,b){return xOrder[a]-xOrder[b]}))
            .rangeBands([0,dimension.width],0.1);
        return {
            x: x,
            y: y
        };
    };

    StackedBars.prototype.drawData = function(ctx){
        var x=ctx.scale.x,
            y=ctx.scale.y;
        ctx.svg.selectAll(".bar")
            .data(ctx.data)
            .enter().append("rect")
            .attr("class", "bar")
            .style("fill", function(d){ return d.color; })
            .attr("x", function (d) { return x(d.x); })
            .attr("width", x.rangeBand())
            .attr("y", function (d) { return y(d.y1); })
            .attr("height", function (d) { return y(d.y0) - y(d.y1); });
    };
    return StackedBars;
});