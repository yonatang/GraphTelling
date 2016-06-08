define(['d3', '../views/scatter'], function (d3, scatter) {
    return function (ctx, mapScatterToBars, newData, callback) {
        var map = JSON.parse(JSON.stringify(mapScatterToBars));
        var mapByScatter = {},
            newDataById = {},
            dataById = {},
            mapByBar = {};

        var new_ctx = scatter.generateContext(newData);
        new_ctx.svg = ctx.svg;
        svg=ctx.svg;

        var width = ctx.dimension.width,
            height = ctx.dimension.height;

        var old_x = ctx.scale.x,
            old_y = ctx.scale.y;

        var new_y = new_ctx.scale.y,
            new_x = new_ctx.scale.x;

        ctx.data.forEach(function (dataPoint) { dataById[dataPoint.id] = dataPoint; });
        newData.forEach(function (newDataPoint) { newDataPoint[newDataPoint.id] = newDataPoint; });

        var map_array=[];
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
        console.log(map);
        map_array.sort(function (m1, m2) {
            if (m1.bucket != m2.bucket) {
                return m1.bucket - m2.bucket;
            }
            if (m1.count != m2.count) {
                return m2.count - m1.count;
            }
            return 0;
        });
        map_array.forEach(function (m, i) {
            m.order = i;
        });

        var endAnimationCb = function () {
            d3.selectAll('.tmp').remove();
            ctx.svg.selectAll('.x.axis').remove();
            ctx.svg.selectAll('.y.axis').remove();
            scatter.draw('#view1', new_ctx);
            console.log('all done');
            if (callback){
                callback(new_ctx);
            }
        };

        var blockHeight = old_y(0) - old_y(1);
        // var n = 0;
        var tickDuration = 2500 / map.length;
        console.log(newData);
        var tmpBlocks=svg.selectAll('.tmpBlock')
            .data(newData)
            .enter()
            .append('rect')
            .attr('class', 'tmp')
            .style('fill', 'steelblue')
            .attr('y',function(d) { return old_y(mapByScatter[d.id].count+1); })
            .attr('x',function(d) { return old_x(mapByScatter[d.id].bucket); })
            .attr('height', blockHeight)
            .attr('width', 5);
        svg.selectAll('.bar').remove();

        var n=0;
        tmpBlocks
            .transition()
            .delay(500)
            .transition()
            .duration(tickDuration)
            .delay(function (d) { return 500 + mapByScatter[d.id].order * tickDuration; })
            // .attr("y", function (d) { return old_y(mapByScatter[d.id].count); })
            .attr("height", 0)
            .each(function() { ++n; })
            .each('end', function(){
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
                    .duration(tickDuration)
                    .attr('cx', new_x(d.x))
                    .attr('cy', new_y(d.y))
                    .each('end', function () {
                        if (!--n) endAnimationCb.apply(this);
                        bar.remove();
                    });
            });
        return new_ctx;
    }
});
