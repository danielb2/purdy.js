'use strict';


// Load modules

const Chalk = require('chalk');
const Joi = require('joi');


// declare internals

const internals = {
    colors: {
        BoolFalse: 'red.bold',
        BoolTrue: 'green.bold',
        Circular: 'gray.bold',
        Date: 'green',
        Key: 'white.bold',
        Null: 'red.bold',
        Number: 'blue.bold',
        RegExp: 'magenta',
        String: 'yellow',
        Symbol: 'magenta.bold',
        Undefined: 'red.inverse',
        depth: 'gray',
        error: 'red',
        function: 'cyan',
        prefix: 'green',
        path: 'blue',
        json: 'green'
    },
    defaults: Joi.object({
        depth: Joi.number().min(0).allow(null).default(2),
        plain: Joi.boolean().default(false),
        json: Joi.boolean().default(false),
        path: Joi.boolean().default(false),
        proto: Joi.boolean().default(false).description('include the prototype chain and print all inherited properties'),
        indent: Joi.number().default(4),
        align: Joi.string().valid('left', 'right').default('left'),
        arrayIndex: Joi.boolean().default(true),
        pathPrefix: Joi.string().default('// ')
    })
};

internals.purdy = function (options) {

    this.indentLevel = 0;
    this.seen = [];
    this.path = [];

    this.settings = Joi.attempt(options || {}, internals.defaults);
};



module.exports = function (object, options) {

    const purdy = new internals.purdy(options);
    return purdy.print(object);
};

module.exports.purdy = function (options) {

    return new internals.purdy(options);
};

module.exports.stringify = function (object, options) {

    const purdy = new internals.purdy(options);
    return purdy.stringify(object);
};

internals.purdy.prototype.print = function (...args) {

    console.log(this.stringify(...args));
};

internals.purdy.prototype.stringify = function (...args) {

    const res = [];
    for (let object of args) {
        if (this.settings.proto) {
            object = internals.mergeInherited(object);
        }

        res.push(this.travel(object, '', 0));
    }

    return res.join(' ');
};


internals.mergeInherited = function (obj) {

    let result = Object.assign({}, obj);
    let prot;
    while (prot = Object.getPrototypeOf(obj)) {

        result = Object.assign(prot, result);
        obj = prot;
    }

    return result;
};


internals.purdy.prototype.travel = function (object, path, depth) {

    const type = toString.call(object).split(' ')[1].slice(0, -1);
    let format = '';

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

    const colors = internals.colors[type];
    if (!colors) {
        return string;
    }

    const colorArr = colors.split('.');

    for (let i = 0; i < colorArr.length; ++i) {
        const color = colorArr[i];
        string = Chalk[color](string);
    }

    return string;
};


internals.lengthCompare = function (a, b) {

    return a.length - b.length;
};


internals.purdy.prototype.Uint8Array = function (buffer) {

    const endStr = buffer.length < 26 ? '>' : ' ... >';
    return '<Buffer ' + buffer.slice(0, 25).toString('utf8') + endStr;
};


internals.purdy.prototype.tidyPath = function (path) {

    return this.colorize(path.slice(1, path.size), 'path');
};

internals.purdy.prototype.Object = internals.purdy.prototype.process = internals.purdy.prototype.global = function (object, path, depth) {

    let keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
        keys = keys.concat(Object.getOwnPropertySymbols(object));
    }

    let prefix = '';
    if (object.constructor) {
        prefix = ['Object', 'Function', 'Error', ''].indexOf(object.constructor.name) !== -1 ? '' : this.colorize(object.constructor.name, 'prefix') + ' ';
    }

    if (keys.length === 0) {
        return prefix + '{}';
    }

    ++depth;
    const index = this.seen.indexOf(object);
    if (index !== -1) {
        return this.showCircular(index);
    }

    this.seen.push(object);
    this.path.push(path);

    const keyLengths = keys.concat();
    this.indentLevel = this.indentLevel + 1;
    let out = prefix + '{\n';

    for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        const item = object[key];
        if (this.settings.path && path.length > 0) {
            keyLengths.push(this.settings.pathPrefix);
            out = out + this.indent() +
                this.colorize(this.settings.pathPrefix, 'path') +
                this.tidyPath(path + '.' + key) + '\n';
        }

        const longest = keyLengths.sort(internals.lengthCompare)[keyLengths.length - 1];
        const keyStr = key.toString();

        if (this.settings.depth === null || this.settings.depth + 1 >= depth) {
            out = out + this.indent() + '' + (this.printMember(keyStr, longest) + ':') + ' ' + this.travel(item, path + '.' + keyStr, depth);
        }
        else {
            this.indentLevel = this.indentLevel - 1;
            return this.colorize('[Object]', 'depth');
        }

        if (i !== keys.length - 1) {
            out = out + ',';
        }

        out = out + '\n';
    }

    this.indentLevel = this.indentLevel - 1;
    out = out + this.indent() + '}';
    return out;
};


internals.purdy.prototype.showCircular = function (index) {

    let showPath = this.path[index];
    showPath = showPath === '' ? '' : ' ' + showPath.slice(1, showPath.length);
    return this.colorize('[Circular~' + showPath + ']', 'Circular');
};


internals.purdy.prototype.Array = function (array, path, depth) {

    if (array.length === 0) {
        return '[]';
    }

    ++depth;
    const index = this.seen.indexOf(array);
    if (index !== -1) {
        return this.showCircular(index);
    }

    this.seen.push(array);
    this.path.push(path);

    let out = '[\n';
    this.indentLevel = this.indentLevel + 1;

    for (let i = 0; i < array.length; ++i) {
        const item = array[i];
        if (this.settings.path && path.length > 0) {
            out = out + this.indent() +
                this.colorize(this.settings.pathPrefix, 'path') +
                this.tidyPath(path + '.' + i) + '\n';
        }

        const indexStr = this.settings.arrayIndex ? '[' + this.printMember(i, array.length) + '] ' : '';
        if (this.settings.depth === null || this.settings.depth + 1 >= depth) {
            out = out + this.indent() + '' + indexStr + this.travel(item, path + '.' + i, depth);
        }
        else {
            this.indentLevel = this.indentLevel - 1;
            return this.colorize('[Object]', 'depth');
        }

        if (i !== array.length - 1) {
            out = out + ',';
        }

        out = out + '\n';
    }

    this.indentLevel = this.indentLevel - 1;
    out = out + this.indent() + ']';
    return out;
};


internals.purdy.prototype.Error = function (err) {

    const stack = internals.formatStack(err.stack, this.indentLevel, this.settings.indent);
    if (Object.keys(err).length === 0) {
        return this.colorize(stack, 'error');
    }

    const plain = this.settings.plain;
    this.settings.plain = true;
    const obj = this.Object(err, '', null);
    this.settings.plain = plain;
    return obj.replace(/^{/, '{ ' + this.colorize(stack, 'error'));
};


internals.formatStack = function (stack, indentLevel, indent) {

    const spaces = internals.spaces((indentLevel) * indent);
    let stackArr = stack.split('\n');
    const firstLine = stackArr.shift();
    stackArr = stackArr.map((line) => {

        return spaces + line;
    });
    stackArr.unshift(firstLine);

    return stackArr.join('\n');
};


internals.Json = function Json(str) {

    const parsed = JSON.parse(str);

    for (const key in parsed) {
        this[key] = parsed[key];
    }
};


internals.purdy.prototype.String = function (str) {

    if (this.settings.json) {
        try {
            if (str.match(/^\s*{/)) {
                const thing = new internals.Json(str);
                return this.colorize(this.travel(thing, '', 0), 'json');
            }
        }
        catch (e) {}
    }

    return '\'' + str + '\'';
};

internals.purdy.prototype.Arguments = function (obj) {

    const arr = Array.prototype.slice.call(obj);
    return this.Array(arr);
};


internals.purdy.prototype.Boolean = function (bool) {

    if (bool === true) {
        return this.colorize(bool + '', 'BoolTrue');
    }

    return this.colorize(bool + '', 'BoolFalse');
};


internals.purdy.prototype.Function = function (obj) {

    const name = obj.name ? ': ' + obj.name : '';

    if (Object.keys(obj).length === 0) {
        return this.colorize('[Function' + name + ']', 'function');
    }

    const props = this.Object(obj, '', null);
    return props.replace(/^{/, '{ ' + this.colorize('[Function' + name + ']', 'function'));
};


internals.purdy.prototype.indent = function () {

    return internals.spaces(this.indentLevel * this.settings.indent);
};


internals.spaces = function (count) {

    let out = '';
    for (let i = 0; i < count; ++i) {
        out = out + ' ';
    }

    return out;
};


internals.purdy.prototype.printMember = function (member, max) {

    if (this.settings.align === 'left') {
        max = 0;
    }

    if (member.indexOf && member.indexOf(' ') > 0) {
        member = `'${member}'`;
    }

    const memberLength = member.length;
    const maxLength = max.length;
    const toShift = maxLength - memberLength;
    return this.colorize(internals.spaces(toShift) + member, 'Key');
};
