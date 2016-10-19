var purdy = require('.');

if (console.log !== purdy) {
    console.log = purdy;
}
