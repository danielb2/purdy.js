var Code = require('code');
var Lab = require('lab');
var Purdy = require('..');

// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;

describe('replace', function () {

    lab.it('should replace `console.log` with purdy', function (done) {
        require('../replace');
        expect(console.log).to.equal(Purdy);
        done()
    });
})
