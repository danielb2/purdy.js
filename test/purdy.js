'use strict';

const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const Purdy = require('../');

// Test shortcuts
const { expect } = Code;
const { describe, it } = exports.lab = Lab.script();


// Check for ES2015 function name inference

const funcName = function () { };
const funcNameInfer = funcName.name === 'funcName';

describe('Purdy', () => {

    it('should print keys with spaces using quotes', () => {

        const out = Purdy.stringify({ 'arya killed the night king': 'woot', normal: 'OK' }, { plain: true });
        expect(out).to.equal('{\n    \'arya killed the night king\': \'woot\',\n    normal: \'OK\'\n}');
    });

    it('should print multiple things', () => {

        const purdy = Purdy.purdy({ plain: true });
        const out = purdy.stringify('one', 'two', { three: 3 });
        expect(out).to.equal('\'one\' \'two\' {\n    three: 3\n}');
    });

    describe('json', () => {

        it('should handle printing strings with json', () => {

            const out = Purdy.stringify([1, 2, 1, 1, '{"foo": "bar", "int": 3 }'], { plain: true, json: true });
            expect(out).to.equal('[\n    [0] 1,\n    [1] 2,\n    [2] 1,\n    [3] 1,\n    [4] Json {\n        foo: \'bar\',\n        int: 3\n    }\n]');
        });

        it('should handle printing strings with json - color check', () => {

            const out = Purdy.stringify('{"a":3}', { plain: false, json: true });
            expect(out).to.equal('\u001b[33m\u001b[32m\u001b[32mJson\u001b[32m {\u001b[33m\u001b[39m\n\u001b[33m\u001b[32m    \u001b[1m\u001b[37ma\u001b[32m\u001b[22m: \u001b[1m\u001b[34m3\u001b[32m\u001b[22m\u001b[33m\u001b[39m\n\u001b[33m\u001b[32m}\u001b[33m\u001b[39m');
        });

        it('should only print strings as json wrapped in {} to avoid mistaking for string', () => {

            const out = Purdy.stringify('3', { plain: true, json: true });
            expect(out).to.equal('\'3\'');
        });

        it('shouldnt print json if json is false', () => {

            const out = Purdy.stringify('{"a":3}', { plain: true, json: false });
            expect(out).to.equal('\'{"a":3}\'');
        });

    });

    describe('prototype print', () => {

        it('should print all inherited prototype props as well', () => {

            const person = { firstName: 'billy', lastName: 'Bob' };
            const withAge = Object.create(person);
            withAge.age = 24;
            const withYear = Object.create(withAge);
            withYear.year = 1999;
            withYear.firstName = 'Billy';
            const out = Purdy.stringify(withYear, { plain: true, proto: true });
            expect(out).to.equal('{\n    firstName: \'Billy\',\n    lastName: \'Bob\',\n    age: 24,\n    year: 1999\n}');
        });
    });

    describe('errors', () => {

        it('should display an error', () => {

            const error = new Error('plain error');
            const out = Purdy.stringify(error);
            expect(out).to.match(/\[31mError: plain error/);
        });

        it('should display an error with no error message and property correctly', () => {

            const error = new Error();
            error.murray = 'rothbard';
            const out = Purdy.stringify(error);
            expect(out).to.match(/31mError[^]*murray: 'rothbard'/);
        });

        it('should display an error with properties', () => {

            const error = new Error('error with properties');
            error.code = 'BAD';
            const out = Purdy.stringify(error);
            expect(out).to.match(/31mError: error with properties[^]*code: 'BAD'/);
        });

        it('should display an error with detail', () => {

            const error = new Error('some bad, bad error');
            error.withKey = 'key';
            error.withMore = 'more';
            const obj = {
                theError: error
            };
            const out = Purdy.stringify(obj, { depth: null });
            expect(out).to.match(/theError[^]*: { [^]*31mError: some bad, bad error[^]*withKey: 'key'[^]*withMore: 'more'/);
        });
    });

    describe('buffers', () => {

        it('should print as string if detected', () => {

            const buffer = new Buffer.from('some longer string here that we dont actually want to print. maybe.');
            const out = Purdy.stringify({ buffer });
            expect(out).to.match(/<Buffer some longer string here t ... >/);

        });

        it('should not print ... if string is short', () => {

            const buffer = new Buffer.from('shorter');
            const out = Purdy.stringify({ buffer });
            expect(out).to.equal('{\n    \u001b[1m\u001b[37mbuffer\u001b[39m\u001b[22m: <Buffer shorter>\n}');
        });

        it('should print binary', () => {

            const fs = require('fs');

            fs.readFile('/bin/sh', (err, data) => {

                err = null;
                const out = Purdy.stringify({ data });
                expect(out).to.match(/data.*Buffer/);
            });
        });
    });

    it('should print an object without a constructor', () => {

        const out = Purdy.stringify({ constructor: null });
        expect(out).to.equal('{\n    \u001b[1m\u001b[37mconstructor\u001b[39m\u001b[22m: \u001b[1m\u001b[31mnull\u001b[39m\u001b[22m\n}');
    });

    it('should indent array correctly', () => {

        const out = Purdy.stringify([1, 2, 1, 1, 1, 1, 12, [1, 2]]);
        expect(out).to.equal('[\n    [\u001b[1m\u001b[37m0\u001b[39m\u001b[22m] \u001b[1m\u001b[34m1\u001b[39m\u001b[22m,\n    [\u001b[1m\u001b[37m1\u001b[39m\u001b[22m] \u001b[1m\u001b[34m2\u001b[39m\u001b[22m,\n    [\u001b[1m\u001b[37m2\u001b[39m\u001b[22m] \u001b[1m\u001b[34m1\u001b[39m\u001b[22m,\n    [\u001b[1m\u001b[37m3\u001b[39m\u001b[22m] \u001b[1m\u001b[34m1\u001b[39m\u001b[22m,\n    [\u001b[1m\u001b[37m4\u001b[39m\u001b[22m] \u001b[1m\u001b[34m1\u001b[39m\u001b[22m,\n    [\u001b[1m\u001b[37m5\u001b[39m\u001b[22m] \u001b[1m\u001b[34m1\u001b[39m\u001b[22m,\n    [\u001b[1m\u001b[37m6\u001b[39m\u001b[22m] \u001b[1m\u001b[34m12\u001b[39m\u001b[22m,\n    [\u001b[1m\u001b[37m7\u001b[39m\u001b[22m] [\n        [\u001b[1m\u001b[37m0\u001b[39m\u001b[22m] \u001b[1m\u001b[34m1\u001b[39m\u001b[22m,\n        [\u001b[1m\u001b[37m1\u001b[39m\u001b[22m] \u001b[1m\u001b[34m2\u001b[39m\u001b[22m\n    ]\n]');
    });

    it('allows for removal of array index', () => {

        const out = Purdy.stringify([1, 2, 1, 1, 1, 1, 12, [1, 2]], { plain: true, arrayIndex: false });
        expect(out).to.equal('[\n    1,\n    2,\n    1,\n    1,\n    1,\n    1,\n    12,\n    [\n        1,\n        2\n    ]\n]');
    });

    it('honors indent level', () => {

        const out = Purdy.stringify([1, 2, 1, 1, 1, 1, 12, [1, 2]], { plain: true, arrayIndex: false, indent: 2 });
        expect(out).to.equal('[\n  1,\n  2,\n  1,\n  1,\n  1,\n  1,\n  12,\n  [\n    1,\n    2\n  ]\n]');
    });

    it('prints arguments function', () => {

        const afunc = function () {

            // eslint-disable-next-line prefer-rest-params
            const out = Purdy.stringify(arguments, { depth: null, plain: true, arrayIndex: false, indent: 2 });
            expect(out).to.equal('[\n  \'hello\',\n  \'purdy\'\n]');
        };

        afunc('hello', 'purdy');
    });

    it('should print plain', () => {

        const out = Purdy.stringify('plain', { plain: true });
        expect(out).to.equal('\'plain\'');
    });

    it('should handle circular references', () => {

        const circularObj = {};
        circularObj.a = circularObj;
        const circ = [];
        circ.push(circ);
        let out = Purdy.stringify(circularObj);
        expect(out).to.equal('{\n    \u001b[1m\u001b[37ma\u001b[39m\u001b[22m: \u001b[1m\u001b[90m[Circular~]\u001b[39m\u001b[22m\n}');
        out = Purdy.stringify(circ);
        expect(out).to.equal('[\n    [\u001b[1m\u001b[37m0\u001b[39m\u001b[22m] \u001b[1m\u001b[90m[Circular~]\u001b[39m\u001b[22m\n]');
    });

    describe('functions', () => {

        it('should print constructor name', () => {

            const mises = function mises() {

                this.moop = 3;
            };

            const obj = { instance: new mises() };
            const out = Purdy.stringify(obj, { indent: 1 });
            expect(out).to.equal('{\n \u001b[1m\u001b[37minstance\u001b[39m\u001b[22m: \u001b[32mmises\u001b[39m {\n  \u001b[1m\u001b[37mmoop\u001b[39m\u001b[22m: \u001b[1m\u001b[34m3\u001b[39m\u001b[22m\n }\n}');
        });

        it('should print not print common constructor', () => {

            const mises = function () {

                this.moop = 3;
            };

            const obj = { instance: new mises() };
            const out = Purdy.stringify(obj, { indent: 1 });
            const inferred = funcNameInfer ? '\u001b[32mmises\u001b[39m ' : '';
            const expected = '{\n \u001b[1m\u001b[37minstance\u001b[39m\u001b[22m: ' + inferred + '{\n  \u001b[1m\u001b[37mmoop\u001b[39m\u001b[22m: \u001b[1m\u001b[34m3\u001b[39m\u001b[22m\n }\n}';
            expect(out).to.equal(expected);
        });

        it('should print a function', () => {

            const out = Purdy.stringify(Array.isArray);
            expect(out).to.equal('\u001b[36m[Function: isArray]\u001b[39m');
        });

        it('should print an anonymous function', () => {

            const out = Purdy.stringify(() => { });
            const expected = '\u001b[36m[Function]\u001b[39m';
            expect(out).to.equal(expected);
        });

        it('should print properties for functions', () => {

            const obj = function () { };

            obj.property = 3;

            const out = Purdy.stringify(obj, { indent: 1, plain: false });
            const inferred = funcNameInfer ? ': obj' : '';
            const expected = '{ \u001b[36m[Function' + inferred + ']\u001b[39m\n \u001b[1m\u001b[37mproperty\u001b[39m\u001b[22m: \u001b[1m\u001b[34m3\u001b[39m\u001b[22m\n}';
            expect(out).to.equal(expected);
        });

        it('should print properties for functions with name', () => {

            const obj = function Liberty() { };

            obj.property = 3;

            const out = Purdy.stringify(obj, { indent: 1, plain: false });
            expect(out).to.equal('{ \u001b[36m[Function: Liberty]\u001b[39m\n \u001b[1m\u001b[37mproperty\u001b[39m\u001b[22m: \u001b[1m\u001b[34m3\u001b[39m\u001b[22m\n}');
        });
    });


    it('should print a string', () => {

        const out = Purdy.stringify('hello purdy');
        expect(out).to.equal('\u001b[33m\'hello purdy\'\u001b[39m');
    });

    it('should print a date', () => {

        const out = Purdy.stringify(new Date(2014, 5, 6, 21, 22, 21));
        expect(out).to.equal('\u001b[32m' + new Date(2014, 5, 6, 21, 22, 21) + '\u001b[39m');
    });

    it('should print a number', () => {

        const out = Purdy.stringify(123);
        expect(out).to.equal('\u001b[1m\u001b[34m123\u001b[39m\u001b[22m');
    });

    it('should print null', () => {

        const out = Purdy.stringify(null);
        expect(out).to.equal('\u001b[1m\u001b[31mnull\u001b[39m\u001b[22m');
    });

    it('should print undefined', () => {

        const out = Purdy.stringify(undefined);
        expect(out).to.equal('\u001b[7m\u001b[31mundefined\u001b[39m\u001b[27m');
    });

    it('should print a regular expression', () => {

        const out = Purdy.stringify(new RegExp());
        expect(out).to.equal('\u001b[35m/(?:)/\u001b[39m');
    });

    it('should print a false boolean', () => {

        const out = Purdy.stringify(false);
        expect(out).to.equal('\u001b[1m\u001b[31mfalse\u001b[39m\u001b[22m');
    });

    it('should print a true boolean', () => {

        const out = Purdy.stringify(true);
        expect(out).to.equal('\u001b[1m\u001b[32mtrue\u001b[39m\u001b[22m');
    });

    it('should print an empty array without extra indentation', () => {

        const out = Purdy.stringify([]);
        expect(out).to.equal('[]');
    });

    it('should print an empty object without extra indentation', () => {

        const out = Purdy.stringify({});
        expect(out).to.equal('{}');
    });

    it('should print a more complex object', () => {

        const out = Purdy.stringify({
            array: [1, 2, [1, 2]],
            object: { another: 'string' }
        }, { align: 'right' });

        expect(out).to.equal('{\n    \u001b[1m\u001b[37m array\u001b[39m\u001b[22m: [\n        [\u001b[1m\u001b[37m0\u001b[39m\u001b[22m] \u001b[1m\u001b[34m1\u001b[39m\u001b[22m,\n        [\u001b[1m\u001b[37m1\u001b[39m\u001b[22m] \u001b[1m\u001b[34m2\u001b[39m\u001b[22m,\n        [\u001b[1m\u001b[37m2\u001b[39m\u001b[22m] [\n            [\u001b[1m\u001b[37m0\u001b[39m\u001b[22m] \u001b[1m\u001b[34m1\u001b[39m\u001b[22m,\n            [\u001b[1m\u001b[37m1\u001b[39m\u001b[22m] \u001b[1m\u001b[34m2\u001b[39m\u001b[22m\n        ]\n    ],\n    \u001b[1m\u001b[37mobject\u001b[39m\u001b[22m: {\n        \u001b[1m\u001b[37manother\u001b[39m\u001b[22m: \u001b[33m\'string\'\u001b[39m\n    }\n}');
    });

    it('should not print circular after second use', () => {

        const obj = { a: 3 };
        Purdy.stringify(obj);
        const out = Purdy.stringify(obj, { plain: true });
        expect(out).to.not.equal('[Circular]');
    });

    it('shows circular reference with path', () => {

        const repeatObj = {
            text: 'repeating object'
        };
        const repeatArr = ['repeating array'];

        const obj = {
            a: { nested: repeatObj },
            b: { alsoNested: repeatObj },
            more: [repeatArr],
            array: [repeatArr]

        };
        obj.top = obj;
        const out = Purdy.stringify(obj, { plain: true, align: 'right' });
        expect(out).to.equal('{\n        a: {\n        nested: {\n            text: \'repeating object\'\n        }\n    },\n        b: {\n        alsoNested: [Circular~ a.nested]\n    },\n     more: [\n        [0] [\n            [0] \'repeating array\'\n        ]\n    ],\n    array: [\n        [0] [Circular~ more.0]\n    ],\n      top: [Circular~]\n}');
    });

    it('will keep a path for an object in Hoek format', () => {

        const obj = {
            travel: {
                down: {
                    a: [{
                        path: 'to get here'
                    }]
                }
            }
        };
        const orig = Object.assign({}, obj);

        const out = Purdy.stringify(obj, { plain: false, path: true, align: 'right', depth: null });
        expect(out).to.equal('{\n    \u001b[1m\u001b[37mtravel\u001b[39m\u001b[22m: {\n        \u001b[34m// \u001b[39m\u001b[34mtravel.down\u001b[39m\n        \u001b[1m\u001b[37mdown\u001b[39m\u001b[22m: {\n            \u001b[34m// \u001b[39m\u001b[34mtravel.down.a\u001b[39m\n            \u001b[1m\u001b[37m  a\u001b[39m\u001b[22m: [\n                \u001b[34m// \u001b[39m\u001b[34mtravel.down.a.0\u001b[39m\n                [\u001b[1m\u001b[37m0\u001b[39m\u001b[22m] {\n                    \u001b[34m// \u001b[39m\u001b[34mtravel.down.a.0.path\u001b[39m\n                    \u001b[1m\u001b[37mpath\u001b[39m\u001b[22m: \u001b[33m\'to get here\'\u001b[39m\n                }\n            ]\n        }\n    }\n}');
        expect(obj).to.equal(orig);
    });

    it('indents object the way it should', () => {

        const obj = {
            a: 2323
        };

        const out = Purdy.stringify(obj, { arrayIndex: false, plain: true });
        expect(out).to.equal('{\n    a: 2323\n}');
    });

    it('aligns object the way it should', () => {

        const obj = {
            longthing: 3,
            a: 1,
            b: 1,
            c: 1
        };

        let out = Purdy.stringify(obj, { arrayIndex: false, plain: true, align: 'left' });
        expect(out).to.equal('{\n    longthing: 3,\n    a: 1,\n    b: 1,\n    c: 1\n}');
        out = Purdy.stringify(obj, { arrayIndex: false, plain: true, align: 'right' });
        expect(out).to.equal('{\n    longthing: 3,\n            a: 1,\n            b: 1,\n            c: 1\n}');
    });

    it('prints directly to console', () => {

        const stdout = process.stdout.write;
        let out = '';
        process.stdout.write = function (str) {

            out += str;
        };

        Purdy('hello', { plain: true });
        process.stdout.write = stdout;
        expect(out).to.equal('\'hello\'\n');
    });

    describe('symbols', () => {

        it('prints symbols', { skip: Object.getOwnPropertySymbols === undefined }, () => {

            const blah = Symbol();

            const obj = {
                a: 2323
            };

            obj[blah] = 'symbol';

            const out = Purdy.stringify(obj, { arrayIndex: false, plain: true });
            expect(out).to.equal('{\n    a: 2323,\n    Symbol(): \'symbol\'\n}');
        });

        it('prints only symbols', { skip: Object.getOwnPropertySymbols === undefined }, () => {

            const blah = Symbol('blah');

            const obj = {};

            obj[blah] = 'symbol';

            const out = Purdy.stringify(obj, { arrayIndex: false, plain: true });
            expect(out).to.equal('{\n    Symbol(blah): \'symbol\'\n}');
        });

        describe('100% coverage', () => {

            it('should have coverage for having getOwnPropertySymbols', { skip: !Object.getOwnPropertySymbols }, () => {

                const getOwnPropertySymbols = Object.getOwnPropertySymbols;
                Object.getOwnPropertySymbols = undefined;

                const obj = { a: 3 };


                const out = Purdy.stringify(obj, { plain: true });
                expect(out).to.equal('{\n    a: 3\n}');
                Object.getOwnPropertySymbols = getOwnPropertySymbols;
            });

            it('should have coverage for not having getOwnPropertySymbols', { skip: !!Object.getOwnPropertySymbols }, () => {

                Object.getOwnPropertySymbols = function () {

                    return [];
                };

                const obj = { a: 3 };


                const out = Purdy.stringify(obj, { plain: true });
                expect(out).to.equal('{\n    a: 3\n}');
                Object.getOwnPropertySymbols = undefined;
            });
        });
    });

    describe('depth', () => {

        it('should handle depth printing', () => {

            const obj = {
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

            const out = Purdy.stringify(obj, { depth: 1, arrayIndex: false, plain: true });
            expect(out).to.equal('{\n    count: 1,\n    a: {\n        count: 2,\n        b: [Object]\n    }\n}');
        });

        it('should handle depth printing for array', () => {

            const obj = [[[[[[[[[[]]]]]]]]]];

            const out = Purdy.stringify(obj, { depth: 1, arrayIndex: false, plain: true });
            expect(out).to.equal('[\n    [\n        [Object]\n    ]\n]');
        });

        it('should print using zero depth', () => {

            const obj = [[[[[[[[[[]]]]]]]]]];

            const out = Purdy.stringify(obj, { depth: 0, indent: 1, arrayIndex: false, plain: true });
            expect(out).to.equal('[\n [Object]\n]');
        });

        it('should handle depth printing for mixed', () => {

            const obj = {
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

            const out = Purdy.stringify(obj, { depth: 1, arrayIndex: false, plain: true });
            expect(out).to.equal('{\n    count: 1,\n    a: {\n        foo: [Object],\n        count: 2,\n        b: [Object]\n    }\n}');
        });

        it('should handle depth printing using null depth', () => {

            const obj = {
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

            const out = Purdy.stringify(obj, { depth: null, arrayIndex: false, plain: true });
            expect(out).to.equal('{\n    count: 1,\n    a: {\n        count: 2,\n        b: {\n            count: 3,\n            c: {\n                count: 4\n            }\n        }\n    }\n}');
        });
    });
});
