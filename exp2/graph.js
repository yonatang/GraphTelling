console.log('loading...');

var YEARS = ['2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015'],
    AGES = ['Y_LT14', 'Y14-17', 'Y18-34', 'Y35-64', 'Y_GE65'];

var VALID_YEARS = {
    '2008': true,
    '2009': true,
    '2010': true,
    '2011': true,
    '2012': true,
    '2013': true,
    '2014': true,
    '2015': true
};
var VALID_AGE_GROUPS = {'Y18-34': true, 'Y35-64': true, 'Y14-17': true, 'Y_GE65': true, 'Y_LT14': true};
var VALID_SEX = {'M': true, 'F': true};
var VALID_DECISION = {'REJECTED': true, 'TOTAL_POS': true};

var margin = {top: 20, right: 50, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal().rangeRoundBands([0, width]);

var y = d3.scale.linear().rangeRound([height, 0]);

var xAxis = d3.svg.axis().scale(x).orient("bottom");

var yAxis = d3.svg.axis().scale(y).orient("left");

var color = d3.scale.ordinal()
    .range(["blue", "yellow", "green", "cyan", "red"])
    .domain(AGES);


function sumRollupFunction(props) {
    return function func(row) {
        var result = {};
        YEARS.forEach(function (year) {
            result[year] = d3.sum(row, function (d) {
                return +d[year];
            });
        });

        if (Array.isArray(props)) {
            props.forEach(function (prop) {
                result[prop] = d3.max(row, function (d) {
                    return d[prop]
                });
            });
        }
        return result;
    };
}
function getAgesByYear(theData){
    var dataByDecisionAge = d3.nest().key(function (d) {return d.decision})
        .key(function (d) {return d.age;})
        .rollup(sumRollupFunction(['age', 'decision']))
        .entries(theData);

    var dataByAgeSexDecision = d3.nest()
        .key(function (d) {return d.age})
        .key(function (d) {return d.sex})
        .key(function (d) {return d.decision})
        .rollup(sumRollupFunction())
        .entries(theData);

    var pData = [];
    dataByDecisionAge.forEach(function (kv1) {
        kv1.values.forEach(function (kv2) {
            pData.push(kv2.values);
        })
    });

    var agesByYear = {};
    pData.forEach(function (kv) {
        forEach(kv, function (v, k) {
            if (!VALID_YEARS[k]) {
                return;
            }
            var year = k;
            if (!agesByYear[year]) {
                agesByYear[year] = {};
            }
            if (!agesByYear[year][kv.age]) {
                agesByYear[year][kv.age] = 0;
            }
            agesByYear[year][kv.age] += v;
        });
    });

    var agesByYearTable = [];
    forEach(agesByYear, function (v, k) {
        var obj = {year: k};
        forEach(v, function (v, k) {
            obj[k] = v;
        });
        agesByYearTable.push(obj);
    });
    return agesByYearTable;
}

function drawByAge(agesByYearTable){
// by age, # of ppl
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var layers = d3.layout.stack()(AGES.map(function (c) {
        return agesByYearTable.map(function (d) {
            var obj = {x: d.year, y: d[c]};
            return obj;
        });
    }));

    x.domain(layers[0].map(function (d) {return d.x;}));
    y.domain([0, d3.max(layers[layers.length - 1], function (d) {return d.y0 + d.y;})]).nice();

    var layer = svg.selectAll(".layer")
        .data(layers)
        .enter().append("g")
        .attr("class", "layer")
        .style("fill", function (d, i) { return color(color.domain()[i]);});

    layer.selectAll("rect")
        .data(function (d) {return d;})
        .enter().append("rect")
        .attr("x", function (d) {return x(d.x);})
        .attr("y", function (d) {return y(d.y + d.y0);})
        .attr("height", function (d) {return y(d.y0) - y(d.y + d.y0);})
        .attr("width", x.rangeBand() - 1);

    svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(" + 0 + ",0)")
        .call(yAxis);


    var legend = svg.selectAll(".legend")
        .data(color.domain().slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {return "translate(" + (width * -1 + 100) + "," + i * 20 + ")";});

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) { return d;});
}

_log = function(obj){
    console.log(JSON.parse(JSON.stringify(obj)));
};
function drawRejectionsByAgePerencent(data){
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    data.forEach(function(yearRow){
        var y0=0;
        var accumulator=0;
        yearRow.data = AGES.map(function(age){
            var res={ year: yearRow.year, age : age, y: accumulator, y0 : accumulator, y1: accumulator+yearRow[age] };
            accumulator += yearRow[age];
            return res;
        });

        yearRow.data.forEach(function(dataPoint) { dataPoint.y /= accumulator; dataPoint.y0 /= accumulator; dataPoint.y1 /= accumulator; });
    });
    var dd=[];
    data.forEach(function(d){
        dd.push(d.data);
    });
    var layers = d3.layout.stack()(dd);

    x.domain(YEARS);
    y.domain([0, 1]).nice();

    var layer = svg.selectAll(".layer")
        .data(layers)
        .enter().append("g")
        .attr("class", "layer")
        .style("fill", function (d, i) { return color(color.domain()[i]);});

    layer.selectAll("rect")
        .data(function (d) {return d;})
        .enter().append("rect")
        .attr("x", function (d) {return x(d.year);})
        .attr("y", function (d) {return y(d.y1);})
        .attr("height", function (d) {return y(d.y) - y(d.y1);})
        .attr("fill", function(d){return color(d.age)})
        .attr("width", x.rangeBand() - 1);

    svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(" + 0 + ",0)")
        .call(yAxis);
}

d3.tsv("data/norm/migr_asydcfsta2-small.tsv", function (error, data) {
    console.log('loaded');
    if (error) throw error;

    window.data = data;
    window.error = error;


    theData = data.filter(function (d) {
        // filter out irrelevant datapoints
        return d.citizen == 'TOTAL' && VALID_AGE_GROUPS[d.age] && VALID_SEX[d.sex] && VALID_DECISION[d.decision];
    });
    theData.forEach(function (d) {
        // turn YEARS into numbers
        YEARS.forEach(function (year) {
            d[year] *= 1;
        });
    });



    var agesByYearTable = getAgesByYear(theData);
    drawByAge(agesByYearTable);
    drawRejectionsByAgePerencent(agesByYearTable);
});

function forEach(obj, callback) {
    var i;
    if (!obj) {
        return;
    }
    for (i in obj) {
        var v = obj[i];
        if (callback(v, i) === false) {
            return;
        }
    }
}

function objNestObj(nestObj) {
    var res = {};
    nestObj.forEach(function (d) {
        var vals = d.values;
        if (Array.isArray(d.values)) {
            vals = objNestObj(vals);
        }
        res[d.key] = vals;
    });
    return res;
}
