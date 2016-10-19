# Purdy ![build](https://travis-ci.org/danielb2/purdy.js.svg) ![coverage](https://img.shields.io/badge/coverage-100%25-green.svg)

Print things real purdy for nodejs.

## Usage

```javascript
    var Purdy = require('purdy');
    Purdy({list: [1,2,3], string: 'some string'});
```

### `Purdy(object, [options])`

![image](https://github.com/danielb2/purdy/raw/master/example.png)

Prints anything indented, and with arrays with index keys, and different
types in colors such that it's very easy to get an overview of what object
you're dealing with.

* `object` - anything, number, object, array, etc.
* `options` - optional object with the following keys.
    * `plain` - when `true`, prints result without colors. Defaults to `false` with tty, `true` when not.
    * `path` - when `true`, prints result with a path (To be used with [Hoek.reach()](https://github.com/spumko/hoek#reachobj-chain-options))
    * `pathPrefix` - prefix for path. default: `// `
    * `arrayIndex` - enables index printing for arrays. default: `true`
    * `indent` - defines the number of spaces to indent default: `4`
    * `align` - determines how to align object keys. default: `left`
    * `depth` - tells purdy how many times to recurse while formatting the object. This is useful for viewing complicated objects. default: `2`. Set to `null` to recurse indefinitely


### `Purdy.stringify(object, [options])`

This function returns a string without printing it to stdout. This may prove
to be useful for log files other other applications.

``` javascript
var purdyString = Purdy.stringify({a: 'b'}, {plain: true});
writeLog(purdyString);
```

### Examples

The following code prints what's in the image above.

``` javascript
var mises = function mises () { this.moop = 3 }
var instance = new mises();
var circularObj = { };
circularObj.a = circularObj;
var obj = {
    integer: Date.now(),
    string: 'foo',
    anonPurdy: Purdy,
    defined: function Yes() {},
    nested: {hello: 'hapi'},
    error: new Error('bad'),
    null: null,
    undefined: undefined,
    regexp: new RegExp,
    falseBool: false,
    trueBool: true,
    symbol: Symbol('purdy'),
    emptyArr: [],
    circular: circularObj,
    date: new Date(),
    arrayWithVisibleIndex: [ 'one', 'two', 'three' ],
    instance: instance,
};
Purdy(obj);

```


### Command-line Interface

This package also installs the `purdy` CLI tool. Right now this just prints
any JSON file with default options.

`purdy package.json` will, for example, print the JSON contents of
package.json.

Similarly, `cat package.json | purdy -`  will use stdin to print the contents.

### Replace Global `console.log` (use with caution)

If one would like,
in a certain Node.js process,
to have `console.log` replaced by `purdy`,
one could do

``` js
require('purdy/replace')
```

Or

``` sh
$ node --require purdy/replace [rest of the arguments]
```

See
[`$node --require`](https://nodejs.org/api/cli.html#cli_r_require_module).


## Acknowledgements
* Michael Dvorkin for [Awesome Print]

[Awesome Print]: https://github.com/michaeldv/awesome_print
