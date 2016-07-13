define(function(){
    function AbsView(data, obj){
        var thatObj = obj;
        var orgSvg=(obj && obj.ctx && obj.ctx.svg) ? obj.ctx.svg : null;
        this.populateContext(data);
        if (!orgSvg){
            this.createSvg(obj);
        } else {
            this.ctx.svg = orgSvg;
        }
    }

    AbsView.prototype.class = AbsView;

    AbsView.prototype.populateContext = function populateContext(data) {
        var ctx = {};
        this.ctx = ctx;
        // var ctx = this.ctx;
        ctx.data = data;
        ctx.dimension = this.getDimension();
        // ctx.scale = this.getScale(ctx.data, ctx.dimension);
        // ctx.axis = this.getAxises(ctx.scale);
    };

    AbsView.prototype.createSvg = function(selector) {
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

    AbsView.prototype.getDimension = function(){
        var margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
        return {
            width: width,
            height: height,
            margin:margin
        };
    };

    AbsView.prototype.draw = function(){
        this.drawData(this.ctx);
    };

    AbsView.prototype.drawData = function(){
        throw Error("Not implemented");
    };

    AbsView.prototype.prepareForAnimation = function(){
        var ctx=this.ctx;
        ctx.svg.selectAll('*').classed('tmp',true);
    };

    AbsView.prototype.afterAnimation = function() {
        var ctx=this.ctx;
        ctx.svg.selectAll('.tmp').remove();
    };

    return AbsView;

});