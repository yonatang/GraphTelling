define(['d3', 'utils', '../views/stacked-bars'], function (d3, utils, stackedBars) {

    var clone = utils.clone;
    var forEach = utils.forEach;

    function processMap(oldData, newData, mapBarsToBars) {
        var map = JSON.parse(JSON.stringify(mapBarsToBars));
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
        var map_array = [];
        map.forEach(function (m) {
            if (!mapByOldBar[m.from]){
                mapByOldBar[m.from]={to:[], sum: 0}
            }
            var newDataPoint = clone(newDataById[m.to]);
            var oldDataPoint = clone(oldDataById[m.from]);

            mapByOldBar[m.from].from=oldDataPoint;
            mapByOldBar[m.from].to.push(newDataPoint);
            mapByOldBar[m.from].sum+=newDataPoint.y1 - newDataPoint.y0;
            if (!mapByNewBar[m.to]) {
                mapByNewBar[m.to]={from:[]}
            }
            mapByNewBar[m.to].from.push(oldDataPoint);
        });

        var transitElements = [];
        var tmpXOrderMap = {};

        forEach(mapByOldBar, function(mapping){
            var oldDataPoint = mapping.from;
            var oldHeight = oldDataPoint.y1 - oldDataPoint.y0;
            var y0=oldDataPoint.y0;
            forEach(mapping.to, function(d, i){
                var newHeight = d.y1 - d.y0;
                d.oldX = oldDataPoint.x;
                d.oldHeight = oldHeight;
                d.tmpY0=y0;
                d.tmpY1=y0+oldHeight * (newHeight / mapping.sum);
                d.tmpX=oldDataPoint.x;
                d.tmpXOrder=oldDataPoint.xOrder;
                if (!tmpXOrderMap[d.tmpXOrder]) {
                    tmpXOrderMap[d.tmpXOrder]=0;
                }
                d.tmpYOrder=tmpXOrderMap[d.tmpXOrder];
                tmpXOrderMap[d.tmpXOrder]++;
                y0=d.tmpY1;
                transitElements.push(d);
            });
        });
        
        return {
            transitElements : transitElements,
            newDataById : newDataById, oldDataById : oldDataById,
            mapByOldBar: mapByOldBar, mapByNewBar:mapByNewBar};
    }

    function endAnimationCb(oldCtx, newCtx, callback) {
        d3.selectAll('.tmp').remove();
        oldCtx.svg.selectAll('.x.axis').remove();
        oldCtx.svg.selectAll('.y.axis').remove();
        stackedBars.draw('#view1', newCtx);
        if (callback) {
            callback(newCtx);
        }
    }

    function sb2sb(ctx, mapBarsToBars, newData, opts, callback) {
        var defaults={
            firstX : true
        };
        if (opts.firstX==null || opts.firstX==undefined){
            opts.firstX=defaults.firstX;
        }

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
            .style('stroke',function(d) { return d.color; })
            .style("fill", function(d) { return d.color; })
            .attr("x", function (d) { return x(d.oldX); })
            .attr("y", function(d) { return y(d.tmpY1); })
            .attr("height", function(d) { return y(d.tmpY0)-y(d.tmpY1); })
            .attr("width", x.rangeBand());

        svg.selectAll('.bar').remove();

        var n=0;
        var anim=tmpBars
            .transition()
            .delay(1000)
            .attr("y", function(d) { return y(d.tmpY1)-2*d.tmpYOrder; })
            .style('stroke', 'black')
            .style('fill-opacity', "0.4")
            .transition()
            .delay(1500)
            .duration(1000);

        if (opts.firstX){
            anim=anim.attr("width", new_x.rangeBand())
                .attr("x", function (d) { return new_x(d.x); })
                .transition()
                .attr("height", function (d) { return new_y(d.y0) - new_y(d.y1); })
                .attr("y", function (d) { return new_y(d.y1); })
        } else {
            anim=anim.attr("height", function (d) { return new_y(d.y0) - new_y(d.y1); })
                .attr("y", function (d) { return new_y(d.y1); })
                .transition()
                .attr("width", new_x.rangeBand())
                .attr("x", function (d) { return new_x(d.x); })
        }

        anim
            .style('fill-opacity', "1")
            .each(function() { ++n; })
            .each('end', function(){
                if (!--n){
                    endAnimationCb(ctx, new_ctx, callback);
                }
            });

    }

    return {sb2sb : sb2sb};


});
