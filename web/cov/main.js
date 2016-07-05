define(function (require) {

    var d3=require('d3');
    var s2b = require('trans/bars2scatter');
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

        var bars = null,
            scatter = new Scatter(data_1d, '#view1');
        scatter.draw();

        $('#btn_switch').click(function () {
            var $this = $(this);
            var $types = $('input[name="type"]'),
                $typeChecked=$('input[name="type"]:checked');

            var type=$typeChecked.val();

            $types.attr('disabled',true);
            $this.attr("disabled", true);
            if (bars) {
                s2b.transform(bars, map, data_1d, {"type":type}, function (newView) {
                    scatter = newView;
                    bars = null;
                    $this.attr("disabled", false);
                    $types.attr('disabled',false);

                });
            } else {
                s2b.transform(scatter, map, data_histogram, {"type":type}, function (newView) {
                    bars = newView;
                    scatter = null;
                    $this.attr("disabled", false);
                    $types.attr('disabled',false);
                });
            }
        });

    });

});