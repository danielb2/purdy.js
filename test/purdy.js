var Lab = require('lab');
var Purdy = require('../');


// Declare internals

var internals = {};


// Test shortcuts

var expect = Lab.expect;
var before = Lab.before;
var after = Lab.after;
var describe = Lab.experiment;
var it = Lab.test;


describe('Purdy', function() {

    it('should purdy print', function(done) {

        Purdy([1,2,'foo', it, Array.isArray, new Date,1,1,1,1,12,[1,2]]);
        var circularObj = { };
        circularObj.a = circularObj;
        var circ = [];
        circ.push(circ);
        Purdy({
            a: 3,
            bn: 'foo',
            raino: it,
            d: {king: 'cobra'},
            null: null,
            undefined: undefined,
            regexp: new RegExp,
            falseBool: false,
            trueBool: true,
            emptyArr: [],
            circular: circularObj,
            circularArr: circ
        });
        done();
    });
});

