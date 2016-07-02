define(['d3', 'utils'], function (d3, utils) {
    function AbsTrans(fromClass, toClass) {
        this.d3=d3;
        this.utils=utils;
        this.fromClass=fromClass;
        this.toClass=toClass;
    }
    AbsTrans.prototype.class = AbsTrans;
    AbsTrans.prototype.isAtoBTransform = function(view){
        return (view instanceof this.fromClass);
    };

    AbsTrans.prototype.instantiateA = function(bView, data, options){
        return new this.fromClass(data, bView);
    };

    AbsTrans.prototype.instantiateB = function(aView, data, options){
        return new this.toClass(data, aView);
    };

    AbsTrans.prototype.transform = function (oldView, mapData, newData, options, callback) {
        var oldData=oldView.ctx.data;
        var mapCtx, //= this.processMap(oldData, newData, mapData);
            action,
            newView;
        if (this.isAtoBTransform(oldView)){
            action=this.transformAtoB;
            newView = this.instantiateB(oldView, newData, options);
            mapCtx = this.processMap(oldData, newData, mapData);
        } else {
            action=this.transformBtoA;
            newView = this.instantiateA(oldView, newData, options);
            mapCtx = this.processMap(newData, oldData, mapData);

        }
        var _callback = this.generateCallback(oldView, callback);
        return action.apply(this, [oldView, mapCtx, newView, options, _callback]);
    };

    AbsTrans.prototype.generateCallback = function(oldView, userCallback) {
        return function callback(newView) {
            oldView.afterAnimation();
            newView.draw();
            if (userCallback) {
                userCallback(newView);
            }
        }
    };

    AbsTrans.prototype.processMap = function(aData, bData, mapData){
        throw Error("not implemented");
    };

    AbsTrans.prototype.transformAtoB = function(oldView, mapCtx, newView, options, callback) {
        throw Error("not implemented");
    };
    AbsTrans.prototype.transformBtoA = function(oldView, mapCtx, newView, options, callback) {
        throw Error("not implemented");
    };

    return AbsTrans;

});