#!/usr/bin/env node

var Fs = require('fs');
var Purdy = require('../');


var internals = {};


internals.stdin = function(stream, callback){

    var buf = '';
    stream.setEncoding('utf8');

    stream.on('data', function(s){ buf += s });

    stream.on('end', function(){

        callback(buf);
    }).resume();
};


internals.parse = function (str, depth) {

    try {
        Purdy(JSON.parse(str), { depth: depth });
    }
    catch (e) {
        Purdy(e);
        process.exit(1);
    }
};


internals.main = function () {

    var stream = process.stdin;

    try {
        var depthIdx = process.argv.indexOf('--depth');
        var depth = 2;
        if (depthIdx !== -1) {
            var pair = process.argv.splice(depthIdx, 2);
            depth = parseFloat(pair[1]);

            if (String(depth) === 'NaN') {
                var e = new Error('Depth requires a numerical value');
                e.depth = pair[1];
                Purdy(e);
                process.exit(1);
            }
        }
        if (process.argv[2] === '-') {
            stream = process.stdin;
        }
        else {
            var path = Fs.realpathSync(process.argv[2]);
            stream = Fs.createReadStream(path);
        }
        internals.stdin(stream, function (str) {

            internals.parse(str, depth);
        });
    }
    catch (e) {
        Purdy(e);
        process.exit(1);
    }
};


internals.main();
