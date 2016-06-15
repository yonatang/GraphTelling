define(function (require) {

    var d3=require('d3');
    // var s2b_t = require('trans/bars2scatter');
    // var bars = require('views/bars'),
    //     scatter = require('views/scatter');
    var stackedBars = require('views/stacked-bars');
    var sb2sb=require('trans/sbars2sbars');

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

    jsons(['data/graph1.json','data/graph2.json', 'data/map_g1_to_g2.json'], function (err, datas) {
        if (err) {
            throw err;
        }
        var data_graph1 = datas[0],
            data_graph2 = datas[1],
            map_g1_to_g2 = datas[2];

        // var b2s=s2b_t.b2s,
        //     s2b=s2b_t.s2b;

        var ctx = stackedBars.generateContext(data_graph1);
        // var ctx = stackedBars.generateContext(data_graph2);
        stackedBars.draw('#view1', ctx);
        sb2sb.sb2sb(ctx, map_g1_to_g2, data_graph2);

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