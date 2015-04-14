// Load modules

var Chalk = require('chalk');
var Hoek = require('hoek');


// declare internals

var internals = {
    indentLevel: 0,
    colors: {
        BoolFalse: 'red.bold',
        BoolTrue: 'green.bold',
        Circular: 'grey.bold',
        Date: 'green',
        error: 'red',
        Function: 'cyan',
        Key: 'white.bold',
        Null: 'red.bold',
        Number: 'blue.bold',
        RegExp: 'magenta',
        String: 'yellow',
        Undefined: 'red.inverse',
        path: 'blue'
    },
    defaults: {
        plain: false,
        path: false,
        indent: 4,
        align: 'left',
        arrayIndex: true,
        pathPrefix: '// '
    }
};


internals.purdy = function (object, options) {

    return console.log(internals.stringify(object, options));
};


internals.stringify = function (object, options) {

    internals.seen = [];
    internals.path = [];
    internals.settings = Hoek.applyToDefaults(internals.defaults, options || {});
    return internals.travel(object, '');
};


internals.purdy.stringify = internals.stringify;


module.exports = internals.purdy;


internals.travel = function (object, path) {

    var type = global.toString.call(object).split(' ')[1].slice(0, -1);
    var format = '';

    if (internals[type]) {
        format = internals[type](object, path);
    }
    else {
        format = String(object);
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
        string = Chalk[color](string);
    }

    return string;
};


internals.lengthCompare = function (a, b) {
    return a.length - b.length;
};


internals.tidyPath = function (path) {

    return internals.colorize(path.slice(1, path.size), 'path');
};

internals.Object = function (object, path) {

    if (Object.keys(object).length === 0) {
        return '{}';
    }

    var index = internals.seen.indexOf(object);
    if (index !== -1) {
        return internals.showCircular(index);
    }
    internals.seen.push(object);
    internals.path.push(path);

    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        keys = keys.concat(Object.getOwnPropertySymbols(object));
    }
    var keyLengths = Hoek.clone(keys);
    internals.indentLevel = internals.indentLevel + 1;
    var out = '{\n';

    for (var i = 0, il = keys.length; i < il; ++i) {
        var key = keys[i];
        var item = object[key];
        if (internals.settings.path && path.length > 0) {
            keyLengths.push(internals.settings.pathPrefix);
            out = out + internals.indent() +
                internals.colorize(internals.settings.pathPrefix, 'path') +
                internals.tidyPath(path + '.' + key) + '\n';
        }
        var longest = keyLengths.sort(internals.lengthCompare)[keyLengths.length - 1];
        var keyStr = key.toString();
        out = out + internals.indent() + '' + (internals.printMember(keyStr, longest) + ':') + ' ' + internals.travel(item, path + '.' + keyStr);
        if (i !== il - 1) {
            out = out + ',';
        }
        out = out + '\n';
    }
    internals.indentLevel = internals.indentLevel - 1;
    out = out + internals.indent() + '}';
    return out;
};


internals.showCircular = function (index) {
    var showPath = internals.path[index];
    showPath = showPath === '' ? '' : ' ' + showPath.slice(1, showPath.length);
    return internals.colorize('[Circular~' + showPath + ']', 'Circular');
};


internals.Array = function (array, path) {

    if (array.length === 0) {
        return '[]';
    }

    var index = internals.seen.indexOf(array);
    if (index !== -1) {
        return internals.showCircular(index);
    }
    internals.seen.push(array);
    internals.path.push(path);

    var out = '[\n';
    internals.indentLevel = internals.indentLevel + 1;

    for (var i = 0, il = array.length; i < il; ++i) {
        var item = array[i];
        if (internals.settings.path && path.length > 0) {
            out = out + internals.indent() +
                internals.colorize(internals.settings.pathPrefix, 'path') +
                internals.tidyPath(path + '.' + i) + '\n';
        }
        var indexStr = internals.settings.arrayIndex ? '[' + internals.printMember(i, il) + '] ' : '';
        out = out + internals.indent() + '' + indexStr + internals.travel(item, path + '.' + i);
        if (i !== il - 1) {
            out = out + ',';
        }
        out = out + '\n';
    }
    internals.indentLevel = internals.indentLevel - 1;
    out = out + internals.indent() + ']';
    return out;
};


internals.Error = function (err) {

    if (Object.keys(err).length === 0) {
        return internals.colorize('[' + err + ']', 'error');
    }
    var obj = internals.Object(err);
    return obj.replace(/^{/, '{ ' + internals.colorize('[Error: ' + err.message + ']', 'error') );
};


internals.String = function (str) {

    return '\'' + str + '\'';
};


internals.Boolean = function (bool) {

    if (bool === true) {
        return internals.colorize(bool + '', 'BoolTrue');
    }
    return internals.colorize(bool + '', 'BoolFalse');
};


internals.Function = function (func) {
    if (func.name) {
        return internals.colorize('[Function: ' + func.name + ']', 'Function');
    }
    return internals.colorize('[Function: ?]', 'Function');
};


internals.indent = function () {

    return internals.spaces(internals.indentLevel * internals.settings.indent);
};


internals.spaces = function (count) {

    var out = '';
    for (var i = 0; i < count; i++) {
        out = out + ' ';
    }

    return out;
};


internals.printMember = function (member, max) {

    if (internals.settings.align === 'left') {
        max = 0;
    }
    var memberLength = member.length;
    var maxLength = max.length;
    var toShift = maxLength - memberLength;
    return internals.colorize(internals.spaces(toShift) + member, 'Key');
};
