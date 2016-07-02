define(['trans/absTrans', '../views/scatter', '../views/bars'], function (AbsTrans, Scatter, Bars) {
    function Bars2Scatter() {
        AbsTrans.call(this, Bars, Scatter);
    };
    Bars2Scatter.prototype = Object.create(AbsTrans.prototype);
    Bars2Scatter.prototype.class = Bars2Scatter;
    var _super = AbsTrans.prototype;

    var TOTAL_DURATION = 1500;

    Bars2Scatter.prototype.processMap = function (aData, bData, mapData) {
        // mapData: scatter -> bars
        // aData: barsData
        // bData: Scatter

        var barsData = aData,
            scatterData = bData;

        var map = JSON.parse(JSON.stringify(mapData));
        var mapByScatter = {},
            mapByBar = {},
            dataById = {},
            newDataById = {};

        barsData.forEach(function (dataPoint) {
            dataById[dataPoint.id] = dataPoint;
        });
        scatterData.forEach(function (dataPoint) {
            newDataById[dataPoint.id] = dataPoint;
        });
        var map_array = [];
        map.forEach(function (m) {
            mapByScatter[m.from] = m;
            if (!mapByBar[m.to]) {
                mapByBar[m.to] = 0;
            }
            mapByScatter[m.from].height = dataById[m.to].height;
            mapByScatter[m.from].bucket = dataById[m.to].bucket;
            m['count'] = mapByBar[m.to];
            mapByBar[m.to]++;
            map_array.push(m);
        });
        map_array.sort(function (m1, m2) {
            if (m1.bucket != m2.bucket) {
                return m1.bucket - m2.bucket;
            }
            if (m1.count != m2.count) {
                return m1.count - m2.count;
            }
            return 0;
        });
        map_array.forEach(function (m, i) {
            m.orderBtoS = i;
            m.orderStoB = map_array.length - i - 1;
        });
        return {mapByScatter: mapByScatter, mapByBar: mapByBar, oldDataById: barsData, newDataById: newDataById,
            mapData: mapData};
    };

    Bars2Scatter.prototype.transformAtoB = function (oldView, mapCtx, newView, options, callback) {
        return barsToScatter.apply(this, [oldView, mapCtx, newView, options, callback]);
    };

    Bars2Scatter.prototype.transformBtoA = function (oldView, mapCtx, newView, options, callback) {
        return scatterToBars.apply(this, [oldView, mapCtx, newView, options, callback]);
    };

    var barsToScatter = function(barsView, mapCtx, scatterView, options, callback) {
        var utils = this.utils,
            d3 = this.d3;

        var ctx = barsView.ctx,
            mapByScatter = mapCtx.mapByScatter,
            new_ctx = scatterView.ctx,
            scatterData = scatterView.ctx.data;

        new_ctx.svg = ctx.svg;
        var svg = ctx.svg;

        var width = ctx.dimension.width,
            height = ctx.dimension.height;

        var old_x = ctx.scale.x,
            old_y = ctx.scale.y;

        var new_y = new_ctx.scale.y,
            new_x = new_ctx.scale.x;

        barsView.prepareForAnimation();

        if (!utils.equals(ctx.scale.x.domain(), new_ctx.scale.x.domain())) {
            barsView.hideXAxisTicks();
        }
        if (!utils.equals(ctx.scale.y.domain(), new_ctx.scale.y.domain())) {
            barsView.hideYAxisTicks();
        }
        
        var blockHeight = old_y(0) - old_y(1);
        var tickDuration = TOTAL_DURATION / mapCtx.mapData.length;
        var tmpBlocks = svg.selectAll('.tmpBlock')
            .data(scatterData)
            .enter()
            .append('rect')
            .attr('class', 'tmp')
            .style('fill', 'steelblue')
            .attr('y', function (d) { return old_y(mapByScatter[d.id].count + 1); })
            .attr('x', function (d) { return old_x(mapByScatter[d.id].bucket); })
            .attr('height', blockHeight)
            .attr('width', 5);
        svg.selectAll('.bar').remove();

        var n = 0;
        var total = scatterData.length;

        tmpBlocks
            .transition()
            // .delay(INITIAL_DELAY)
            .transition()
            .duration(tickDuration)
            .delay(function (d) { return mapByScatter[d.id].orderBtoS * tickDuration; })
            .attr("height", 0)
            .each(function () { ++n; })
            .each('end', function (dd, i) {
                var bar = d3.select(this),
                    d = bar.data()[0];
                d3.select(this.parentNode)
                    .append('circle')
                    .attr('class', 'tmp circle')
                    .style('fill', 'steelblue')
                    .attr('r', 2)
                    .attr('cx', bar.attr('x'))
                    .attr('cy', bar.attr('y'))
                    .transition()
                    .duration(500)
                    .attr('cx', new_x(d.x))
                    .attr('cy', new_y(d.y))
                    .each('end', function () {
                        if (!--n) callback.apply(this, [scatterView]);
                        bar.remove();
                    });
            });
        return scatterView;
    };

    function scatterToBars (scatterView, mapCtx, barsView, options, callback){
        var utils = this.utils,
            d3 = this.d3;

        var ctx = scatterView.ctx,
            mapByFrom = mapCtx.mapByScatter,
            new_ctx = barsView.ctx;

        var width = ctx.dimension.width,
            height = ctx.dimension.height;

        var new_y = new_ctx.scale.y,
            new_x = new_ctx.scale.x;

        scatterView.prepareForAnimation();

        if (!utils.equals(ctx.scale.x.domain(), new_ctx.scale.x.domain())) {
            barsView.hideXAxisTicks();
        }
        if (!utils.equals(ctx.scale.y.domain(), new_ctx.scale.y.domain())) {
            barsView.hideYAxisTicks();
        }

        var blockHeight = new_y(0) - new_y(1);
        var n = 0;
        var tickDuration = TOTAL_DURATION / mapCtx.mapData.length;
        d3.selectAll('.dot')
            .transition()
            .transition()
            .duration(500)
            .delay(function (d) { return mapByFrom[d.id].orderStoB * tickDuration; })
            .attr('cy', function (d) { return new_y(mapByFrom[d.id].count); })
            .attr('cx', function (d) { return new_x(mapByFrom[d.id].bucket); })
            .attr('r',2)
            .each(function() { ++n; })
            .each('end', function () {
                var dot = d3.select(this);
                d3.select(this.parentNode)
                    .append('rect')
                    .attr("class", "bar tmp")
                    .style("fill", "steelblue")
                    .attr("x", dot.attr('cx') - 0)
                    .attr("width", 5)
                    .attr("y", dot.attr('cy'))
                    .attr("height", 0)
                    //
                    .transition()
                    .duration(tickDuration)
                    .attr('r', 0)
                    .attr("height", blockHeight)
                    .attr("y", dot.attr('cy') - blockHeight)
                    .each('end', function () {
                        if (!--n) callback.apply(this, [barsView]);
                        dot.remove();
                    });
            });
        return barsView;
    }
    return new Bars2Scatter();

});