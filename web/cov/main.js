define(function (require) {

    var d3=require('d3');
    var s2b_t = require('trans/bars2scatter');
    var bars = require('views/bars'),
        scatter = require('views/scatter');

    function jsons(files, callback) {
        var datas = [];

        var done = false;
        var n=0;
        function _callback(i) {
            return function (err, data) {
                n++;
                if (err) {
                    if (!done) {
                        done = true;
                        return callback(err);
                    }
                    return;
                }
                if (!!data) {
                    datas[i]=data;
                }
                if (n == files.length) {
                    if (!done) {
                        return callback(null, datas);
                    }
                }
            }
        }
        files.forEach(function(file,i){
            d3.json(file, _callback(i));
        });
    }

    jsons(['data/data_1d.json', 'data/map_1d_histogram.json', 'data/data_histogram.json'], function (err, datas) {
        if (err) {
            throw err;
        }
        var data_1d = datas[0],
            map = datas[1],
            data_histogram = datas[2];

        var b2s=s2b_t.b2s,
            s2b=s2b_t.s2b;

        var ctx = bars.generateContext(data_histogram);
        bars.draw('#view1', ctx);
        var isB2s=true;
        $('#btn_switch').click(function(){
            var $this=$(this);
            $this.attr("disabled", true);
            if (isB2s) {
                b2s(ctx, map, data_1d, function (_ctx) {
                    ctx = _ctx;
                    $this.attr("disabled", false);
                    isB2s=false;
                });
            } else {
                s2b(ctx, map, data_histogram, function (_ctx) {
                    ctx=_ctx;
                    $this.attr("disabled", false);
                    isB2s=true;
                });
            }
        });
        
        // function repeat(ctx) {
        //     b2s(ctx, map, data_1d, function (ctx) {
        //         s2b(ctx, map, data_histogram, function (ctx) {
        //             repeat(ctx);
        //         })
        //     })
        // };
        // repeat(ctx);
    });

});