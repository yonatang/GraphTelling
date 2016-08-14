define(['trans/absTrans', '../views/pie', '../views/bars'], function (AbsTrans, Pie, Bars) {
    function Bars2Pie() {
        AbsTrans.call(this, Bars, Pie);
    };

    Bars2Pie.prototype = Object.create(AbsTrans.prototype);
    Bars2Pie.prototype.class = Bars2Pie;
    var _super = AbsTrans.prototype;

    Bars2Pie.prototype.defaults = {
        "duration": 1500
    };

    Bars2Pie.prototype.processMap = function (aData, bData, mapData) {
        //mapData: bars -> pie
        //aData: bars
        //bData: pie
        var barsData = aData,
            pieData = bData;

        //  {"id": "1.2", "bucket":"2.5-5", "height":1352330, "color":"#98abc5"},

        var map = JSON.parse(JSON.stringify(mapData));

        var barsById = {},
            arcsById = {};

        barsData.forEach(function(d){
            barsById[d.id]=d;
        });
        pieData.forEach(function(d){
            arcsById[d.id]=d;
        });

        var barsByArcId = {},
            arcsByBarId = {};

        map.forEach(function(mapItem){
            var fromBarId = mapItem.from,
                toArcId = mapItem.to;
            if (!arcsByBarId[fromBarId]) {
                arcsByBarId[fromBarId]=[];
            }
            if (!barsByArcId[toArcId]) {
                barsByArcId[toArcId]=[];
            }
            arcsByBarId[fromBarId].push(arcsById[toArcId]);
            barsByArcId[toArcId].push(barsById[fromBarId]);

        });

        return {
            barsByArcId : barsByArcId,
            arcsByBarId : arcsByBarId,
            arcsById : arcsById,
            barsById : barsById
        };

    };

    Bars2Pie.prototype.transformAtoB = function (oldView, mapCtx, newView, options, callback) {
        //bars -> pie
        // oldView - bars
        // newView pie


        var d3 = this.d3;

        var ctx = oldView.ctx,
            barData = ctx.data,
            // mapByScatter = mapCtx.mapByScatter,
            new_ctx = newView.ctx
            // scatterData = scatterView.ctx.data;
            ;

        var width=ctx.dimension.width,
            height=ctx.dimension.height;

        new_ctx.svg = ctx.svg;
        var svg = ctx.svg;

        var pieLayout=d3.layout.pie()
            .sort(null) //TBD
            .value(function(d){
                //still data from bars
                return d.height;
            });

        var radius = Math.min(width, height) / 2;
        var arc=d3.svg.arc();

        var old_x=ctx.scale.x,
            old_y=ctx.scale.y;

        svg.selectAll('.bar').remove();
        svg.selectAll('.y.axis').transition().remove();
        svg.selectAll('.x.axis').transition().remove();
        // oldView.removeYAxis();
        // oldView.removeXAxis();

        svg.selectAll('.tmpbar')
            .data(pieLayout(barData))
            .enter()
            .append('path')
            .attr('class','tmpbar')
            .attr('fill','steelblue')
            .attr('d',arc)
            .transition()
            .duration(1000)
            .tween('arc',function(d){
                var path = d3.select(this),
                    // text = d3.select(this.parentNode.appendChild(this.previousSibling)),

                    x0 = old_x(d.data.bucket),
                    y0 = height - old_y(d.data.height);

                var color_int=d3.interpolate(path.style('fill'),d.data.color);

                return function(t) {
                    var r = height / 2 / Math.min(1, t + 1e-3),
                        a = Math.cos(t * Math.PI / 2),
                        xx = (-r + (a) * (x0 + old_x.rangeBand()) + (1 - a) * (width + height) / 2),
                        yy = ((a) * height + (1 - a) * height / 2),
                        f = {
                            innerRadius: r - old_x.rangeBand() / (2 - a),
                            outerRadius: r,
                            startAngle: a * (Math.PI / 2 - y0 / r) + (1 - a) * d.startAngle,
                            endAngle: a * (Math.PI / 2) + (1 - a) * d.endAngle
                        };

                    path.attr("transform", "translate(" + xx + "," + yy + ")");
                    path.data()[0].innerRadius=f.innerRadius;
                    path.data()[0].outerRadius=f.outerRadius;
                    path.attr("d", arc(f));
                    path.attr('fill',color_int(t));
                    // text.attr("transform", "translate(" + arc.centroid(f) + ")translate(" + xx + "," + yy + ")rotate(" + ((f.startAngle + f.endAngle) / 2 + 3 * Math.PI / 2) * 180 / Math.PI + ")");
                };

            });

        setTimeout(arcToPie,1000);
        // arcToPie();
        function arcToPie() {
            svg.selectAll('.tmpbar')
                .each(transitionPie);
            var arc = d3.svg.arc();
//
            function transitionPie(d) {
                var path = d3.select(this);
                var d = path.transition().duration(1000)
                    .tween("arc", tweenToPie);

                function tweenToPie(d) {
                    var a = {
                        endAngle: d.endAngle,
                        innerRadius: d.innerRadius,
                        outerRadius: d.outerRadius,
                        startAngle: d.startAngle,
                        padAngle: d.padAngle
                    };
                    var b = {
                        endAngle: a.endAngle,
                        innerRadius: 0,
                        outerRadius: a.outerRadius,
                        startAngle: a.startAngle,
                        padAngle: a.padAngle
                    };
                    var i = d3.interpolate(a, b);
                    return function (t) {
                        var f = i(t);
                        path.attr("d", arc(f));

                        return t;
                    }
                }
            }
        }

        /*
         function arcTween(d) {
         var path = d3.select(this),
         text = d3.select(this.parentNode.appendChild(this.previousSibling)),
         x0 = x(d.data.key),
         y0 = h - y(d.data.sumPrice);

         return function(t) {
         var r = h / 2 / Math.min(1, t + 1e-3),
         a = Math.cos(t * Math.PI / 2),
         xx = (-r + (a) * (x0 + x.rangeBand()) + (1 - a) * (w + h) / 2),
         yy = ((a) * h + (1 - a) * h / 2),
         f = {
         innerRadius: r - x.rangeBand() / (2 - a),
         outerRadius: r,
         startAngle: a * (Math.PI / 2 - y0 / r) + (1 - a) * d.startAngle,
         endAngle: a * (Math.PI / 2) + (1 - a) * d.endAngle
         };

         //                        console.log(f);
         //                console.log("transform translate(" + xx + "," + yy + ")");
         path.attr("transform", "translate(" + xx + "," + yy + ")");
         path.data()[0].innerRadius=f.innerRadius;
         path.data()[0].outerRadius=f.outerRadius;
         //                console.log('data',path.data());
         //                console.log("d "+arc(f));
         path.attr("d", arc(f));
         text.attr("transform", "translate(" + arc.centroid(f) + ")translate(" + xx + "," + yy + ")rotate(" + ((f.startAngle + f.endAngle) / 2 + 3 * Math.PI / 2) * 180 / Math.PI + ")");
         };
         */
        // svg.selectAll('bar')

    };

    Bars2Pie.prototype.transformBtoA = function (oldView, mapCtx, newView, options, callback) {
        // pie -> bars

    };

    return new Bars2Pie();
});