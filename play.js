const util = require('util');
var x = 'hello'
console.log(util.inspect(x, {showHidden: false, depth: null}))
