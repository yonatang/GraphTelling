var matrix=[
    [1,4,6],
    [8,9,4],
    [12,65,33]
];

var YEARS = ['2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015'],
    AGES = ['Y_LT14', 'Y14-17', 'Y18-34', 'Y35-64', 'Y_GE65'];
var VALID_AGE_GROUPS = {'Y18-34': true, 'Y35-64': true, 'Y14-17': true, 'Y_GE65': true, 'Y_LT14': true};
var VALID_SEX = {'M': true, 'F': true};
var VALID_DECISION = {'REJECTED': true, 'TOTAL_POS': true};

var INVALID_GEOS = { 'TOTAL': true, 'EU28': true};

var  margin = {top: 350, right: 480, bottom: 350, left: 480},
    // width = 960 - margin.left - margin.right,
    // height = 500 - margin.top - margin.bottom,
    radius = Math.min(margin.top, margin.right, margin.bottom, margin.left) - 10;

var svg = d3.select("body").append("svg")
    .attr("width", margin.left + margin.right)
    .attr("height", margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var hue = d3.scale.category10();
var luminance = d3.scale.sqrt()
    .domain([0, 1e6])
    .clamp(true)
    .range([90, 20]);
var partitionLayout = d3.layout.partition()
    .sort(function(a, b) { return d3.ascending(a.key, b.key); })
    .size([2 * Math.PI, radius]);

var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx ; })
    .padAngle(.01)
    .padRadius(radius / 3)
    .innerRadius(function(d) { return radius / 3 * d.depth; })
    .outerRadius(function(d) { return radius / 3 * (d.depth + 1) - 1; })

d3.tsv("../exp2/data/norm/migr_asydcfsta2-small.tsv", function (error, data) {

    console.log('loading...');
    var filteredData = data.filter(function(d){
        return d.citizen == 'TOTAL' && VALID_AGE_GROUPS[d.age] && VALID_SEX[d.sex] && VALID_DECISION[d.decision] && !INVALID_GEOS[d.geo];
    });
    filteredData.forEach(function (d) {
        // turn YEARS into numbers
        d.total = 0;
        YEARS.forEach(function (year) {
            var yearCount = (d[year] *= 1);

            d.total += (isFinite(yearCount) ? yearCount : 0);
        });
    });
    
    var graphData = d3.nest().key(function(d){ return d.geo; })
        .key(function(d){ return d.age; })
        // .rollup(function(d){
        //     return { sum:d3.sum(d, function(d1){
        //         var result=0;
        //         // console.log(d1);
        //         YEARS.forEach(function (year) {
        //             result += isFinite(d1[year]) ? d1[year] : 0;
        //         });
        //         if (result >0){ console.log(result, d1)}
        //         return result;
        //     })};
        // })
        .rollup(function(d) {
            return {'total':d3.sum(d, function(d){ return d.total })};
        })
        .entries(filteredData);

    console.log(graphData);

    var root={values:graphData, key:'root'};

    partitionLayout
        .children(function(d){ return d.values; })
        .value(function(d) { return d.values.total; })
        .nodes(root)
        .forEach(function(d) {
            console.log('d2',d);
            d._values = d.values;
            d.sum = d.value;
            // d.key = key(d);
            d.fill = fill(d);
        });

    partitionLayout
        .children(function(d, depth) { return depth < 2 ? d._values : null; })
        .value(function(d) { return d.sum; });


    var center = svg.append("circle")
        .attr("r", radius / 3)
       // .on("click", zoomOut);

    center.append("title")
        .text("zoom out");

    var g = svg.selectAll('.arc')
        .data(partitionLayout.nodes(root).slice(1))
        .enter().append("g")
        .attr("class", "arc");

    g.append('path')
        .attr("d", arc)
        .style("fill", function(d) { return d.fill; })
        .each(function(d) { this._current = updateArc(d); })

    g.append('text')
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .text(function(d) { console.log('key',d.key); return d.key; });


    // var path = svg.selectAll("path")
    //     .data(partitionLayout.nodes(root).slice(1))
    //     .enter().append("path")
    //     .attr("d", arc)
    //     .style("fill", function(d) { return d.fill; })
    //     .each(function(d) { this._current = updateArc(d); })

    // svg.selectAll("path")
    //     // .data(partitionLayout.nodes(root).slice(1))
    //     // .enter()
    //     .insert("text")
    //     .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
    //     .attr("dy", ".35em")
    //     .text(function(d) { console.log('key',d.key); return d.key; });
    //     //.on("click", zoomIn);
});

function updateArc(d) {
    return {depth: d.depth, x: d.x, dx: d.dx};
}
function key(d) {
    var k = [], p = d;
    while (p.depth) k.push(p.name), p = p.parent;
    return k.reverse().join(".");
}

function fill(d) {
    var p = d;
    while (p.depth > 1) p = p.parent;
    var c = d3.lab(hue(p.name));
    c.l = luminance(d.sum);
    return c;
}

function arcTween(b) {
    var i = d3.interpolate(this._current, b);
    this._current = i(0);
    return function(t) {
        return arc(i(t));
    };
}
d3.select(self.frameElement).style("height", margin.top + margin.bottom + "px");


// d3.select('body').append('table')
//     .selectAll('tr')
//     .data(matrix)
//     .enter()
//     .append('tr')
//
//     .selectAll('td')
//     .data(function(d){return d})
//     .enter()
//     .append('td')
//     .text(function(d){return d})
//     // .data(function(d){return d;})
//     // .enter()
//     // .append('td')
//     // .data(function(d){ return d;})
//     // .text(function(d){return d});
// //
// // d3.select('body').select('table')
// //     .selectAll('td')
// //     .text(function(d){return '!!'+d+'!!'})
// //
// // d3.select("body").selectAll("div")
// //     .data([4, 8, 15, 16, 23, 42])
// //     .enter().append("div")
// //     .text(function(d) { return d; });
// //
// // var div = d3.select("body").selectAll("div")
// //     .data([1, 2, 4, 8, 16, 32], function(d) { return d; });
// //
// // div.enter().append("div")
// //     .text(function(d) { return d; });
// //
// // div.exit().remove();
// var div=d3
//      .select('body')
//      .selectAll('div')
//      .data([1,5,7],function(d) { return d; })
//
//  div
//      .enter().append('div').text(function(d){return '#'+d})
//
//  div   .exit()
//      .data([9,5],function(d) { return d;})
//
//      // .enter()
//      .append('div')
//      .text(function(d){return "!"+d})
//  // div.exit().remove();
//
//  // remove();