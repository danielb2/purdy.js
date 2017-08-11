#!/usr/bin/env node
'use strict';

const Bossy = require('bossy');
const Fs = require('fs');
const Purdy = require('../');
const ReadLine = require('readline');


const internals = {
    definition: {
        h: {
            alias: 'help',
            description: 'Show help',
            type: 'boolean'
        },
        d: {
            alias: 'depth',
            description: 'depth to show',
            default: 2,
            type: 'number'
        },
        's': {
            alias: 'stdin',
            description: 'parse from stdin',
            default: false,
            type: 'boolean'
        },
        'l': {
            alias: 'log',
            description: 'file is in log format with one JSON string per line',
            default: false,
            type: 'boolean'
        },
        'p': {
            alias: 'path',
            description: 'display path in object-path format',
            default: false,
            type: 'boolean'
        },
        'a': {
            alias: 'arrayIndex',
            description: 'display the index on arrays',
            default: true,
            type: 'boolean'
        },
        'i': {
            alias: 'indent',
            description: 'indent level for output',
            default: 4,
            type: 'number'
        }
    }
};


internals.initalizeBossy = function () {

    const args = Bossy.parse(internals.definition);

    if (args instanceof Error) {
        console.error(args.message);
        process.exit(1);
    }

    if (args.h) {
        console.log(Bossy.usage(internals.definition, 'node start.js'));
        process.exit(0);
    }

    return args;
};



internals.parseStream = function (stream){

    let buf = '';
    stream.setEncoding('utf8');

    stream.on('data', (s) => {

        buf += s;
    });

    stream.on('end', () => {

        try {
            internals.parse(buf);
        }
        catch (e) {
            internals.error(e);
        }
    }).resume();
};


internals.logparse = function (stream){

    stream.setEncoding('utf8');

    const lineReader = ReadLine.createInterface({
        input: stream
    });

    lineReader.on('line', (line) => {

        try {
            internals.parse(line);
        }
        catch (e) {
            internals.error(e);
        }
    });
};


internals.error = function (e) {

    Purdy(e);
    process.exit(1);
};


internals.parse = function (str) {

    const depth = internals.args.depth;
    const path = internals.args.path;

    Purdy(JSON.parse(str), { depth, path });
};


internals.main = function () {

    let stream = process.stdin;

    internals.args = internals.initalizeBossy();

    try {
        if (internals.args.stdin) {
            stream = process.stdin;
            internals.parseStream(stream);
        }
        else {
            for (let i = 0; i < internals.args._.length; ++i) {
                const file = internals.args._[i];
                const path = Fs.realpathSync(file);
                stream = Fs.createReadStream(path);
                if (internals.args.log) {
                    internals.logparse(stream);
                }
                else {
                    internals.parseStream(stream);
                }
            }
        }
    }
    catch (e) {
        internals.error(e);
    }
};


internals.main();
