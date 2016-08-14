define(['d3', 'views/absXYView'], function(d3, AbsXYView) {
    var Bars = function (data, obj) {
        AbsXYView.call(this, data, obj);
    };
    Bars.prototype = Object.create(AbsXYView.prototype);
    Bars.prototype.class = Bars;
    var _super = AbsXYView.prototype;

    Bars.prototype.getScale = function (data, dimension) {
        var width = dimension.width,
            height = dimension.height;

        var x = d3.scale.ordinal()
            .domain(data.map(function(d){return d.bucket;}))
            .rangeBands([0, width],0.1);
        var y = d3.scale.linear().range([height, 0]);
        y.domain(d3.extent(data, function (d) { return d.height; })).nice();
        return {
            x: x,
            y: y
        };
    };

    Bars.prototype.drawData = function () {
        var ctx = this.ctx,
            x = ctx.scale.x,
            y = ctx.scale.y,
            height = ctx.dimension.height;

        console.log(x.rangeBand());
        ctx.svg.selectAll(".bar")
            .data(ctx.data)
            .enter().append("rect")
            .attr("class", "bar")
            .style("fill", "steelblue")
            .attr("x", function (d) { return x(d.bucket); })
            .attr("width", x.rangeBand())
            .attr("y", function (d) { return y(d.height); })
            .attr("height", function (d) { return height - y(d.height); });
    };

    return Bars;
});