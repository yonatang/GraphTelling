define(['d3', '../views/bars'], function (d3, bars) {

    return function (ctx, map, newData, callback) {
        var map = JSON.parse(JSON.stringify(map));
        var mapByFrom = {},
            newDataById = {},
            mapByTo = {};

        var new_ctx = bars.generateContext(newData);
        new_ctx.svg = ctx.svg;

        var width = ctx.dimension.width,
            height = ctx.dimension.height;

        var new_y = new_ctx.scale.y,
            new_x = new_ctx.scale.x;

        newData.forEach(function (newDataPoint) { newDataById[newDataPoint.id] = newDataPoint; });

        var map_array=[];
        map.forEach(function (m) {
            mapByFrom[m.from] = m;
            if (!mapByTo[m.to]) {
                mapByTo[m.to] = 0;
            }
            mapByFrom[m.from].height = newDataById[m.to].height;
            mapByFrom[m.from].bucket = newDataById[m.to].bucket;
            m['count'] = mapByTo[m.to];
            mapByTo[m.to]++;
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
            m.order = i;
        });

        var endAnimationCb = function () {
            d3.selectAll('.tmpbar').remove();
            ctx.svg.selectAll('.x.axis').remove();
            ctx.svg.selectAll('.y.axis').remove();
            bars.draw('#view1', new_ctx);
            console.log('all done');
            if (callback){
                callback(new_ctx);
            }
        };

        var blockHeight = new_y(0) - new_y(1);
        var n = 0;
        var tickDuration = 2500 / map.length;
        d3.selectAll('.dot')
            .transition()
            .delay(500)
            .transition()
            .duration(tickDuration)
            .delay(function (d) { return 500 + mapByFrom[d.id].order * tickDuration; })
            .attr('cy', function (d) { return new_y(mapByFrom[d.id].count); })
            .attr('cx', function (d) { return new_x(mapByFrom[d.id].bucket); })
            .attr('r',2)
            .each(function() { ++n; })
            .each('end', function () {
                var dot = d3.select(this);
                d3.select(this.parentNode)
                    .append('rect')
                    .attr("class", "bar tmpbar")
                    // .style("fill", 'red')
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
});