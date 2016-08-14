define(['d3', 'views/absView'], function (d3, AbsView) {
    var defaults = {};

    var Pie = function Pie(data, obj, options) {
        this.options = $.extend({}, defaults, options);
        AbsView.call(this, data, obj);
    };


    Pie.prototype = Object.create(AbsView.prototype);
    Pie.prototype.class = Pie;
    var _super = Pie.prototype;
    // Pie.prototype.populateContext = function(data){
    //
    // };
    Pie.prototype.drawData = function () {
        var ctx = this.ctx,
            svg = ctx.svg,
            height = ctx.dimension.height,
            width = ctx.dimension.width;

        var radius = Math.min(width, height) / 2;
        var pieLayout = d3.layout.pie()
            .sort(null)
            .value(function (d) {
                return d.population;
            });
        var arc = d3.svg.arc()
            .outerRadius(radius)
            .innerRadius(0);


        var dd = pieLayout(ctx.data);
        console.log(dd);

        svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        console.log('1');
        var g = svg.selectAll(".arc")
            .data(pieLayout(ctx.data))
            .enter().append("g")
            .attr("class", "arc")
            .style("stroke", "#fff");


        g.append("path")
            .attr("d", arc)
            .style("fill", function (d) {
                console.log(d);
                return d.data.color; });

        // var enterSelection = ctx.svg.selectAll(".bar")
        //     .data(ctx.data)
        //     .enter();
        // this.drawPiece(enterSelection);
    };

    return Pie;


});