// Load modules

var Colors = require('colors');


// declare internals

var internals = {
    indentLevel: 0
};


module.exports = function (object) {

    var out = internals.travel(object);
    console.log(out);
};


internals.travel = function (object, addIndentLevel) {

    var type = toString.call(object).split(' ')[1].slice(0,-1);
    var format = internals[type](object);

    return format;
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

internals.spaces = function () {

    var out = '';
    for (var i = 0; i < internals.indentLevel * 4; i++) {
        out = out + ' ';
    }

    return out;
};


internals.Array = function (array) {

    var out = '[\n';
    internals.indentLevel = internals.indentLevel + 1;

    for (var i = 0, il = array.length; i < il; ++i) {
        var item = array[i];
        out = out + internals.spaces() + '' + ('[' + i + ']').white.bold + ' ' + internals.travel(item);
        if (i !== il - 1) {
            out = out + ',';
        }
        out = out + '\n';
    }
    internals.indentLevel = internals.indentLevel - 1;
    var out = out + internals.spaces() + ']';
    return out;
};
