define(["d3"],function (d3) {
    return {
        clone: function (o) {
            return JSON.parse(JSON.stringify(o));
        },
        forEach: function (o, cb) {
            if (o == null) {
                return;
            }
            var iter = function (o, keys) {
                var i;

                return true;
            };

            for (var i in Object.keys(o)) {
                if (cb(o[i], i) === false) {
                    return;
                }
            }
        },
        equals: function equals(o1, o2) {
            //TODO - need to add object equals
            if (!o1 && !o2) {
                return true;
            }
            if (!o1 || !o2) {
                return false;
            }
            if (o1 instanceof Array && o2 instanceof Array) {
                // compare lengths - can save a lot of time
                if (o1.length != o2.length)
                    return false;

                for (var i = 0, l = o1.length; i < l; i++) {
                    // Check if we have nested arrays
                    if (o1[i] instanceof Array && o2[i] instanceof Array) {
                        // recurse into the nested arrays
                        if (!equals(o1[i], o2[i]))
                            return false;
                    }
                    else if (o1[i] != o2[i]) {
                        // Warning - two different object instances will never be equal: {x:20} != {x:20}
                        return false;
                    }
                }
                return true;
            }


        },
        jsons: function(files, callback) {
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
    }
});