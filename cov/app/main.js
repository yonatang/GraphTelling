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

    var s2b = require('trans/scatter_to_bars'),
        b2s = require('trans/bars_to_scatter');

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
                if (i + 1 == files.length) {
                    return callback(err, datas);
                }
                d3.json(files[i + 1], jsonI(i + 1));
            }
        }

        d3.json(files[0], jsonI(0));
    }

    jsons(['data/data_1d.json', 'data/map_1d_histogram.json', 'data/data_histogram.json'], function (err, datas) {
        if (err) {
            throw err;
        }
        var data_1d = datas[0],
            map = datas[1],
            data_histogram = datas[2];

        var ctx = bars.generateContext(data_histogram);
        bars.draw('#view1', ctx);
        function repeat(ctx) {
            b2s(ctx, map, data_1d, function (ctx) {
                s2b(ctx, map, data_histogram, function (ctx) {
                    repeat(ctx);
                })
            })
        };
        repeat(ctx);
    });

});