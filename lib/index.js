// Load modules

var Chalk = require('chalk');
var Hoek = require('hoek');
var Joi = require('joi');


// declare internals

var internals = {
    colors: {
        BoolFalse: 'red.bold',
        BoolTrue: 'green.bold',
        Circular: 'grey.bold',
        Date: 'green',
        Key: 'white.bold',
        Null: 'red.bold',
        Number: 'blue.bold',
        RegExp: 'magenta',
        String: 'yellow',
        Symbol: 'magenta.bold',
        Undefined: 'red.inverse',
        depth: 'grey',
        error: 'red',
        function: 'cyan',
        prefix: 'green',
        path: 'blue'
    },
    defaults: {
        depth: Joi.number().min(0).allow(null).default(2),
        plain: Joi.boolean().default(false),
        path: Joi.boolean().default(false),
        indent: Joi.number().default(4),
        align: Joi.string().valid(['left', 'right']).default('left'),
        arrayIndex: Joi.boolean().default(true),
        pathPrefix: Joi.string().default('// ')
    }
};

internals.purdy = function (object, options) {

    this.indentLevel = 0;
    this.seen = [];
    this.path = [];
    this.object = object;

    this.settings = Joi.attempt(options || {}, internals.defaults);
};



module.exports = function (object, options) {

    var Purdy = new internals.purdy(object, options);
    return console.log(Purdy.stringify());
};

module.exports.stringify = function (object, options) {

    var Purdy = new internals.purdy(object, options);
    return Purdy.stringify();
}


internals.purdy.prototype.stringify = function (object, options) {

    return this.travel(this.object, '', 0);
};


internals.purdy.prototype.travel = function (object, path, depth) {

    var type = toString.call(object).split(' ')[1].slice(0, -1);
    var format = '';

    if (this[type]) {
        format = this[type](object, path, depth);
    }
    else {
        format = String(object);
    }

    return this.colorize(format, type);
};


internals.purdy.prototype.colorize = function (string, type) {

    if (this.settings.plain) {
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


internals.purdy.prototype.tidyPath = function (path) {

    return this.colorize(path.slice(1, path.size), 'path');
};

internals.purdy.prototype.Object = internals.purdy.prototype.process = internals.purdy.prototype.global = function (object, path, depth) {

    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
        keys = keys.concat(Object.getOwnPropertySymbols(object));
    }

    var prefix = ['Object', 'Function', 'Error', ''].indexOf(object.constructor.name) !== -1 ? '' : this.colorize(object.constructor.name, 'prefix') + ' ';

    if (keys.length === 0) {
        return prefix + '{}';
    }

    ++depth;
    var index = this.seen.indexOf(object);
    if (index !== -1) {
        return this.showCircular(index);
    }
    this.seen.push(object);
    this.path.push(path);

    var keyLengths = Hoek.clone(keys);
    this.indentLevel = this.indentLevel + 1;
    var out = prefix + '{\n';

    for (var i = 0, il = keys.length; i < il; ++i) {
        var key = keys[i];
        var item = object[key];
        if (this.settings.path && path.length > 0) {
            keyLengths.push(this.settings.pathPrefix);
            out = out + this.indent() +
                this.colorize(this.settings.pathPrefix, 'path') +
                this.tidyPath(path + '.' + key) + '\n';
        }
        var longest = keyLengths.sort(internals.lengthCompare)[keyLengths.length - 1];
        var keyStr = key.toString();

        if (this.settings.depth === null || this.settings.depth + 1 >= depth) {
            out = out + this.indent() + '' + (this.printMember(keyStr, longest) + ':') + ' ' + this.travel(item, path + '.' + keyStr, depth);
        }
        else {
            this.indentLevel = this.indentLevel - 1;
            return  this.colorize('[Object]', 'depth');
        }
        if (i !== il - 1) {
            out = out + ',';
        }
        out = out + '\n';
    }
    this.indentLevel = this.indentLevel - 1;
    out = out + this.indent() + '}';
    return out;
};


internals.purdy.prototype.showCircular = function (index) {

    var showPath = this.path[index];
    showPath = showPath === '' ? '' : ' ' + showPath.slice(1, showPath.length);
    return this.colorize('[Circular~' + showPath + ']', 'Circular');
};


internals.purdy.prototype.Array = function (array, path, depth) {

    if (array.length === 0) {
        return '[]';
    }

    ++depth;
    var index = this.seen.indexOf(array);
    if (index !== -1) {
        return this.showCircular(index);
    }
    this.seen.push(array);
    this.path.push(path);

    var out = '[\n';
    this.indentLevel = this.indentLevel + 1;

    for (var i = 0, il = array.length; i < il; ++i) {
        var item = array[i];
        if (this.settings.path && path.length > 0) {
            out = out + this.indent() +
                this.colorize(this.settings.pathPrefix, 'path') +
                this.tidyPath(path + '.' + i) + '\n';
        }
        var indexStr = this.settings.arrayIndex ? '[' + this.printMember(i, il) + '] ' : '';
        if (this.settings.depth === null || this.settings.depth + 1 >= depth) {
            out = out + this.indent() + '' + indexStr + this.travel(item, path + '.' + i, depth);
        }
        else {
            this.indentLevel = this.indentLevel - 1;
            return  this.colorize('[Object]', 'depth');
        }
        if (i !== il - 1) {
            out = out + ',';
        }
        out = out + '\n';
    }
    this.indentLevel = this.indentLevel - 1;
    out = out + this.indent() + ']';
    return out;
};


internals.purdy.prototype.Error = function (err) {

    if (Object.keys(err).length === 0) {
        return this.colorize('[' + err + ']', 'error');
    }
    var obj = this.Object(err, '', null);
    var message = err.message ? ': ' + err.message : '';
    return obj.replace(/^{/, '{ ' + this.colorize('[Error'+ message + ']', 'error') );
};


internals.purdy.prototype.String = function (str) {

    return '\'' + str + '\'';
};

internals.purdy.prototype.Arguments = function (obj) {

    var arr = Array.prototype.slice.call(obj);
    return this.Array(arr);
};


internals.purdy.prototype.Boolean = function (bool) {

    if (bool === true) {
        return this.colorize(bool + '', 'BoolTrue');
    }
    return this.colorize(bool + '', 'BoolFalse');
};


internals.purdy.prototype.Function = function (obj) {

    var name = obj.name ? ': ' + obj.name : '';

    if (Object.keys(obj).length === 0) {
        return this.colorize('[Function' + name + ']', 'function');
    }

    var props = this.Object(obj, '', null);
    return props.replace(/^{/, '{ ' + this.colorize('[Function' + name + ']', 'function') );
};


internals.purdy.prototype.indent = function () {

    return internals.spaces(this.indentLevel * this.settings.indent);
};


internals.spaces = function (count) {

    var out = '';
    for (var i = 0; i < count; i++) {
        out = out + ' ';
    }

    return out;
};


internals.purdy.prototype.printMember = function (member, max) {

    if (this.settings.align === 'left') {
        max = 0;
    }
    var memberLength = member.length;
    var maxLength = max.length;
    var toShift = maxLength - memberLength;
    return this.colorize(internals.spaces(toShift) + member, 'Key');
};
