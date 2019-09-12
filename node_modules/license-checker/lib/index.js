
/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

var UNKNOWN = 'UNKNOWN';
var fs = require('fs');
var path = require('path');
var read = require('read-installed');
var chalk = require('chalk');
var treeify = require('treeify');
var license = require('./license');

var parentPath = function(packageInfo) {
    if (packageInfo) {
        var name = packageInfo.name || 'UNDEFINED';
        if (packageInfo.parent) {
            return name + ':' + parentPath(packageInfo.parent)
        }
        else {
            return name;
        }
    }
    else {
       return   'UNDEFINED';
    }
};

var flatten = function(options) {
    var moduleInfo = {licenses: UNKNOWN},
        json = options.deps,
        data = options.data,
        colorize = options.color,
        licenseData, files, licenseFile, key;

    if (colorize) {
      moduleInfo = {licenses: chalk.bold.red(UNKNOWN)};
      key = chalk.blue(json.name) + chalk.dim('@') + chalk.green(json.version);
    } else {
      moduleInfo = {licenses: UNKNOWN};
      key = json.name + '@' + json.version;
    }

    data[key] = moduleInfo;

    if (json.repository) {
        if (typeof json.repository === 'object' && typeof json.repository.url === 'string') {
            moduleInfo.repository = json.repository.url.replace('git+ssh://git@', 'git://').replace('.git', '');
            moduleInfo.repository = moduleInfo.repository.replace('git+https://github.com', 'https://github.com').replace('.git', '');
            moduleInfo.repository = moduleInfo.repository.replace('git://github.com', 'https://github.com').replace('.git', '');
            moduleInfo.repository = moduleInfo.repository.replace('git@github.com:', 'https://github.com/').replace('.git', '');
        }
    }
    if (json.url) {
        if (typeof json.url === 'object') {
            moduleInfo.url = json.url.web;
        }
    }

    licenseData = json.license || json.licenses || undefined;
    var checkReadme = false;
    if (licenseData) {
        if (Array.isArray(licenseData) && licenseData.length > 0) {
            moduleInfo.licenses = licenseData.map(function(license){
                if (typeof license === 'object') {
                    return license.type;
                } else if (typeof license === 'string') {
                    return license;
                }
            });
            moduleInfo.licenseUrl = licenseData.map(function(license){
                if (typeof license === 'object') {
                    return license.url || null;
                }
            }).join();
        } else if (typeof licenseData === 'object' && licenseData.type) {
            moduleInfo.licenses = licenseData.type;
            moduleInfo.licenseUrl  = licenseData.url;
        } else if (typeof licenseData === 'string') {
            moduleInfo.licenses = licenseData;
        }
    } else if (license(json.readme) !== null) {
        moduleInfo.licenses = license(json.readme);
        checkReadme = true;
    }

    if (json.path) {
        files = fs.readdirSync(json.path).filter(function(filename) {
            filename = filename.toUpperCase();
            return filename.indexOf('LICENSE') > -1 || filename.indexOf('LICENCE') > -1 || filename.indexOf('COPYING') > -1 ||
              (checkReadme && filename.indexOf('README') > -1);
        });

        files.forEach(function(filename) {
            licenseFile = path.join(json.path, filename);
            // Checking that the file is in fact a normal file and not a directory for example.
            if (fs.lstatSync(licenseFile).isFile()) {
                // Asking for absolute path overrides asking for relative
                if (options.global.relativeLicensePath && !options.global.absoluteLicensePath) {
                    moduleInfo.licenseFile = path.relative(options.global.start, licenseFile)
                }
                if (options.global.absoluteLicensePath) {
                    moduleInfo.licenseFile = path.normalize(licenseFile);
                }
                if (! moduleInfo.licenses) {
                    var tempLicense = license(fs.readFileSync(licenseFile, {encoding: 'utf8'}));
                    if (tempLicense !== null) {
                        moduleInfo.licenses = tempLicense;
                    }
                }
                if (! moduleInfo.licenseUrl && moduleInfo.repository && moduleInfo.repository.indexOf('github.com') > -1) {
                    moduleInfo.licenseUrl = moduleInfo.repository.replace('git://', 'https://') + '/raw/master/' + filename;
                }
            }
        });
    }
    if (! moduleInfo.licenseUrl) {
        if (! moduleInfo.repository && json.homepage) {
            moduleInfo.licenseUrl = json.homepage;
        }
        else if (moduleInfo.repository) {
            moduleInfo.licenseUrl = moduleInfo.repository.replace('git://', 'https://');
        }
    }

    if (Array.isArray(moduleInfo.licenses)) {
        moduleInfo.licenses = moduleInfo.licenses.join();
    }
    moduleInfo.parents = parentPath(json.parent);

    if (json.dependencies) {
        Object.keys(json.dependencies).forEach(function(name) {
            var childDependency = json.dependencies[name],
                dependencyId = childDependency.name + '@' + childDependency.version;
            if (options.filter && options.filter(name, childDependency)) {
                return;
            }
            if (data[dependencyId]) { // already exists
                return;
            }
            if (childDependency.path) {
                data = flatten({
                    deps: childDependency,
                    data: data,
                    color: colorize,
                    filter: options.filter,
                    global: options.global
                });
            }
        });
    }
    return data;
};

exports.init = function(options, callback) {

    console.log('scanning' , options.start);
    read(options.start, { dev: true }, function(err, json) {
        var data = flatten({
                deps: json,
                data: {},
                color: options.color,
                filter: options.filter,
                global: options
            }),
            sorted = {};
        Object.keys(data).sort().forEach(function(item) {
            if (options.unknown) {
                if (data[item].licenses && data[item].licenses !== UNKNOWN) {
                    if (data[item].licenses.indexOf('*') < 0) {
                        delete data[item];
                    }
                }
            }
            if (data[item]) {
                sorted[item] = data[item];
            }
        });
        callback(sorted);
    });
};

exports.print = function(sorted) {
    console.log(treeify.asTree(sorted, true));
};

exports.asCSV = function(sorted, options) {
    options = options = options || {};
    var format;
    if (options.relativeLicensePath || options.absoluteLicensePath) {
        format = ["module name", "licenses", "repository", "licenseUrl", "licenseFile", "parents"]
    }
    else {
        format = ["module name", "licenses", "repository", "licenseUrl", "parents"]
    }
    var header = [];
    Object.keys(format).forEach(function (index) {
        header.push('"' + format[index] + '"')
    });
    var text = [header.join(',')];
    Object.keys(sorted).forEach(function(key) {
        var module = sorted[key],
          line = [];
        Object.keys(format).forEach(function (index) {
            if (format[index] === 'module name') {
                line.push('"' + key + '"')
            }
            else {
                line.push('"' + (module[format[index]] || '') + '"')
            }
        });
        text.push(line.join(','));
    });

    return text.join('\n');
};
