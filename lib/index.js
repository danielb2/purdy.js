// Load modules

var Colors = require('colors');


// declare internals

var internals = {};


module.exports = function (object) {

    var out = internals.travel(object);
    console.log(out);
};


internals.travel = function (object) {

    var type = toString.call(object).split(' ')[1].slice(0,-1);
    return internals[type](object);
};


internals.Object = function(object) {
    if (Array.isArray(object)) {
        return internals.array(object);
    }
    return ('"' + object + '"').yellow;
};


internals.String = function(str) {
    return ('"' + str + '"').yellow;
};


internals.Date = function(date) {

    return (date + '').green;
};


internals.Number = function(number) {
    return (number + '').blue.bold;
};


internals.Function = function(func) {
    if (func.name) {
        return ('[Function: ' + func.name + ']').cyan;
    }
    return '[Function: '.cyan + 'anonymous'.cyan.underline + ']'.cyan;
};


internals.Array = function (array) {

    var out = '[\n';
    for (var i = 0, il = array.length; i < il; ++i) {
        var item = array[i];
        out = out + '    ' + ('[' + i + ']').white.bold + ' ' + internals.travel(item);
        if (i !== il - 1) {
            out = out + ',';
        }
        out = out + '\n';
    }
    var out = out + ']';
    return out;
};
