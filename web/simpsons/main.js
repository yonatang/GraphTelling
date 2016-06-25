define(['d3','views/stacked-bars', 'trans/sbars2sbars'], function (d3, StackedBars, sb2sb) {

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

        var init_data=data_graph1,
            step = 0;

        var stackedBars = new StackedBars(init_data, '#view1');
        stackedBars.draw();


        function showStepMessage() {
            $("#spn_message").text('Step ' + (step + 1));
        }

        function mod(n, m) {
            return ((n % m) + m) % m;
        }

        function progress(forward) {
            $(".progress-button").attr("disabled", true);

            $('#spn_message').text('Going from step ' + (step + 1) + ' to ' +
                (mod(forward ? (step + 1) : (step - 1), 4) + 1));

            function callback(newStackBars) {
                step = mod(forward ? (step + 1) : (step - 1), 4);
                stackedBars = newStackBars;

                $(".progress-button").attr("disabled", false);
                showStepMessage()
            }
            var duration=$("#input_duration").val();

            var map,
                data,
                opts = { duration:duration};
            switch (step) {
                case 0:
                    if (forward) {
                        map = map_g1_to_g2;
                        data = data_graph2;
                    } else {
                        map = map_g4_to_g1;
                        data = data_graph4;
                    }
                    break;
                case 1:
                    if (forward) {
                        map = map_g2_to_g3;
                        data = data_graph3;
                    } else {
                        map = map_g1_to_g2;
                        data = data_graph1;
                        opts.firstX=false;
                    }
                    break;
                case 2:
                    if (forward) {
                        map = map_g3_to_g4;
                        data = data_graph4;
                        opts.firstX=false;
                    } else {
                        map = map_g2_to_g3;
                        data = data_graph2;
                    }
                    break;
                case 3:
                    if (forward) {
                        map = map_g4_to_g1;
                        data = data_graph1;
                    } else {
                        map = map_g3_to_g4;
                        data = data_graph3;
                    }
                    break;
            }
            if (forward) {
                sb2sb.transform(stackedBars, map, data, opts, callback);
            } else {
                sb2sb.reverse(stackedBars, map, data, opts, callback);
            }
        }

        showStepMessage();
        $('#btn_next').click(function () { progress(true); });
        $('#btn_back').click(function () { progress(false); });


    });

});