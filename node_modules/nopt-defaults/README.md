# nopt-defaults

*Default options for [nopt](https://github.com/npm/nopt)*

## Usage

```
npm install nopt nopt-defaults
```

```js
// my-program.js
var nopt = require('nopt');
var noptDefaults = require('nopt-defaults');

var knownOpts = {
    foo: String,
    bloo: ['big', 'medium', 'small'],
    flag: Boolean
};

var defaults = {
    bloo: 'medium',
    flag: true
};

var parsed = noptDefaults(nopt(knownOpts), defaults);
console.log(parsed);
```

Examples:

```bash
$ node my-program.js
{ "bloo": "medium", "flag": true }

$ node my-program.js --bloo big
{ "bloo": "big", "flag": true }

$ node my-program.js --no-flag
{ "bloo": "medium", "flag": false }

$ node my-program.js --flag false
{ "bloo": "medium", "flag": false }

$ node my-program.js --foo Hi
{ "foo": "Hi", "bloo": "medium", "flag": false }
```

## License

Licensed under the [BSD 3-Clause License](http://opensource.org/licenses/BSD-3-Clause), the full text of which can be read in [LICENSE](LICENSE).
