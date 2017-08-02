'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fromDirectory = undefined;

var _slicedToArray2;

function _load_slicedToArray() {
  return _slicedToArray2 = _interopRequireDefault(require('babel-runtime/helpers/slicedToArray'));
}

var _extends2;

function _load_extends() {
  return _extends2 = _interopRequireDefault(require('babel-runtime/helpers/extends'));
}

var _toConsumableArray2;

function _load_toConsumableArray() {
  return _toConsumableArray2 = _interopRequireDefault(require('babel-runtime/helpers/toConsumableArray'));
}

var _regenerator;

function _load_regenerator() {
  return _regenerator = _interopRequireDefault(require('babel-runtime/regenerator'));
}

var _asyncToGenerator2;

function _load_asyncToGenerator() {
  return _asyncToGenerator2 = _interopRequireDefault(require('babel-runtime/helpers/asyncToGenerator'));
}

var fromDirectory = exports.fromDirectory = function () {
  var _ref = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee(sandboxPath) {
    var resolutionCache, resolveCached, buildCache, crawlBuildCached, env, crawlContext, packageJsonPath, root;
    return (_regenerator || _load_regenerator()).default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            crawlBuildCached = function crawlBuildCached(baseDirectory, context) {
              var build = buildCache.get(baseDirectory);
              if (build == null) {
                build = crawlBuild(baseDirectory, context);
                buildCache.set(baseDirectory, build);
              }
              return build;
            };

            resolveCached = function resolveCached(packageName, baseDir) {
              var key = `${baseDir}__${packageName}`;
              var resolution = resolutionCache.get(key);
              if (resolution == null) {
                resolution = (0, (_util || _load_util()).resolve)(packageName, baseDir);
                resolutionCache.set(key, resolution);
              }
              return resolution;
            };

            // Caching module resolution actually speed ups sandbox crawling a lot.
            resolutionCache = new Map();
            buildCache = new Map();
            env = getEnvironment();
            crawlContext = {
              env,
              sandboxPath,
              resolve: resolveCached,
              crawlBuild: crawlBuildCached,
              dependencyTrace: []
            };
            packageJsonPath = (_path || _load_path()).join(sandboxPath, 'package.json');
            _context.next = 9;
            return crawlBuild(packageJsonPath, crawlContext);

          case 9:
            root = _context.sent;
            return _context.abrupt('return', { env, root });

          case 11:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function fromDirectory(_x) {
    return _ref.apply(this, arguments);
  };
}();

var crawlDependencies = function () {
  var _ref2 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee2(baseDir, dependencySpecs, context) {
    var dependencies, errors, missingPackages, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, spec, _parseDependencySpec, _name, dependencyPackageJsonPath, _build;

    return (_regenerator || _load_regenerator()).default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            dependencies = new Map();
            errors = [];
            missingPackages = [];
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context2.prev = 6;
            _iterator = dependencySpecs[Symbol.iterator]();

          case 8:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context2.next = 33;
              break;
            }

            spec = _step.value;
            _parseDependencySpec = parseDependencySpec(spec), _name = _parseDependencySpec.name;

            if (!(context.dependencyTrace.indexOf(_name) > -1)) {
              _context2.next = 14;
              break;
            }

            errors.push({
              message: formatCircularDependenciesError(_name, context)
            });
            return _context2.abrupt('continue', 30);

          case 14:
            dependencyPackageJsonPath = '/does/not/exists';
            _context2.prev = 15;
            _context2.next = 18;
            return context.resolve(`${_name}/package.json`, baseDir);

          case 18:
            dependencyPackageJsonPath = _context2.sent;
            _context2.next = 25;
            break;

          case 21:
            _context2.prev = 21;
            _context2.t0 = _context2['catch'](15);

            missingPackages.push(_name);
            return _context2.abrupt('continue', 30);

          case 25:
            _context2.next = 27;
            return context.crawlBuild(dependencyPackageJsonPath, context);

          case 27:
            _build = _context2.sent;


            errors.push.apply(errors, (0, (_toConsumableArray2 || _load_toConsumableArray()).default)(_build.errors));
            dependencies.set(_build.id, _build);

          case 30:
            _iteratorNormalCompletion = true;
            _context2.next = 8;
            break;

          case 33:
            _context2.next = 39;
            break;

          case 35:
            _context2.prev = 35;
            _context2.t1 = _context2['catch'](6);
            _didIteratorError = true;
            _iteratorError = _context2.t1;

          case 39:
            _context2.prev = 39;
            _context2.prev = 40;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 42:
            _context2.prev = 42;

            if (!_didIteratorError) {
              _context2.next = 45;
              break;
            }

            throw _iteratorError;

          case 45:
            return _context2.finish(42);

          case 46:
            return _context2.finish(39);

          case 47:

            if (missingPackages.length > 0) {
              errors.push({
                message: formatMissingPackagesError(missingPackages, context)
              });
            }

            return _context2.abrupt('return', { dependencies, errors });

          case 49:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[6, 35, 39, 47], [15, 21], [40,, 42, 46]]);
  }));

  return function crawlDependencies(_x2, _x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

var crawlBuild = function () {
  var _ref3 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee3(packageJsonPath, context) {
    var sourcePath, packageJson, isRootBuild, command, dependencySpecs, _ref4, dependencies, errors, nextErrors, isInstalled, realSourcePath, source, nextSourcePath, id, spec;

    return (_regenerator || _load_regenerator()).default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            sourcePath = (_path || _load_path()).dirname(packageJsonPath);
            _context3.next = 3;
            return readPackageJson(packageJsonPath);

          case 3:
            packageJson = _context3.sent;
            isRootBuild = context.sandboxPath === sourcePath;
            command = null;

            if (packageJson.esy.build != null) {
              if (!Array.isArray(packageJson.esy.build)) {
                command = [packageJson.esy.build];
              } else {
                command = packageJson.esy.build;
              }
            }

            dependencySpecs = objectToDependencySpecs(packageJson.dependencies, packageJson.peerDependencies);
            _context3.next = 10;
            return crawlDependencies(sourcePath, dependencySpecs, (0, (_extends2 || _load_extends()).default)({}, context, {
              dependencyTrace: context.dependencyTrace.concat(packageJson.name)
            }));

          case 10:
            _ref4 = _context3.sent;
            dependencies = _ref4.dependencies;
            errors = _ref4.errors;
            nextErrors = [].concat((0, (_toConsumableArray2 || _load_toConsumableArray()).default)(errors));
            isInstalled = packageJson._resolved != null;
            _context3.next = 17;
            return (_fs || _load_fs()).realpath(sourcePath);

          case 17:
            realSourcePath = _context3.sent;
            source = packageJson._resolved || `local:${realSourcePath}`;
            nextSourcePath = (_path || _load_path()).relative(context.sandboxPath, sourcePath);
            id = calculateBuildId(context.env, packageJson, source, dependencies);
            spec = {
              id,
              name: packageJson.name,
              version: packageJson.version,
              exportedEnv: packageJson.esy.exportedEnv,
              command,
              shouldBePersisted: !(isRootBuild || !isInstalled),
              mutatesSourcePath: !!packageJson.esy.buildsInSource,
              sourcePath: nextSourcePath,
              packageJson,
              dependencies,
              errors: nextErrors
            };
            return _context3.abrupt('return', spec);

          case 23:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function crawlBuild(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}();

var readPackageJson = function () {
  var _ref5 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee4(filename) {
    var packageJson;
    return (_regenerator || _load_regenerator()).default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return (_fs || _load_fs()).readJson(filename);

          case 2:
            packageJson = _context4.sent;

            if (packageJson.esy == null) {
              packageJson.esy = {
                build: null,
                exportedEnv: {},
                buildsInSource: false
              };
            }
            if (packageJson.esy.build == null) {
              packageJson.esy.build = null;
            }
            if (packageJson.esy.exportedEnv == null) {
              packageJson.esy.exportedEnv = {};
            }
            if (packageJson.esy.buildsInSource == null) {
              packageJson.esy.buildsInSource = false;
            }
            return _context4.abrupt('return', packageJson);

          case 8:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function readPackageJson(_x7) {
    return _ref5.apply(this, arguments);
  };
}();

var _path;

function _load_path() {
  return _path = _interopRequireWildcard(require('path'));
}

var _outdent;

function _load_outdent() {
  return _outdent = _interopRequireDefault(require('outdent'));
}

var _fs;

function _load_fs() {
  return _fs = _interopRequireWildcard(require('./lib/fs'));
}

var _util;

function _load_util() {
  return _util = require('./util');
}

var _environment;

function _load_environment() {
  return _environment = _interopRequireWildcard(require('./environment'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getEnvironment() {
  return (_environment || _load_environment()).fromEntries([{
    name: 'PATH',
    value: '$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
    exclusive: false,
    builtIn: true,
    exported: true
  }, {
    name: 'SHELL',
    value: 'env -i /bin/bash --norc --noprofile',
    exclusive: false,
    builtIn: true,
    exported: true
  }]);
}

function calculateBuildId(env, packageJson, source, dependencies) {
  var name = packageJson.name,
      version = packageJson.version,
      esy = packageJson.esy;

  var h = hash({
    env,
    source,
    packageJson: {
      name,
      version,
      esy
    },
    dependencies: Array.from(dependencies.values(), function (dep) {
      return dep.id;
    })
  });
  if (process.env.ESY__TEST) {
    return `${(0, (_util || _load_util()).normalizePackageName)(name)}-${version || '0.0.0'}`;
  } else {
    return `${(0, (_util || _load_util()).normalizePackageName)(name)}-${version || '0.0.0'}-${h.slice(0, 8)}`;
  }
}

function hash(value) {
  if (typeof value === 'object') {
    if (value === null) {
      return hash('null');
    } else if (!Array.isArray(value)) {
      var v = value;
      var keys = Object.keys(v);
      keys.sort();
      return hash(keys.map(function (k) {
        return [k, v[k]];
      }));
    } else {
      return hash(JSON.stringify(value.map(hash)));
    }
  } else if (value === undefined) {
    return hash('undefined');
  } else {
    return (0, (_util || _load_util()).computeHash)(JSON.stringify(value));
  }
}

function parseDependencySpec(spec) {
  if (spec.startsWith('@')) {
    var _spec$split = spec.split('@', 3),
        _spec$split2 = (0, (_slicedToArray2 || _load_slicedToArray()).default)(_spec$split, 3),
        _ = _spec$split2[0],
        _name2 = _spec$split2[1],
        _versionSpec = _spec$split2[2];

    return { name: '@' + _name2, versionSpec: _versionSpec };
  } else {
    var _spec$split3 = spec.split('@'),
        _spec$split4 = (0, (_slicedToArray2 || _load_slicedToArray()).default)(_spec$split3, 2),
        _name3 = _spec$split4[0],
        _versionSpec2 = _spec$split4[1];

    return { name: _name3, versionSpec: _versionSpec2 };
  }
}

function objectToDependencySpecs() {
  var dependencySpecList = [];

  for (var _len = arguments.length, objs = Array(_len), _key = 0; _key < _len; _key++) {
    objs[_key] = arguments[_key];
  }

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = objs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var obj = _step2.value;

      if (obj == null) {
        continue;
      }
      for (var _name4 in obj) {
        var _versionSpec3 = obj[_name4];
        var dependencySpec = `${_name4}@${_versionSpec3}`;
        if (dependencySpecList.indexOf(dependencySpec) === -1) {
          dependencySpecList.push(dependencySpec);
        }
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return dependencySpecList;
}

function formatCircularDependenciesError(dependency, context) {
  return (_outdent || _load_outdent()).default`
    Circular dependency "${dependency}" found
      At ${context.dependencyTrace.join(' -> ')}
  `;
}

function formatMissingPackagesError(missingPackages, context) {
  var packagesToReport = missingPackages.slice(0, 3);
  var packagesMessage = packagesToReport.map(function (p) {
    return `"${p}"`;
  }).join(', ');
  var extraPackagesMessage = missingPackages.length > packagesToReport.length ? ` (and ${missingPackages.length - packagesToReport.length} more)` : '';
  return (_outdent || _load_outdent()).default`
    Cannot resolve ${packagesMessage}${extraPackagesMessage} packages
      At ${context.dependencyTrace.join(' -> ')}
      Did you forget to run "esy install" command?
  `;
}