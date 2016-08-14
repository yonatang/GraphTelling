define(['utils','d3','views/pie', 'views/bars', 'trans/bars2pie'], function (utils, d3, Pie, Bars, b2p) {

    // function jsons(files, callback) {
    //     var datas = [];
    //     var done = false;
    //     var n=0;
    //     function _callback(i) {
    //         return function (err, data) {
    //             n++;
    //             if (err) {
    //                 if (!done) {
    //                     done = true;
    //                     return callback(err);
    //                 }
    //                 return;
    //             }
    //             if (!!data) {
    //                 datas[i]=data;
    //             }
    //             if (n == files.length) {
    //                 if (!done) {
    //                     return callback(null, datas);
    //                 }
    //             }
    //         }
    //     }
    //     files.forEach(function(file,i){
    //         d3.json(file, _callback(i));
    //     });
    // }

    utils.jsons(['data/pie1.json','data/bars1.json','data/map_bars_to_pie.json'], function (err, datas) {
        if (err) {
            throw err;
        }
        var pie1_data = datas[0],
            bar1_data = datas[1],
            b2p_map = datas[2];
        
        // var pie = new Pie(pie1_data, "#view1");
        // pie.draw();

        var bar = new Bars(bar1_data,'#view1');
        bar.draw();
         b2p.transform(bar,b2p_map,pie1_data,{},function(){});
        //
        // var init_data=data_graph1,
        //     step = 0;
        //
        // var stackedBars = new StackedBars(init_data, '#view1');
        // stackedBars.draw();
        //
        //
        // function showStepMessage() {
        //     $("#spn_message").text('Step ' + (step + 1));
        // }
        //
        // function mod(n, m) {
        //     return ((n % m) + m) % m;
        // }
        //
        // function progress(forward) {
        //     $(".progress-button").attr("disabled", true);
        //
        //     $('#spn_message').text('Going from step ' + (step + 1) + ' to ' +
        //         (mod(forward ? (step + 1) : (step - 1), 4) + 1));
        //
        //     function callback(newStackBars) {
        //         step = mod(forward ? (step + 1) : (step - 1), 4);
        //         stackedBars = newStackBars;
        //
        //         $(".progress-button").attr("disabled", false);
        //         showStepMessage()
        //     }
        //     var duration=$("#input_duration").val();
        //
        //     var map,
        //         data,
        //         opts = { duration:duration};
        //     switch (step) {
        //         case 0:
        //             if (forward) {
        //                 map = map_g1_to_g2;
        //                 data = data_graph2;
        //             } else {
        //                 map = map_g4_to_g1;
        //                 data = data_graph4;
        //             }
        //             break;
        //         case 1:
        //             if (forward) {
        //                 map = map_g2_to_g3;
        //                 data = data_graph3;
        //             } else {
        //                 map = map_g1_to_g2;
        //                 data = data_graph1;
        //                 opts.firstX=false;
        //             }
        //             break;
        //         case 2:
        //             if (forward) {
        //                 map = map_g3_to_g4;
        //                 data = data_graph4;
        //                 opts.firstX=false;
        //             } else {
        //                 map = map_g2_to_g3;
        //                 data = data_graph2;
        //             }
        //             break;
        //         case 3:
        //             if (forward) {
        //                 map = map_g4_to_g1;
        //                 data = data_graph1;
        //             } else {
        //                 map = map_g3_to_g4;
        //                 data = data_graph3;
        //             }
        //             break;
        //     }
        //     if (forward) {
        //         sb2sb.transform(stackedBars, map, data, opts, callback);
        //     } else {
        //         sb2sb.reverse(stackedBars, map, data, opts, callback);
        //     }
        // }
        //
        // showStepMessage();
        // $('#btn_next').click(function () { progress(true); });
        // $('#btn_back').click(function () { progress(false); });


    });

});