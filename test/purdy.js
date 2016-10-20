var Code = require('code');
var Hoek = require('hoek');
var Lab = require('lab');
var Purdy = require('../');

// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;
var before = lab.before;
var after = lab.after;

// Check for ES2015 function name inference

var funcNameInfer = (function funcName () {}).name === 'funcName';


describe('Purdy', function () {

    describe('errors', function () {


        it('should display an error', function (done) {

            var error = new Error('plain error');
            var out = Purdy.stringify(error);
            expect(out).to.equal('\u001b[31m[Error: plain error]\u001b[39m');
            done();
        });

        it('should display an error with no error message and property correctly', function (done) {

            var error = new Error();
            error.murray = 'rothbard';
            var out = Purdy.stringify(error);
            expect(out).to.equal('{ \u001b[31m[Error]\u001b[39m\n    \u001b[1m\u001b[37mmurray\u001b[39m\u001b[22m: \u001b[33m\'rothbard\'\u001b[39m\n}');
            done();
        });

        it('should display an error with properties', function (done) {

            var error = new Error('error with properties');
            error.code = 'BAD';
            var out = Purdy.stringify(error);
            expect(out).to.equal('{ \u001b[31m[Error: error with properties]\u001b[39m\n    \u001b[1m\u001b[37mcode\u001b[39m\u001b[22m: \u001b[33m\'BAD\'\u001b[39m\n}');
            done();
        });

        it('should display an error with detail', function (done) {

            var error = new Error('some bad, bad error');
            error.withKey = 'key';
            var obj = {
                theError: error
            };
            var out = Purdy.stringify(obj, { depth: null });
            expect(out).to.equal('{\n    \u001b[1m\u001b[37mtheError\u001b[39m\u001b[22m: { \u001b[31m[Error: some bad, bad error]\u001b[39m\n        \u001b[1m\u001b[37mwithKey\u001b[39m\u001b[22m: \u001b[33m\'key\'\u001b[39m\n    }\n}');
            done();
        });
    });

    it('should indent array correctly', function (done) {

        var out = Purdy.stringify([1, 2, 1, 1, 1, 1, 12, [1, 2]]);
        expect(out).to.equal('[\n    [\u001b[1m\u001b[37m0\u001b[39m\u001b[22m] \u001b[1m\u001b[34m1\u001b[39m\u001b[22m,\n    [\u001b[1m\u001b[37m1\u001b[39m\u001b[22m] \u001b[1m\u001b[34m2\u001b[39m\u001b[22m,\n    [\u001b[1m\u001b[37m2\u001b[39m\u001b[22m] \u001b[1m\u001b[34m1\u001b[39m\u001b[22m,\n    [\u001b[1m\u001b[37m3\u001b[39m\u001b[22m] \u001b[1m\u001b[34m1\u001b[39m\u001b[22m,\n    [\u001b[1m\u001b[37m4\u001b[39m\u001b[22m] \u001b[1m\u001b[34m1\u001b[39m\u001b[22m,\n    [\u001b[1m\u001b[37m5\u001b[39m\u001b[22m] \u001b[1m\u001b[34m1\u001b[39m\u001b[22m,\n    [\u001b[1m\u001b[37m6\u001b[39m\u001b[22m] \u001b[1m\u001b[34m12\u001b[39m\u001b[22m,\n    [\u001b[1m\u001b[37m7\u001b[39m\u001b[22m] [\n        [\u001b[1m\u001b[37m0\u001b[39m\u001b[22m] \u001b[1m\u001b[34m1\u001b[39m\u001b[22m,\n        [\u001b[1m\u001b[37m1\u001b[39m\u001b[22m] \u001b[1m\u001b[34m2\u001b[39m\u001b[22m\n    ]\n]');
        done();
    });

    it('allows for removal of array index', function (done) {

        var out = Purdy.stringify([1, 2, 1, 1, 1, 1, 12, [1, 2]], { plain: true, arrayIndex: false });
        expect(out).to.equal('[\n    1,\n    2,\n    1,\n    1,\n    1,\n    1,\n    12,\n    [\n        1,\n        2\n    ]\n]');
        done();
    });

    it('honors indent level', function (done) {

        var out = Purdy.stringify([1, 2, 1, 1, 1, 1, 12, [1, 2]], { plain: true, arrayIndex: false, indent: 2 });
        expect(out).to.equal('[\n  1,\n  2,\n  1,\n  1,\n  1,\n  1,\n  12,\n  [\n    1,\n    2\n  ]\n]');
        done();
    });

    it('prints arguments function', function (done) {

        var afunc = function () {

            var out = Purdy.stringify(arguments, { depth: null, plain: true, arrayIndex: false, indent: 2 });
            expect(out).to.equal('[\n  \'hello\',\n  \'purdy\'\n]');
            done();
        };

        afunc('hello', 'purdy');
    });

    it('should print plain', function (done) {

        var out = Purdy.stringify('plain', { plain: true });
        expect(out).to.equal('\'plain\'');
        done();
    });

    it('should handle circular references', function (done) {

        var circularObj = { };
        circularObj.a = circularObj;
        var circ = [];
        circ.push(circ);
        var out = Purdy.stringify(circularObj);
        expect(out).to.equal('{\n    \u001b[1m\u001b[37ma\u001b[39m\u001b[22m: \u001b[1m\u001b[90m[Circular~]\u001b[39m\u001b[22m\n}');
        out = Purdy.stringify(circ);
        expect(out).to.equal('[\n    [\u001b[1m\u001b[37m0\u001b[39m\u001b[22m] \u001b[1m\u001b[90m[Circular~]\u001b[39m\u001b[22m\n]');
        done();
    });

    describe('functions', function () {

        it('should print constructor name', function (done) {

            var mises = function mises () { this.moop = 3 }
            var obj = { instance: new mises() };
            var out = Purdy.stringify(obj, { indent: 1 });
            expect(out).to.equal('{\n \u001b[1m\u001b[37minstance\u001b[39m\u001b[22m: \u001b[32mmises\u001b[39m {\n  \u001b[1m\u001b[37mmoop\u001b[39m\u001b[22m: \u001b[1m\u001b[34m3\u001b[39m\u001b[22m\n }\n}');
            done();
        });

        it('should print not print common constructor', function (done) {

            var mises = function () { this.moop = 3 }
            var obj = { instance: new mises() };
            var out = Purdy.stringify(obj, { indent: 1 });
            var expected = [
                '{\n \u001b[1m\u001b[37minstance\u001b[39m\u001b[22m: ',
                funcNameInfer ? '\u001b[32mmises\u001b[39m ' : '',
                '{\n  \u001b[1m\u001b[37mmoop\u001b[39m\u001b[22m: \u001b[1m\u001b[34m3\u001b[39m\u001b[22m\n }\n}'
            ].join('');
            expect(out).to.equal(expected);
            done();
        });

        it('should print a function', function (done) {

            var out = Purdy.stringify(Array.isArray);
            expect(out).to.equal('\u001b[36m[Function: isArray]\u001b[39m');
            done();
        });

        it('should print an anonymous function', function (done) {

            var anon = function () {};
            var out = Purdy.stringify(anon);
            var expected = [
                '\u001b[36m[Function',
                funcNameInfer ? ': anon' : '',
                ']\u001b[39m'
            ].join('');
            expect(out).to.equal(expected);
            done();
        });

        it('should print properties for functions', function (done) {

            var obj = function () {};

            obj.property = 3;

            var out = Purdy.stringify(obj, { indent: 1, plain: false });
            var expected = [
                '{ \u001b[36m[Function',
                funcNameInfer ? ': obj': '',
                ']\u001b[39m\n \u001b[1m\u001b[37mproperty\u001b[39m\u001b[22m: \u001b[1m\u001b[34m3\u001b[39m\u001b[22m\n}'
            ].join('');
            expect(out).to.equal(expected);
            done();
        });

        it('should print properties for functions with name', function (done) {

            var obj = function Liberty () {};

            obj.property = 3;

            var out = Purdy.stringify(obj, { indent: 1, plain: false });
            expect(out).to.equal('{ \u001b[36m[Function: Liberty]\u001b[39m\n \u001b[1m\u001b[37mproperty\u001b[39m\u001b[22m: \u001b[1m\u001b[34m3\u001b[39m\u001b[22m\n}');
            done();
        });
    });


    it('should print a string', function (done) {

        var out = Purdy.stringify('hello purdy');
        expect(out).to.equal('\u001b[33m\'hello purdy\'\u001b[39m');
        done();
    });

    it('should print a date', function (done) {

        var out = Purdy.stringify(new Date(2014, 5, 6, 21, 22, 21));
        expect(out).to.equal('\u001b[32m' + new Date(2014, 5, 6, 21, 22, 21) + '\u001b[39m');
        done();
    });

    it('should print a number', function (done) {

        var out = Purdy.stringify(123);
        expect(out).to.equal('\u001b[1m\u001b[34m123\u001b[39m\u001b[22m');
        done();
    });

    it('should print null', function (done) {

        var out = Purdy.stringify(null);
        expect(out).to.equal('\u001b[1m\u001b[31mnull\u001b[39m\u001b[22m');
        done();
    });

    it('should print undefined', function (done) {

        var out = Purdy.stringify(undefined);
        expect(out).to.equal('\u001b[7m\u001b[31mundefined\u001b[39m\u001b[27m');
        done();
    });

    it('should print a regular expression', function (done) {

        var out = Purdy.stringify(new RegExp());
        expect(out).to.equal('\u001b[35m/(?:)/\u001b[39m');
        done();
    });

    it('should print a false boolean', function (done) {

        var out = Purdy.stringify(false);
        expect(out).to.equal('\u001b[1m\u001b[31mfalse\u001b[39m\u001b[22m');
        done();
    });

    it('should print a true boolean', function (done) {

        var out = Purdy.stringify(true);
        expect(out).to.equal('\u001b[1m\u001b[32mtrue\u001b[39m\u001b[22m');
        done();
    });

    it('should print an empty array without extra indentation', function (done) {

        var out = Purdy.stringify([]);
        expect(out).to.equal('[]');
        done();
    });

    it('should print an empty object without extra indentation', function (done) {

        var out = Purdy.stringify({});
        expect(out).to.equal('{}');
        done();
    });

    it('should print a more complex object', function (done) {

        var out = Purdy.stringify({
            array: [1, 2, [1, 2]],
            object: { another: 'string' }
        }, { align: 'right' });

        expect(out).to.equal('{\n    \u001b[1m\u001b[37m array\u001b[39m\u001b[22m: [\n        [\u001b[1m\u001b[37m0\u001b[39m\u001b[22m] \u001b[1m\u001b[34m1\u001b[39m\u001b[22m,\n        [\u001b[1m\u001b[37m1\u001b[39m\u001b[22m] \u001b[1m\u001b[34m2\u001b[39m\u001b[22m,\n        [\u001b[1m\u001b[37m2\u001b[39m\u001b[22m] [\n            [\u001b[1m\u001b[37m0\u001b[39m\u001b[22m] \u001b[1m\u001b[34m1\u001b[39m\u001b[22m,\n            [\u001b[1m\u001b[37m1\u001b[39m\u001b[22m] \u001b[1m\u001b[34m2\u001b[39m\u001b[22m\n        ]\n    ],\n    \u001b[1m\u001b[37mobject\u001b[39m\u001b[22m: {\n        \u001b[1m\u001b[37manother\u001b[39m\u001b[22m: \u001b[33m\'string\'\u001b[39m\n    }\n}');
        done();
    });

    it('should not print circular after second use', function (done) {

        var obj = { a: 3 };
        Purdy.stringify(obj);
        var out = Purdy.stringify(obj, { plain: true });
        expect(out).to.not.equal('[Circular]');
        done();
    });

    it('shows circular reference with path', function (done) {

        var repeatObj = {
            text: 'repeating object'
        };
        var repeatArr = ['repeating array'];

        var obj = {
            a: { nested: repeatObj },
            b: { alsoNested: repeatObj },
            more: [repeatArr],
            array: [repeatArr]

        };
        obj.top = obj;
        var out = Purdy.stringify(obj, { plain: true, align: 'right' });
        expect(out).to.equal("{\n        a: {\n        nested: {\n            text: 'repeating object'\n        }\n    },\n        b: {\n        alsoNested: [Circular~ a.nested]\n    },\n     more: [\n        [0] [\n            [0] 'repeating array'\n        ]\n    ],\n    array: [\n        [0] [Circular~ more.0]\n    ],\n      top: [Circular~]\n}");
        done();
    });

    it('will keep a path for an object in Hoek format', function (done) {

        var obj = {
            travel: {
                down: {
                    a: [{
                        path: 'to get here'
                    }]
                }
            }
        };
        var orig = Hoek.clone(obj);

        var out = Purdy.stringify(obj, { plain: false, path: true, align: 'right', depth: null });
        expect(out).to.equal('{\n    \u001b[1m\u001b[37mtravel\u001b[39m\u001b[22m: {\n        \u001b[34m// \u001b[39m\u001b[34mtravel.down\u001b[39m\n        \u001b[1m\u001b[37mdown\u001b[39m\u001b[22m: {\n            \u001b[34m// \u001b[39m\u001b[34mtravel.down.a\u001b[39m\n            \u001b[1m\u001b[37m  a\u001b[39m\u001b[22m: [\n                \u001b[34m// \u001b[39m\u001b[34mtravel.down.a.0\u001b[39m\n                [\u001b[1m\u001b[37m0\u001b[39m\u001b[22m] {\n                    \u001b[34m// \u001b[39m\u001b[34mtravel.down.a.0.path\u001b[39m\n                    \u001b[1m\u001b[37mpath\u001b[39m\u001b[22m: \u001b[33m\'to get here\'\u001b[39m\n                }\n            ]\n        }\n    }\n}');
        expect(obj).to.deep.equal(orig);
        done();
    });

    it('indents object the way it should', function (done) {

        var obj = {
            a: 2323
        };

        var out = Purdy.stringify(obj, { arrayIndex: false, plain: true });
        expect(out).to.equal('{\n    a: 2323\n}');
        done();
    });

    it('aligns object the way it should', function (done) {

        var obj = {
            longthing: 3,
            a: 1,
            b: 1,
            c: 1
        };

        var out = Purdy.stringify(obj, { arrayIndex: false, plain: true, align: 'left' });
        expect(out).to.equal('{\n    longthing: 3,\n    a: 1,\n    b: 1,\n    c: 1\n}');
        out = Purdy.stringify(obj, { arrayIndex: false, plain: true, align: 'right' });
        expect(out).to.equal('{\n    longthing: 3,\n            a: 1,\n            b: 1,\n            c: 1\n}');
        done();
    });

    it('prints directly to console', function (done) {

        var stdout = process.stdout.write;
        var out = '';
        process.stdout.write = function (str) {

            out += str;
        };
        Purdy('hello', { plain: true });
        process.stdout.write = stdout;
        expect(out).to.equal('\'hello\'\n');
        done();
    });

    describe('symbols', function () {

        it('prints symbols', { skip: Object.getOwnPropertySymbols === undefined }, function (done) {

            var blah = Symbol();

            var obj = {
                a: 2323
            };

            obj[blah] = 'symbol';

            var out = Purdy.stringify(obj, { arrayIndex: false, plain: true });
            expect(out).to.equal('{\n    a: 2323,\n    Symbol(): \'symbol\'\n}');
            done();
        });

        it('prints only symbols', { skip: Object.getOwnPropertySymbols === undefined }, function (done) {

            var blah = Symbol('blah');

            var obj = {};

            obj[blah] = 'symbol';

            var out = Purdy.stringify(obj, { arrayIndex: false, plain: true });
            expect(out).to.equal('{\n    Symbol(blah): \'symbol\'\n}');
            done();
        });

        describe('100% coverage', function () {

            it('should have coverage for having getOwnPropertySymbols', { skip: !Object.getOwnPropertySymbols }, function (done) {

                var getOwnPropertySymbols = Object.getOwnPropertySymbols;
                Object.getOwnPropertySymbols = undefined;

                var obj = { a: 3 };


                var out = Purdy.stringify(obj, { plain: true });
                expect(out).to.equal('{\n    a: 3\n}');
                Object.getOwnPropertySymbols = getOwnPropertySymbols;
                done();
            });

            it('should have coverage for not having getOwnPropertySymbols', { skip: !!Object.getOwnPropertySymbols }, function (done) {

                Object.getOwnPropertySymbols = function () {

                    return [];
                };

                var obj = { a: 3 };


                var out = Purdy.stringify(obj, { plain: true });
                expect(out).to.equal('{\n    a: 3\n}');
                Object.getOwnPropertySymbols = undefined;
                done();
            });
        });
    });

    describe('depth', function () {

        it('should handle depth printing', function (done) {

            var obj = {
                count: 1,
                a: {
                    count: 2,
                    b: {
                        count: 3,
                        c: {
                            count: 4
                        }
                    }
                }
            };

            var out = Purdy.stringify(obj, { depth: 1, arrayIndex: false, plain: true });
            expect(out).to.equal('{\n    count: 1,\n    a: {\n        count: 2,\n        b: [Object]\n    }\n}');
            done();
        });

        it('should handle depth printing for array', function (done) {

            var obj = [[[[[[[[[[]]]]]]]]]];

            var out = Purdy.stringify(obj, { depth: 1, arrayIndex: false, plain: true });
            expect(out).to.equal('[\n    [\n        [Object]\n    ]\n]');
            done();
        });

        it('should print using zero depth', function (done) {

            var obj = [[[[[[[[[[]]]]]]]]]];

            var out = Purdy.stringify(obj, { depth: 0, indent: 1, arrayIndex: false, plain: true });
            expect(out).to.equal('[\n [Object]\n]');
            done();
        });

        it('should handle depth printing for mixed', function (done) {

            var obj = {
                count: 1,
                a: {
                    foo: [[[[[[[[[[]]]]]]]]]],
                    count: 2,
                    b: {
                        count: 3,
                        c: {
                            count: 4
                        }
                    }
                }
            };

            var out = Purdy.stringify(obj, { depth: 1, arrayIndex: false, plain: true });
            expect(out).to.equal('{\n    count: 1,\n    a: {\n        foo: [Object],\n        count: 2,\n        b: [Object]\n    }\n}');
            done();
        });

        it('should handle depth printing using null depth', function (done) {

            var obj = {
                count: 1,
                a: {
                    count: 2,
                    b: {
                        count: 3,
                        c: {
                            count: 4
                        }
                    }
                }
            };

            var out = Purdy.stringify(obj, { depth: null, arrayIndex: false, plain: true });
            expect(out).to.equal('{\n    count: 1,\n    a: {\n        count: 2,\n        b: {\n            count: 3,\n            c: {\n                count: 4\n            }\n        }\n    }\n}');
            done();
        });
    });
});

