#!/usr/bin/env node

var Fs = require('fs');
var Purdy = require('../');

try {
    var path = Fs.realpathSync(process.argv[2]);
    Purdy(require(path));
}
catch (e) {
    Purdy(e);
}
