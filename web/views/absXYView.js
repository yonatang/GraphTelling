define(function(){
    function AbsXYView(data, obj){
        this.populateContext(data);
        if (typeof obj == 'string'){
            this.createSvg(obj);
        } else {
            this.ctx.svg = obj.ctx.svg;
        }
    }

    AbsXYView.prototype.class = AbsXYView;

    AbsXYView.prototype.createSvg = function(selector) {
        var ctx = this.ctx,
            width = ctx.dimension.width,
            height = ctx.dimension.height,
            margin = ctx.dimension.margin;

        ctx.svg=d3.select(selector).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    };

    AbsXYView.prototype.populateContext = function populateContext(data) {
        var ctx = {};
        this.ctx = ctx;
        ctx.data = data;
        ctx.dimension = this.getDimension();
        ctx.scale = this.getScale(ctx.data, ctx.dimension);
        ctx.axis = this.getAxises(ctx.scale);
    };
    


    AbsXYView.prototype.getDimension = function(){
        var margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
        return {
            width: width,
            height: height,
            margin:margin
        };
    };

    AbsXYView.prototype.getAxises = function (scale) {
        var xAxis = this.getXAxis(scale.x),
            yAxis = this.getYAxis(scale.y);
        return {
            xAxis: xAxis,
            yAxis: yAxis
        };
    };

    AbsXYView.prototype.getXAxis = function (scaleX) {
        return d3.svg.axis()
            .scale(scaleX)
            .orient("bottom");
    };

    AbsXYView.prototype.getYAxis = function (scaleY) {
        return d3.svg.axis()
            .scale(scaleY)
            .orient("left");
    };

    AbsXYView.prototype.getScale = function(data, dimension){
        throw Error("Not implemented")
    };

    AbsXYView.prototype.draw = function(){
        var ctx = this.ctx;

        this.drawXAxis(ctx);
        this.drawYAxis(ctx);
        this.drawData(ctx);
    };

    AbsXYView.prototype.drawXAxis = function(){
        var ctx=this.ctx;
        ctx.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + ctx.dimension.height + ")")
            .call(ctx.axis.xAxis);
    };

    AbsXYView.prototype.drawYAxis = function(){
        var ctx=this.ctx;
        ctx.svg.append("g")
            .attr("class", "y axis")
            .call(ctx.axis.yAxis);

    };

    AbsXYView.prototype.drawData = function(){
        throw Error("Not implemented");
    };

    AbsXYView.prototype.hideXAxisTicks = function(){
        var ctx=this.ctx;
        ctx.svg.selectAll('.x.axis .tick').remove();
    };

    AbsXYView.prototype.hideYAxisTicks = function(){
        var ctx=this.ctx;
        ctx.svg.selectAll('.y.axis .tick').remove();
    };

    AbsXYView.prototype.prepareForAnimation = function(){
        var ctx=this.ctx;
        ctx.svg.selectAll('*').classed('tmp',true);
    };

    AbsXYView.prototype.afterAnimation = function() {
        var ctx=this.ctx;
        ctx.svg.selectAll('.tmp').remove();
    };

    return AbsXYView;

});