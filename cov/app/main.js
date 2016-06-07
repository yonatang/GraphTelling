define(function (require) {
    // Load any app-specific modules
    // with a relative require call,
    // like:
    // var messages = require('./messages');

    // Load library/vendor modules using
    // full IDs, like:
    var d3 = require('d3');

    var bars = require('views/bars'),
        scatter = require('views/scatter');

    var s2b = require('trans/scatter_to_bars');

    function jsons(files, callback) {
        var datas = [];
        function jsonI(i) {
            return function (err, data) {
                if (err) {
                    return callback(err);
                }
                if (!!data) {
                    datas.push(data);
                }
                if (i+1 == files.length) {
                    return callback(err, datas);
                }
                d3.json(files[i+1], jsonI(i + 1));
            }
        }
        d3.json(files[0], jsonI(0));
    }

    console.log('dd1');
    jsons(['data/data_1d.json','data/map_1d_histogram.json', 'data/data_histogram.json'], function(err,datas){
        if (err) {
            throw err;
        }
        var data_1d=datas[0],
            map=datas[1],
            data_histogram=datas[2];
        scatter(data_1d, '#view1');
        s2b(map, data_histogram);
        // console.log('datas',datas   );
    });

    // d3.json('data/data_1d.json', function (err, data) {
    //
    //
    //    //
    //
    // });
    console.log('dd');
    d3.json('data/data_histogram.json', function(err, data){
        console.log('histograms');
        if (err){throw err ;}
        console.log('bars');
        bars(data, '#view2');

    });
});