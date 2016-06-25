define(function(){
    var AbsXYView = function(){
    };
    AbsXYView.prototype.class = AbsXYView;
    
    AbsXYView.prototype.generateContext = function(data){
        var ctx = {};
        ctx.data = data;
        ctx.dimension = this.getDimension();
        console.log('dimension', ctx.dimension);
        ctx.scale = this.getScale(ctx.data, ctx.dimension);
        console.log('scale', ctx.scale);
        ctx.axis = this.getAxises(ctx.scale);
        return ctx;
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

    AbsXYView.prototype.getAxises = function(scale){
        var xAxis = d3.svg.axis()
            .scale(scale.x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(scale.y)
            .orient("left");

        return {
            xAxis: xAxis,
            yAxis: yAxis
        };
    };

    AbsXYView.prototype.getScale = function(data, dimension){
        throw Error("Not implemented")
    };

    AbsXYView.prototype.draw = function(ctx, selector){
        var width=ctx.dimension.width,
            height=ctx.dimension.height,
            margin=ctx.dimension.margin;
        
        if (!ctx.svg) {
            if (!selector){
                throw Error("selector need to be defined");
            }
            ctx.svg = d3.select(selector).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        }
        this.drawXAxis(ctx);
        this.drawYAxis(ctx);
        this.drawData(ctx);
    };

    AbsXYView.prototype.drawXAxis = function(ctx){
        ctx.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + ctx.dimension.height + ")")
            .call(ctx.axis.xAxis);
    };

    AbsXYView.prototype.drawYAxis = function(ctx){
        ctx.svg.append("g")
            .attr("class", "y axis")
            .call(ctx.axis.yAxis);

    };

    AbsXYView.prototype.drawData = function(ctx){
        throw Error("Not implemented");
    };

    AbsXYView.prototype.hideXAxisTicks = function(ctx){
        ctx.svg.selectAll('.x.axis .tick').remove();
    };

    AbsXYView.prototype.hideYAxisTicks = function(ctx){
        ctx.svg.selectAll('.y.axis .tick').remove();
    };

    AbsXYView.prototype.prepareForAnimation = function(ctx){
        ctx.svg.selectAll('*').classed('tmp',true);
    };

    AbsXYView.prototype.afterAnimation = function(ctx) {
        ctx.svg.selectAll('.tmp').remove();
    };

    return AbsXYView;

});