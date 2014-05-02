// Load modules

var Colors = require('colors');


// declare internals

var internals = {};

module.exports = function (object) {

    var out = internals.travel(object);
    console.log(out);
};

internals.travel = function (object) {

    return internals[typeof(object)](object);
};

internals.object = function(object) {
    if (Array.isArray(object)) {
        return internals.array(object);
    }
    return ('"' + object + '"').yellow;
};

internals.string = function(str) {
    return ('"' + str + '"').yellow;
};

internals.number = function(number) {
    return (number + '').blue.bold;
};

internals.function = function(func) {
    if (func.name) {
        return ('[Function: ' + func.name + ']').cyan;
    }
    return '[Function: '.cyan + 'anonymous'.cyan.underline + ']'.cyan;
};

internals.array = function (array) {

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
