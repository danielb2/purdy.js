// Load modules

require('colors');
var Hoek = require('hoek');


// declare internals

var internals = {
    indentLevel: 0,
    seen: [],
    colors: {
        BoolFalse: 'red.bold',
        BoolTrue: 'green.bold',
        Circular: 'grey.bold',
        Date: 'green',
        Function: 'cyan',
        Key: 'white.bold',
        Null: 'red.bold',
        Number: 'blue.bold',
        RegExp: 'magenta',
        String: 'yellow',
        Undefined: 'red.inverse'
    },
    settings: {
        plain: false
    }
};


module.exports = function (object, options) {

    internals.settings = Hoek.merge(internals.settings, options);

    var out = internals.travel(object);
    console.log(out);
};


internals.travel = function (object, addIndentLevel) {

    var type = toString.call(object).split(' ')[1].slice(0,-1);
    var format = '';

    if (internals[type]) {
        format = internals[type](object);
    }
    else {
        format = object + '';
    }

    return internals.colorize(format, type);
};

internals.colorize = function (string, type) {

    if (internals.settings.plain) {
        return string;
    }

    var colors = internals.colors[type];
    if (!colors) {
        return string;
    }

    var colorArr = colors.split('.');

    for (var i = 0, il = colorArr.length; i < il; ++i) {
        var color = colorArr[i];
        string = string[color];
    }

    return string;
};


internals.lengthCompare = function (a,b) {
    return a.length - b.length
};

internals.Object = function(object) {

     if (internals.seen.indexOf(object) !== -1) {
         return internals.colorize('[Circular]', 'Circular');
     }
     internals.seen.push(object);

    var keys = Object.keys(object);
    var out = '{\n';
    internals.indentLevel = internals.indentLevel + 1;

    var longest = Hoek.clone(keys).sort(internals.lengthCompare)[keys.length - 1];

    for (var i = 0, il = keys.length; i < il; ++i) {
        var key = keys[i];
        var item = object[key];
        out = out + internals.indent() + '' + (internals.printMember(key, longest) + ':') + ' ' + internals.travel(item);
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

    if (array.length === 0) {
        return '[]';
    }

    if (internals.seen.indexOf(array) !== -1) {
        return internals.colorize('[Circular]', 'Circular');
    }
    internals.seen.push(array);

    var out = '[\n';
    internals.indentLevel = internals.indentLevel + 1;

    for (var i = 0, il = array.length; i < il; ++i) {
        var item = array[i];
        out = out + internals.indent() + '' + ('[' + internals.printMember(i, il) + ']') + ' ' + internals.travel(item);
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

    return '\'' + str + '\'';
};


internals.Boolean = function(bool) {

    if (bool === true) {
        return internals.colorize(bool + '', 'BoolTrue');
    }
    return internals.colorize(bool + '', 'BoolFalse');
};


internals.Function = function(func) {
    if (func.name) {
        return internals.colorize('[Function: ' + func.name + ']', 'Function');
    }
    return internals.colorize('[Function: ?]', 'Function');
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
    return internals.colorize(internals.spaces(toShift) + member, 'Key');
};
