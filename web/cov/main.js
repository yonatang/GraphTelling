define(function (require) {

    var d3=require('d3');
    var s2b_t = require('trans/bars2scatter');
    var Bars = require('views/bars'),
        Scatter = require('views/scatter');


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

        var bars = new Bars(data_histogram, '#view1'),
            scatter = null;
        bars.draw();

        $('#btn_switch').click(function () {
            var $this = $(this);
            $this.attr("disabled", true);
            if (bars) {
                b2s(bars, map, data_1d, function (_scatter) {
                    scatter = _scatter;
                    bars = null;
                    $this.attr("disabled", false);
                });
            } else {
                s2b(scatter, map, data_histogram, function (_bars) {
                    bars = _bars;
                    scatter = null;
                    $this.attr("disabled", false);
                });
            }
        });

    });

});