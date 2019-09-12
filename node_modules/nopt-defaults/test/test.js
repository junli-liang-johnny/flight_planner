var assert       = require('assert');
var noptDefaults = require('../');

describe('options that are already present', function () {
	var output = {
		foo: true,
		bar: 0,
		baz: null
	};

	var defaults = {
		foo: 42,
		bar: 'JustAString',
		baz: true
	};

	it('should not be overwritten', function () {
		var options = noptDefaults(output, defaults);

		assert.equal(Object.keys(options).length, 3);
		assert.equal(options.foo, true);
		assert.equal(options.bar, 0);
		assert.equal(options.baz, null);
	});
});

describe('missing options', function () {
	var output = {
		foo: null,
	};

	var defaults = {
		foo: false,
		bar: 'HiThere',
		baz: null,
		bat: 255
	};

	it('should be supplied', function () {
		var options = noptDefaults(output, defaults);

		assert.equal(Object.keys(options).length, 4);
		assert.equal(output.foo, null);
		assert.equal(options.bar, 'HiThere');
		assert.equal(options.baz, null);
		assert.equal(options.bat, 255);
	});
});
