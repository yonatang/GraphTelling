define(function (require) {

    var d3=require('d3');
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

    jsons(['data/graph1.json','data/graph2.json', 'data/graph3.json', 'data/graph4.json',
        'data/map_g1_to_g2.json', 'data/map_g2_to_g3.json', 'data/map_g3_to_g4.json', 'data/map_g4_to_g1.json'], function (err, datas) {
        if (err) {
            throw err;
        }
        var data_graph1 = datas[0],
            data_graph2 = datas[1],
            data_graph3 = datas[2],
            data_graph4 = datas[3],
            map_g1_to_g2 = datas[4],
            map_g2_to_g3 = datas[5],
            map_g3_to_g4 = datas[6],
            map_g4_to_g1 = datas[7];

        var ctx = stackedBars.generateContext(data_graph1);
        stackedBars.draw('#view1', ctx);
        sb2sb.sb2sb(ctx, map_g1_to_g2, data_graph2, {}, function(ctx){
            sb2sb.sb2sb(ctx, map_g2_to_g3, data_graph3, {}, function(ctx){
                sb2sb.sb2sb(ctx, map_g3_to_g4, data_graph4, {firstX:false}, function(ctx) {
                    sb2sb.sb2sb(ctx, map_g4_to_g1, data_graph1, {}, function(ctx){

                    });
                });

            });
        });

    });

});