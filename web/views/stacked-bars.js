define(['d3', 'views/absXYView'], function(d3, AbsXYView) {
    function StackedBars(data, obj){
        AbsXYView.call(this, data, obj);
    }
    StackedBars.prototype = Object.create(AbsXYView.prototype);
    StackedBars.prototype.class = StackedBars;
    var _super=AbsXYView.prototype;

    var getGroups = function(data) {
        var groups=d3.set();
        data.forEach(function (d) {
            groups.add(d.group || 0);
        });
        return groups.values();
    };

    StackedBars.prototype.getXAxis = function(scaleX){
        if (scaleX.domain().length>2){
            //probaby grouped. TODO!!! need more context here.
            var ranges=scaleX.range();
            var axisScale = d3.scale.ordinal();
            axisScale.domain(scaleX.domain());

            var newRanges=ranges.map(function (d,i) { if (i==0||i==ranges.length-1) return d; return d + scaleX.rangeBand()/2; });
            axisScale.range(newRanges);
            return _super.getXAxis(axisScale);
        } else {
            return _super.getXAxis(scaleX);
        }
    };
    StackedBars.prototype.getScale = function(data, dimension){

        var groupedFactor=0.8;
        var x;
        var y = d3.scale.linear().range([dimension.height, 0]);

        var xOrder = {};
        var xToGroup={};
        var groups=getGroups(data);
        data.forEach(function (d) {
            xOrder[d.x] = d.xOrder;
            xToGroup[d.x] = d.group || 0;
        });

        y.domain([d3.min(data.sort(), function (d) { return d.y0; }), d3.max(data, function (d) { return d.y1; })]);

        var xVals=d3.set(data.map(function (d) { return d.x; })).values().sort(function(a,b){return xOrder[a]-xOrder[b]});

        var tmpX = d3.scale.ordinal();
        tmpX.domain(xVals)
            .rangeBands([0, dimension.width], 0.1);

        if (groups.length>1) {
            // This is grouped data set. Hack it to group values together.
            x = d3.scale.ordinal();
            var newXVals = [' '].concat(xVals).concat('  ');

            var groupArray = [];
            xVals.forEach(function (xVal) {
                groupArray.push(xToGroup[xVal]);
            });
            var domain = tmpX.domain();
            var range = tmpX.range();
            var firstColumn = range[0];
            var rangeBand = tmpX.rangeBand() * groupedFactor;

            range = range.map(function (d, i) {
                return d * groupedFactor + dimension.width * ((1 - groupedFactor) / 8) * groupArray[i] + rangeBand / 2;
            });

            x.domain([' '].concat(domain).concat(['  ']));
            x.range([0].concat(range).concat(dimension.width));
            x.rangeBand = function () { return rangeBand };
        } else {
            // There's only a single group. No need to hack anything.
            x=tmpX;
        }

        return {
            x: x,
            y: y
        };
    };

    StackedBars.prototype.drawData = function(){
        var ctx = this.ctx,
            x = ctx.scale.x,
            y = ctx.scale.y;

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