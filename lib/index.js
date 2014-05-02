// Load modules

var Colors = require('colors');
var Hoek = require('hoek');


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


internals.lengthCompare = function (a,b) {
    if (a.length < b.length) {
        return -1;
    }
    if (a.length > b.length) {
        return 1;
    }
    return 0;
};

internals.Object = function(object) {

    var keys = Object.keys(object);
    var out = '{\n';
    internals.indentLevel = internals.indentLevel + 1;

    var longest = Hoek.clone(keys).sort(internals.lengthCompare)[keys.length - 1];

    for (var i = 0, il = keys.length; i < il; ++i) {
        var key = keys[i];
        var item = object[key];
        out = out + internals.indent() + '' + (internals.printMember(key, longest) + ':').white.bold + ' ' + internals.travel(item);
        if (i !== il - 1) {
            out = out + ',';
        }
        out = out + '\n';
    }
    internals.indentLevel = internals.indentLevel - 1;
    out = out + internals.indent() + '}';
    return out;
};


internals.Array = function (array) {

    var out = '[\n';
    internals.indentLevel = internals.indentLevel + 1;

    for (var i = 0, il = array.length; i < il; ++i) {
        var item = array[i];
        out = out + internals.indent() + '' + ('[' + internals.printMember(i, il) + ']').white.bold + ' ' + internals.travel(item);
        if (i !== il - 1) {
            out = out + ',';
        }
        out = out + '\n';
    }
    internals.indentLevel = internals.indentLevel - 1;
    out = out + internals.indent() + ']';
    return out;
};

internals.String = function(str) {
    return ('\'' + str + '\'').yellow;
};


internals.Date = function(date) {

    return (date + '').green;
};


internals.Null = function() {
    return (null + '').red.bold;
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

internals.indent = function () {

    return internals.spaces(internals.indentLevel * 4);
};


internals.spaces = function (count) {

    var out = '';
    for (var i = 0; i < count; i++) {
        out = out + ' ';
    }

    return out;
};


internals.printMember = function (member, max) {

    var memberLength = (member + '').length;
    var maxLength = (max + '').length;
    var toShift = maxLength - memberLength;
    return internals.spaces(toShift) + member;
};
