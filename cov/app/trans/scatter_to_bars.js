define(['d3'], function (d3) {

    return function (map, newData) {
        var map = JSON.parse(JSON.stringify(map));
        var mapByFrom = {},
            newDataById = {},
            mapByTo = {};



        var graph_margin = {top: 20, right: 20, bottom: 30, left: 40},
            graph_width = 960 - graph_margin.left - graph_margin.right,
            graph_height = 500 - graph_margin.top - graph_margin.bottom;


        var new_y = d3.scale.linear().range([graph_height,0]),
            new_x = d3.scale.linear().range([0, graph_width]);

        var old_y = d3.scale.linear().range([graph_height,0]);
        old_y.domain([-1,1]).nice();

        var new_xAxis = d3.svg.axis()
            .scale(new_x)
            .orient("bottom");

        var new_yAxis = d3.svg.axis()
            .scale(new_y)
            .orient("left");

        newData.forEach(function(newDataPoint){ newDataById[newDataPoint.id]=newDataPoint; });
        new_y.domain(d3.extent(newData, function (d) { return d.height; })).nice();
        new_x.domain(d3.extent(newData, function(d) { return d.bucket; })).nice();



        var map_array=[];
        map.forEach(function(m){
            mapByFrom[m.from]=m;
            if (!mapByTo[m.to]){
                mapByTo[m.to]=0;
            }
            mapByFrom[m.from].height=newDataById[m.to].height;
            mapByFrom[m.from].bucket=newDataById[m.to].bucket;
            m['count']=mapByTo[m.to];
            mapByTo[m.to]++;
            map_array.push(m);
        });
        map_array.sort(function(m1,m2){
            if (m1.bucket!=m2.bucket){
                return m1.bucket-m2.bucket;
            }
            if (m1.count!=m2.count){
                return m1.count-m2.count;
            }
            return 0;
        });
        map_array.forEach(function(m,i){
            m.order=i;
        });

        var endAnimationCb=function(args){
            //draw new graph over the animation result
            var svg=d3.select('#view1').select('svg').select('g');

            svg.selectAll(".bar_new")
                .data(newData)
                .enter().append("rect")
                .attr("class", "bar")
                .style("fill", "steelblue")
                .attr("x", function (d) {
                    return new_x(d.bucket);
                })
                .attr("width", 5)
                .attr("y", function (d) {
                    return new_y(d.height);
                })
                .attr("height", function (d) {
                    return graph_height - new_y(d.height);
                });
            svg.selectAll('.tmpbar').remove();
            d3.select('.x.axis').call(new_xAxis);
            d3.select('.y.axis').call(new_yAxis);
            console.log('all done');
        };

        var blockHeight=new_y(0)-new_y(1);
        var n=0;
        var singleDuration=1500/map.length;
        console.log(singleDuration);
        d3.selectAll('.dot')
            .transition()
            .delay(500)
            .transition()
            .duration(singleDuration)
            // .attr('cy',old_y(-1))
            .delay(function(d){return 500+mapByFrom[d.id].order*singleDuration;})
            .attr('cy',function(d){return new_y(mapByFrom[d.id].count);})
            .attr('cx',function(d){return new_x(mapByFrom[d.id].bucket);})
            .attr('r',2)
            // .call(endall, function(){ console.log('all done');})
            // .each(function() { ++n; })
            .each(function() { ++n; })
            .each('end', function(){
                var dot=d3.select(this);
                d3.select(this.parentNode)
                    .append('rect')
                    .attr("class", "bar tmpbar")
                    // .style("fill", 'red')
                    .style("fill", "steelblue")
                    .attr("x", dot.attr('cx')-0)
                    .attr("width", 5)
                    .attr("y", dot.attr('cy'))
                    .attr("height", 0)
                    //
                    .transition()
                    .duration(singleDuration)
                    .attr('r',0)
                    .attr("height",blockHeight)
                    .attr("y", dot.attr('cy')-blockHeight)
                    .each('end', function(){
                        if (!--n) endAnimationCb.apply(this);
                        dot.remove();
                    });
            });
    }
});