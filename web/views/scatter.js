define(['d3', 'views/absXYView'], function(d3, AbsXYView) {
    var Scatter = function (data, obj) {
        AbsXYView.call(this, data, obj);
    };
    Scatter.prototype = Object.create(AbsXYView.prototype);
    Scatter.prototype.class = Scatter;
    var _super = AbsXYView.prototype;

    function set_domain(x_or_y, data, accessor) {
        var min = d3.min(data);
        var max = d3.max(data);
        if (min == max) {
            x_or_y.domain([min - 1, max + 1]).nice();
        } else {
            x_or_y.domain([min, max]).nice();
        }
    }

    Scatter.prototype.getScale = function (data, dimension) {
        var x = d3.scale.linear().range([0, dimension.width]);
        var y = d3.scale.linear().range([0, dimension.height]);
        set_domain(x, d3.extent(data, function (d) {
            return d.x;
        }));
        set_domain(y, d3.extent(data, function (d) {
            return d.y;
        }));

        return {
            x: x,
            y: y
        };
    };

    Scatter.prototype.drawData = function () {
        var ctx = this.ctx,
            x = ctx.scale.x,
            y = ctx.scale.y;

        ctx.svg.selectAll(".dot")
            .data(ctx.data)
            .enter().append("circle")
            .attr("class", "dot")
            .style("fill", "steelblue")
            .attr("r", 2)
            .attr("cx", function (d) {
                return x(d.x);
            })
            .attr("cy", function (d) {
                return y(d.y);
            });

    };
    return Scatter;
});