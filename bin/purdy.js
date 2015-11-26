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


internals.parse = function (str) {

    try {
        Purdy(JSON.parse(str));
    }
    catch (e) {
        Purdy(e);
    }
};


internals.main = function () {

    var stream = process.stdin;

    try {
        if (process.argv[2] === '-') {
            stream = process.stdin;
        }
        else {
            var path = Fs.realpathSync(process.argv[2]);
            stream = Fs.createReadStream(path);
        }
        internals.stdin(stream, function (str) {

            internals.parse(str);
        });
    }
    catch (e) {
        Purdy(e);
    }
};


internals.main();
