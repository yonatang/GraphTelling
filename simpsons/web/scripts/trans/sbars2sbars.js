define(['d3', 'utils', '../views/stacked-bars'], function (d3, utils, stackedBars) {

    var clone = utils.clone;
    var forEach = utils.forEach;

    function processMap(oldData, newData, mapBarsToBars) {
        var map = clone(mapBarsToBars);
        var mapByOldBar = {},
            mapByNewBar = {},
            oldDataById = {},
            newDataById = {};

        oldData.forEach(function (dataPoint) {
            oldDataById[dataPoint.id] = dataPoint;
        });
        newData.forEach(function (dataPoint) {
            newDataById[dataPoint.id] = dataPoint;
        });
        map.forEach(function (m) {
            if (!mapByOldBar[m.from]) {
                mapByOldBar[m.from] = {to: [], sum: 0}
            }
            var newDataPoint = clone(newDataById[m.to]);
            var oldDataPoint = clone(oldDataById[m.from]);

            mapByOldBar[m.from].from = oldDataPoint;
            mapByOldBar[m.from].to.push(newDataPoint);
            mapByOldBar[m.from].sum += newDataPoint.y1 - newDataPoint.y0;
            if (!mapByNewBar[m.to]) {
                mapByNewBar[m.to] = {to: newDataPoint, from: [], sum: 0}
            }
            mapByNewBar[m.to].from.push(oldDataPoint);
            mapByNewBar[m.to].sum += oldDataPoint.y1 - oldDataPoint.y0;
        });

        var transitElements = [];
        var tmpXOrderMap = {};

        var destY0s = {};
        forEach(mapByOldBar, function(mapping) {
            var parentOldDataPoint = mapping.from;
            var parentOldHeight = parentOldDataPoint.y1 - parentOldDataPoint.y0;
            var srcY0 = parentOldDataPoint.y0;

            forEach(mapping.to, function (parentNewDataPoint) {
                var oldPartsSum = mapping.sum;

                var parentNewHeight = parentNewDataPoint.y1 - parentNewDataPoint.y0;
                var transitObj = {};
                transitObj.parentOldDataPoint = parentOldDataPoint;
                transitObj.parentNewDataPoint = parentNewDataPoint;

                // generate the source properties of the transition object
                transitObj.srcY0 = srcY0;
                transitObj.srcY1 = srcY0 + parentOldHeight * (parentNewHeight / oldPartsSum);
                transitObj.srcX = parentOldDataPoint.x;
                transitObj.srcId = parentOldDataPoint.id;
                transitObj.srcXOrder = parentOldDataPoint.xOrder;
                if (!tmpXOrderMap[transitObj.srcXOrder]) {
                    tmpXOrderMap[transitObj.srcXOrder] = 0;
                }
                transitObj.srcYOrder = tmpXOrderMap[transitObj.srcXOrder];
                transitObj.srcColor = parentOldDataPoint.color;
                tmpXOrderMap[transitObj.srcXOrder]++;
                srcY0 = transitObj.srcY1;

                var newPartsSum = mapByNewBar[parentNewDataPoint.id].sum;

                if (!destY0s[parentNewDataPoint.id]) {
                    destY0s[parentNewDataPoint.id]=parentNewDataPoint.y0;
                }

                //generate the destination properties of the transition object
                transitObj.destId = parentNewDataPoint.id;
                transitObj.destY0 = destY0s[parentNewDataPoint.id];
                transitObj.destY1 = transitObj.destY0 + parentOldHeight * (parentNewHeight/newPartsSum);
                transitObj.destX = parentNewDataPoint.x;
                transitObj.destColor = parentNewDataPoint.color;
                destY0s[parentNewDataPoint.id] = transitObj.destY1;
                transitElements.push(transitObj);
            })
        });

        return {
            transitElements : transitElements,
            newDataById : newDataById, oldDataById : oldDataById,
            mapByOldBar: mapByOldBar, mapByNewBar:mapByNewBar};
    }

    function endAnimationCb(oldCtx, newCtx, callback) {
        d3.selectAll('.tmp').remove();
        stackedBars.draw('#view1', newCtx);
        if (callback) {
            callback(newCtx);
        }
    }

    function sb2sb(ctx, mapBarsToBars, newData, opts, callback) {
        var defaults = {
            firstX: true,
            duration: 1000
        };
        var opts = $.extend({}, defaults, opts);

        var oldData = ctx.data;
        var mapData = processMap(oldData, newData, mapBarsToBars);
        var mapByOldBar = mapData.mapByOldBar,
            mapByNewBar = mapData.mapByNewBar,
            transitElements = mapData.transitElements;

        var new_ctx=stackedBars.generateContext(newData);
        new_ctx.svg = ctx.svg;

        var svg = ctx.svg,
            x = ctx.scale.x,
            y = ctx.scale.y;

        var new_x=new_ctx.scale.x,
            new_y=new_ctx.scale.y;


        var tmpBars= svg.selectAll("tmpBar")
          .data(transitElements)
            .enter().append("rect")

            .attr("class", "tmp")
            .style('stroke',function(d) { return d.srcColor; })
            .style("fill", function(d) { return d.srcColor; })
            .attr("x", function (d) { return x(d.srcX); })
            .attr("y", function(d) { return y(d.srcY1); })
            .attr("height", function(d) { return y(d.srcY0) - y(d.srcY1); })
            .attr("width", x.rangeBand());

        svg.selectAll('.bar').remove();

        var n=0;
        var anim=tmpBars
            .transition()
            .attr("y", function(d) { return y(d.srcY1) - 2 * d.srcYOrder; })
            .style('stroke', 'black')
            .style('fill-opacity', "0.4")
            .transition()
            .delay(500)
            .duration(opts.duration);

        stackedBars.hideAxises(ctx);

        function xAnim(anim) {
            var x_needed = false;
            if (x.rangeBand() != new_x.rangeBand()) {
                x_needed = true;
            }
            transitElements.forEach(function (d) {
                if (x(d.srcX) != new_x(d.destX)) {
                    x_needed = true;
                }
            });
            if (x_needed) {
                anim
                    .attr("width", new_x.rangeBand())
                    .attr("x", function (d) { return new_x(d.destX); });
            }
            return x_needed;
        }
        function yAnim(anim){
            var y_needed = false;
            transitElements.forEach(function (d) {
                if (new_y(d.destY0) - new_y(d.destY1) != y(d.srcY0) - y(d.srcY1) ||
                    new_y(d.destY1) != y(d.srcY1)) {
                    y_needed = true;
                }
            });
            if (y_needed) {
                anim
                    .attr("height", function (d) { return new_y(d.destY0) - new_y(d.destY1); })
                    .attr("y", function (d) { return new_y(d.destY1); });
            }
            return y_needed;
        }

        if (opts.firstX) {
            var needed = xAnim(anim);
            if (needed) {
                anim = anim.transition();
            }
            yAnim(anim);
        } else {
            var needed = yAnim(anim);
            if (needed) {
                anim = anim.transition();
            }
            xAnim(anim);
        }

        anim
            .style('fill-opacity', "1")
            .each(function() { ++n; })
            .each('end', function(){
                if (!--n){
                    setTimeout(function(){endAnimationCb(ctx, new_ctx, callback);},200);
                }
            });

    }
    function reverseMap(map){
        var rMap=utils.clone(map);
        rMap.forEach(function(item){
            var to=item.from;
            item.from=item.to;
            item.to=to;
        });
        return rMap;
    }
    function reverse(ctx, mapBarsToBars, newData, opts, callback){
        sb2sb(ctx, reverseMap(mapBarsToBars), newData, opts, callback);
    }
    return {
        transform: sb2sb,
        reverse: reverse
    };
});
