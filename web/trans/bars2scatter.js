define(['trans/absTrans', '../views/scatter', '../views/bars'], function (AbsTrans, Scatter, Bars) {
    function Bars2Scatter() {
        AbsTrans.call(this, Bars, Scatter);
    };
    Bars2Scatter.prototype = Object.create(AbsTrans.prototype);
    Bars2Scatter.prototype.class = Bars2Scatter;
    var _super = AbsTrans.prototype;

    Bars2Scatter.prototype.defaults = {
        "type": "type1",
        "duration": 1500
    };

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
            return m1.count - m2.count;
        });
        map_array.forEach(function (m, i) {
            m.orderStoB = i;
        });

        map_array.sort(function (m1, m2) {
            if (m1.bucket != m2.bucket) {
                return m1.bucket - m2.bucket;
            }
            return m2.count - m1.count;

        });
        map_array.forEach(function (m, i) {
            m.orderBtoS = i;//map_array.length - i - 1;
        });

        return {mapByScatter: mapByScatter, mapByBar: mapByBar, oldDataById: barsData, newDataById: newDataById,
            mapData: mapData};
    };

    Bars2Scatter.prototype.transformAtoB = function (oldView, mapCtx, newView, options, callback) {
        if (options.type=='type1') {
            return barsToScatterType1.apply(this, [oldView, mapCtx, newView, options, callback]);
        } else {
            return barsToScatterType2.apply(this, [oldView, mapCtx, newView, options, callback]);
        }
    };

    Bars2Scatter.prototype.transformBtoA = function (oldView, mapCtx, newView, options, callback) {
        if (options.type=='type1') {
            return scatterToBarsType1.apply(this, [oldView, mapCtx, newView, options, callback]);
        } else {
            return scatterToBarsType2.apply(this, [oldView, mapCtx, newView, options, callback]);
        }
    };

    Bars2Scatter.prototype.preAnimation = function(oldCtx, newCtx, view){
        var utils=this.utils;
        view.prepareForAnimation();
        if (!utils.equals(oldCtx.scale.x.domain(), newCtx.scale.x.domain())) {
            view.hideXAxisTicks();
        }
        if (!utils.equals(oldCtx.scale.y.domain(), newCtx.scale.y.domain())) {
            view.hideYAxisTicks();
        }
    };
    function barsToScatterType1 (barsView, mapCtx, scatterView, options, callback) {
        var d3 = this.d3;

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

        this.preAnimation(ctx, new_ctx, barsView);

        var blockHeight = old_y(0) - old_y(1);
        var tickDuration = options.duration / mapCtx.mapData.length;
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
    }

    function barsToScatterType2 (barsView, mapCtx, scatterView, options, callback) {
        var d3 = this.d3;

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

        this.preAnimation(ctx, new_ctx, barsView);

        var blockHeight = old_y(0) - old_y(1);
        var tickDuration = options.duration / mapCtx.mapData.length;
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

        tmpBlocks
            .transition()
            .duration(500)
            .attr('y', function (d) { return (old_y(mapByScatter[d.id].count + 1) - old_y(0)) / blockHeight * 2 + height; })
            .attr('x', function (d) { return old_x(mapByScatter[d.id].bucket); })
            .attr('height', 2)
            .attr('width', 5)
            .each('end', function(){
                var bar = d3.select(this),
                    d = bar.data()[0];
                var newData = mapByScatter[d.id];
                this.parentNode.__data__=newData;
                d3.select(this.parentNode)
                    .append('circle')
                    .attr('class', 'tmp circle')
                    .style('fill', 'steelblue')
                    .attr('r', 2)
                    .attr('cx', bar.attr('x'))
                    .attr('cy', bar.attr('y'))
                    //
                    .transition()
                    // .duration(100)
                    .delay(function(d) { return d.orderBtoS * 3; })
                    .attr('cx', new_x(d.x))
                    .attr('cy', new_y(d.y))
                    .each(function(){ n++; })
                    .each('end', function (d) {
                        if (!--n) callback.apply(this, [scatterView]);
                    });
                bar.remove();
            });
        return scatterView;
    }
    function scatterToBarsType2 (scatterView, mapCtx, barsView, options, callback){
        var d3 = this.d3;

        var ctx = scatterView.ctx,
            mapByFrom = mapCtx.mapByScatter,
            new_ctx = barsView.ctx;

        var width = ctx.dimension.width,
            height = ctx.dimension.height;

        var new_y = new_ctx.scale.y,
            new_x = new_ctx.scale.x;

        this.preAnimation(ctx, new_ctx, scatterView);

        var blockHeight = new_y(0) - new_y(1);
        var n = 0;

        var dotSize=2,
            dotSpacing=1,
            growAll;

        d3.selectAll('.dot')
            .transition()
            .duration(500)
            .delay(function (d) { return mapByFrom[d.id].orderStoB; })
            .attr('cy', function (d) {
                return height + ((new_y(mapByFrom[d.id].count) - new_y(0)) / blockHeight) * dotSize * dotSpacing;
            })
            .attr('cx', function (d) { return new_x(mapByFrom[d.id].bucket); })
            .attr('r',dotSize)
            .transition()
            .each(function() { ++n; })
            .each('end', function(d){
                var dot = d3.select(this);
                this.parentNode.__data__ = mapByFrom[d.id];
                d3.select(this.parentNode)
                    .append('rect')
                    .attr('class','bar tmp')
                    .style("fill",  "steelblue")
                    .attr("x", dot.attr('cx') - 0)
                    .attr("width", 5)
                    .attr("y", dot.attr('cy'))
                    .attr("height", dotSize);
                dot.remove();
                if (!--n) growAll();
            });

        growAll = function () {
            var n=0;
            d3.selectAll('.bar.tmp')
                .transition()
                .duration(500)
                .attr('x', function(d) { return new_x(d.bucket); })
                .attr('y', function(d) { return new_y(d.height); })
                .attr('height',function(d) { return height - new_y(d.height); })
                .attr('width',5)
                .each(function(d){ n++; })
                .each('end', function(){
                   if (!--n) callback.apply(this, [barsView]);
                });
        };
        return barsView;
    }

    function scatterToBarsType1 (scatterView, mapCtx, barsView, options, callback){
        var d3 = this.d3;

        var ctx = scatterView.ctx,
            mapByFrom = mapCtx.mapByScatter,
            new_ctx = barsView.ctx;

        var width = ctx.dimension.width,
            height = ctx.dimension.height;

        var new_y = new_ctx.scale.y,
            new_x = new_ctx.scale.x;

        this.preAnimation(ctx, new_ctx, scatterView);

        var blockHeight = new_y(0) - new_y(1);
        var n = 0;
        var tickDuration = options.duration / mapCtx.mapData.length;
        d3.selectAll('.dot')
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