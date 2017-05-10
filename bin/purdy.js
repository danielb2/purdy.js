#!/usr/bin/env node
'use strict';

const Fs = require('fs');
const Purdy = require('../');


const internals = {};


internals.stdin = function (stream, callback){

    let buf = '';
    stream.setEncoding('utf8');

    stream.on('data', (s) => {

        buf += s;
    });

    stream.on('end', () => {

        callback(buf);
    }).resume();
};


internals.parse = function (str, depth) {

    try {
        Purdy(JSON.parse(str), { depth });
    }
    catch (e) {
        Purdy(e);
        process.exit(1);
    }
};


internals.main = function () {

    let stream = process.stdin;

    try {
        const depthIdx = process.argv.indexOf('--depth');
        let depth = 2;
        if (depthIdx !== -1) {
            const pair = process.argv.splice(depthIdx, 2);
            depth = parseFloat(pair[1]);

            if (String(depth) === 'NaN') {
                const e = new Error('Depth requires a numerical value');
                e.depth = pair[1];
                Purdy(e);
                process.exit(1);
            }
        }
        if (process.argv[2] === '-') {
            stream = process.stdin;
        }
        else {
            const path = Fs.realpathSync(process.argv[2]);
            stream = Fs.createReadStream(path);
        }
        internals.stdin(stream, (str) => {

            internals.parse(str, depth);
        });
    }
    catch (e) {
        Purdy(e);
        process.exit(1);
    }
};


internals.main();
