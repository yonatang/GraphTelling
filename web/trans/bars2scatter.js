define(['d3', '../views/scatter', '../views/bars'], function (d3, scatter, bars) {

    var TOTAL_DURATION = 1500;

    function processMap(mapScatterToBars, barsData, scatterData, isScatterToBar) {
        var map = JSON.parse(JSON.stringify(mapScatterToBars));
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
                return isScatterToBar ? m1.count - m2.count : m2.count - m1.count;
            }
            return 0;
        });
        map_array.forEach(function (m, i) {
            m.order = i;
        });
        return {mapByScatter: mapByScatter, mapByBar: mapByBar, oldDataById: barsData, newDataById: newDataById};
    }

    function getEndAnimationCallback(ctx, newView, callback, newCtx) {
        return function endAnimationCb() {
            d3.selectAll('.tmp').remove();
            ctx.svg.selectAll('.x.axis').remove();
            ctx.svg.selectAll('.y.axis').remove();
            newView.draw('#view1', newCtx);
            if (callback) {
                callback(newCtx);
            }
        }
    }

    function b2s(ctx, mapScatterToBars, scatterData, callback) {
        var mapByScatter = processMap(mapScatterToBars,ctx.data,scatterData ,false).mapByScatter;

        var new_ctx = scatter.generateContext(scatterData);
        new_ctx.svg = ctx.svg;
        var svg=ctx.svg;

        var width = ctx.dimension.width,
            height = ctx.dimension.height;

        var old_x = ctx.scale.x,
            old_y = ctx.scale.y;

        var new_y = new_ctx.scale.y,
            new_x = new_ctx.scale.x;

        var endAnimationCb = getEndAnimationCallback(ctx,scatter,callback, new_ctx);

        var blockHeight = old_y(0) - old_y(1);
        var tickDuration = TOTAL_DURATION / mapScatterToBars.length;
        var tmpBlocks=svg.selectAll('.tmpBlock')
            .data(scatterData)
            .enter()
            .append('rect')
            .attr('class', 'tmp')
            .style('fill', 'steelblue')
            .attr('y',function(d) { return old_y(mapByScatter[d.id].count + 1); })
            .attr('x',function(d) { return old_x(mapByScatter[d.id].bucket); })
            .attr('height', blockHeight)
            .attr('width', 5);
        svg.selectAll('.bar').remove();

        var n=0;
        var total=scatterData.length;

        tmpBlocks
            .transition()
            // .delay(INITIAL_DELAY)
            .transition()
            .duration(tickDuration)
            .delay(function (d) { return mapByScatter[d.id].order * tickDuration; })
            .attr("height", 0)
            .each(function() { ++n; })
            .each('end', function(dd,i){
                var bar = d3.select(this),
                    d=bar.data()[0];
                d3.select(this.parentNode)
                    .append('circle')
                    .attr('class','tmp circle')
                    .style('fill', 'steelblue')
                    .attr('r',2)
                    .attr('cx', bar.attr('x'))
                    .attr('cy', bar.attr('y'))
                    .transition()
                    .duration(500)
                    .attr('cx', new_x(d.x))
                    .attr('cy', new_y(d.y))
                    .each('end', function () {
                        if (!--n) endAnimationCb.apply(this);
                        bar.remove();
                    });
            });
        return new_ctx;
    }

    function s2b (ctx, mapScatterToBars, barsData, callback) {
        var mapByFrom = processMap(mapScatterToBars, barsData, ctx.data, true).mapByScatter;
        var new_ctx = bars.generateContext(barsData);
        new_ctx.svg = ctx.svg;

        var width = ctx.dimension.width,
            height = ctx.dimension.height;

        var new_y = new_ctx.scale.y,
            new_x = new_ctx.scale.x;

        var endAnimationCb = getEndAnimationCallback(ctx,bars,callback, new_ctx);

        var blockHeight = new_y(0) - new_y(1);
        var n = 0;
        var tickDuration = TOTAL_DURATION / mapScatterToBars.length;
        d3.selectAll('.dot')
            .transition()
            .transition()
            .duration(500)
            .delay(function (d) { return mapByFrom[d.id].order * tickDuration; })
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
                        if (!--n) endAnimationCb.apply(this);
                        dot.remove();
                    });
            });
        return new_ctx;
    }

    return { b2s: b2s, s2b:s2b}
});
