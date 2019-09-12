module.exports = function (options, defaults) {
	Object.keys(defaults).forEach(function (opt) {
		if (!Object.prototype.hasOwnProperty.call(options, opt)) {
			options[opt] = defaults[opt];
		}
	});
	return options;
};
