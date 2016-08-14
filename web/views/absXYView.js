define(['views/absView'],function(AbsView){
    function AbsXYView(data, obj){
        AbsView.call(this, data, obj);
    }
    
    AbsXYView.prototype = Object.create(AbsView.prototype);
    var _super = AbsView.prototype;
    AbsXYView.prototype.class = AbsXYView;

    AbsXYView.prototype.populateContext = function populateContext(data) {
        _super.populateContext(data);
        var ctx = {};
        this.ctx = ctx;
        ctx.data = data;
        ctx.dimension = this.getDimension();
        ctx.scale = this.getScale(ctx.data, ctx.dimension);
        ctx.axis = this.getAxises(ctx.scale);
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

    AbsXYView.prototype.removeYAxis = function(){
        var ctx=this.ctx;
        ctx.svg.selectAll('.y.axis').remove();
    };

    AbsXYView.prototype.removeXAxis = function(){
        var ctx=this.ctx;
        ctx.svg.selectAll('.x.axis').remove();
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

    return AbsXYView;

});