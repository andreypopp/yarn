'use strict';

var _toConsumableArray2;

function _load_toConsumableArray() {
  return _toConsumableArray2 = _interopRequireDefault(require('babel-runtime/helpers/toConsumableArray'));
}

var _extends2;

function _load_extends() {
  return _extends2 = _interopRequireDefault(require('babel-runtime/helpers/extends'));
}

var _regenerator;

function _load_regenerator() {
  return _regenerator = _interopRequireDefault(require('babel-runtime/regenerator'));
}

var _asyncToGenerator2;

function _load_asyncToGenerator() {
  return _asyncToGenerator2 = _interopRequireDefault(require('babel-runtime/helpers/asyncToGenerator'));
}

var getBuildSandbox = function () {
  var _ref = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee(sandboxPath, options) {
    var sandbox;
    return (_regenerator || _load_regenerator()).default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (_buildSandbox || _load_buildSandbox()).fromDirectory(sandboxPath, options);

          case 2:
            sandbox = _context.sent;

            if (sandbox.root.errors.length > 0) {
              sandbox.root.errors.forEach(function (error) {
                console.log(formatError(error.message));
              });
              process.exit(1);
            }
            return _context.abrupt('return', sandbox);

          case 5:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function getBuildSandbox(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var buildCommand = function () {
  var _ref2 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee2(sandboxPath, _commandName) {
    var config, builder, observatory, loggingHandlers, getReporterFor, sandbox, task, failures, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, failure, _error, _ref3, logFilename, logContents;

    return (_regenerator || _load_regenerator()).default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            getReporterFor = function getReporterFor(task) {
              var handler = loggingHandlers.get(task.id);
              if (handler == null) {
                var version = (_chalk || _load_chalk()).default.grey(`@ ${task.spec.version}`);
                handler = observatory.add(`${task.spec.name} ${version}`);
                loggingHandlers.set(task.id, handler);
              }
              return handler;
            };

            config = buildConfigForBuildCommand(defaultBuildPlatform);
            builder = require('../builders/simple-builder');
            observatory = (0, (_observatory || _load_observatory()).settings)({
              prefix: (_chalk || _load_chalk()).default.green('  → ')
            });
            loggingHandlers = new Map();
            _context2.next = 7;
            return getBuildSandbox(sandboxPath);

          case 7:
            sandbox = _context2.sent;
            task = (_buildTask || _load_buildTask()).fromBuildSandbox(sandbox, config);
            failures = [];
            _context2.next = 12;
            return builder.build(task, sandbox, config, function (task, status) {
              if (status.state === 'in-progress') {
                getReporterFor(task).status('building...');
              } else if (status.state === 'success') {
                var timeEllapsed = status.timeEllapsed;

                if (timeEllapsed != null) {
                  getReporterFor(task).done('BUILT').details(`in ${timeEllapsed / 1000}s`);
                } else if (!task.spec.shouldBePersisted) {
                  getReporterFor(task).done('BUILT').details(`unchanged`);
                }
              } else if (status.state === 'failure') {
                failures.push({ task, error: status.error });
                getReporterFor(task).fail('FAILED');
              }
            });

          case 12:
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context2.prev = 15;

            for (_iterator = failures[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              failure = _step.value;
              _error = failure.error;

              if (_error.logFilename) {
                _ref3 = _error, logFilename = _ref3.logFilename;

                if (!failure.task.spec.shouldBePersisted) {
                  logContents = (_fs || _load_fs()).readFileSync(logFilename, 'utf8');

                  console.log((_outdent || _load_outdent()).default`

            ${(_chalk || _load_chalk()).default.red('FAILED')} ${failure.task.spec.name}, see log for details:

            ${(_chalk || _load_chalk()).default.red(indent(logContents, '  '))}
            `);
                } else {
                  console.log((_outdent || _load_outdent()).default`

            ${(_chalk || _load_chalk()).default.red('FAILED')} ${failure.task.spec.name}, see log for details:
              ${logFilename}

            `);
                }
              } else {
                console.log((_outdent || _load_outdent()).default`

        ${(_chalk || _load_chalk()).default.red('FAILED')} ${failure.task.spec.name}:
          ${failure.error}

        `);
              }
            }
            _context2.next = 23;
            break;

          case 19:
            _context2.prev = 19;
            _context2.t0 = _context2['catch'](15);
            _didIteratorError = true;
            _iteratorError = _context2.t0;

          case 23:
            _context2.prev = 23;
            _context2.prev = 24;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 26:
            _context2.prev = 26;

            if (!_didIteratorError) {
              _context2.next = 29;
              break;
            }

            throw _iteratorError;

          case 29:
            return _context2.finish(26);

          case 30:
            return _context2.finish(23);

          case 31:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[15, 19, 23, 31], [24,, 26, 30]]);
  }));

  return function buildCommand(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

var buildEjectCommand = function () {
  var _ref4 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee3(sandboxPath, _commandName, _buildEjectPath, buildPlatformArg) {
    var buildPlatform, buildEject, sandbox, buildConfig;
    return (_regenerator || _load_regenerator()).default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            buildPlatform = determineBuildPlatformFromArgument(buildPlatformArg);
            buildEject = require('../builders/makefile-builder');
            _context3.next = 4;
            return getBuildSandbox(sandboxPath, { forRelease: true });

          case 4:
            sandbox = _context3.sent;
            buildConfig = buildConfigForBuildEjectCommand(buildPlatform);

            buildEject.renderToMakefile(sandbox, (_path || _load_path()).join(sandboxPath, 'node_modules', '.cache', '_esy', 'build-eject'), buildConfig);

          case 7:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function buildEjectCommand(_x5, _x6, _x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();

var releaseCommand = function () {
  var _ref5 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee4(sandboxPath, _commandName, type) {
    var _require, buildRelease, pkg;

    return (_regenerator || _load_regenerator()).default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (!(type == null)) {
              _context4.next = 2;
              break;
            }

            throw new Error('esy release: provide type');

          case 2:
            if (!(AVAILABLE_RELEASE_TYPE.indexOf(type) === -1)) {
              _context4.next = 4;
              break;
            }

            throw new Error(`esy release: invalid release type, must be one of: ${AVAILABLE_RELEASE_TYPE.join(', ')}`);

          case 4:
            _require = require('../release'), buildRelease = _require.buildRelease;
            _context4.next = 7;
            return (_fs2 || _load_fs2()).readJson((_path || _load_path()).join(sandboxPath, 'package.json'));

          case 7:
            pkg = _context4.sent;
            _context4.next = 10;
            return buildRelease({
              type,
              version: pkg.version,
              sandboxPath
            });

          case 10:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function releaseCommand(_x9, _x10, _x11) {
    return _ref5.apply(this, arguments);
  };
}();

var importOpamCommand = function () {
  var _ref6 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee5(sandboxPath, _commandName, packageName, packageVersion, opamFilename) {
    var opamData, opam, packageJson;
    return (_regenerator || _load_regenerator()).default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            if (opamFilename == null) {
              error(`usage: esy import-opam PACKAGENAME PACKAGEVERSION OPAMFILENAME`);
            }
            _context5.next = 3;
            return (_fs2 || _load_fs2()).readFile(opamFilename);

          case 3:
            opamData = _context5.sent;
            opam = (_esyOpam || _load_esyOpam()).parseOpam(opamData);
            packageJson = (_esyOpam || _load_esyOpam()).renderOpam(packageName, packageVersion, opam);
            // We inject "ocaml" into devDependencies as this is something which is have
            // to be done usually.

            packageJson.devDependencies = (0, (_extends2 || _load_extends()).default)({}, packageJson.devDependencies, {
              ocaml: 'esy-ocaml/ocaml#esy'
            });
            console.log(JSON.stringify(packageJson, null, 2));

          case 8:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  return function importOpamCommand(_x12, _x13, _x14, _x15, _x16) {
    return _ref6.apply(this, arguments);
  };
}();

/**
 * CLI accepts
 * esy your command here
 * esy install
 * esy build
 * esy build-eject
 * esy build-eject buildPlatform  # Unsupported, temporary, for debugging purposes.
 * ... other yarn commands.
 */
var main = function () {
  var _ref7 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee6() {
    var sandbox, config, task, builtInCommandName, builtInCommand;
    return (_regenerator || _load_regenerator()).default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            if (!(actualArgs.length === 0)) {
              _context6.next = 10;
              break;
            }

            _context6.next = 3;
            return getBuildSandbox(sandboxPath);

          case 3:
            sandbox = _context6.sent;
            config = buildConfigForBuildCommand(defaultBuildPlatform);
            task = (_buildTask || _load_buildTask()).fromBuildSandbox(sandbox, config, { exposeOwnPath: true });
            // Sandbox env is more strict than we want it to be at runtime, filter
            // out $SHELL overrides.

            task.env.delete('SHELL');
            console.log((_environment || _load_environment()).printEnvironment(task.env));
            _context6.next = 18;
            break;

          case 10:
            builtInCommandName = actualArgs[0];
            builtInCommand = builtInCommands[builtInCommandName];

            if (!builtInCommand) {
              _context6.next = 17;
              break;
            }

            _context6.next = 15;
            return builtInCommand.apply(undefined, [sandboxPath].concat((0, (_toConsumableArray2 || _load_toConsumableArray()).default)(process.argv.slice(3))));

          case 15:
            _context6.next = 18;
            break;

          case 17:
            console.error(`unknown command: ${builtInCommandName}`);

          case 18:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));

  return function main() {
    return _ref7.apply(this, arguments);
  };
}();

var _os;

function _load_os() {
  return _os = _interopRequireWildcard(require('os'));
}

var _fs;

function _load_fs() {
  return _fs = _interopRequireWildcard(require('fs'));
}

var _fs2;

function _load_fs2() {
  return _fs2 = _interopRequireWildcard(require('../lib/fs'));
}

var _child_process;

function _load_child_process() {
  return _child_process = _interopRequireWildcard(require('../lib/child_process'));
}

var _loudRejection;

function _load_loudRejection() {
  return _loudRejection = _interopRequireDefault(require('loud-rejection'));
}

var _outdent;

function _load_outdent() {
  return _outdent = _interopRequireDefault(require('outdent'));
}

var _userHome;

function _load_userHome() {
  return _userHome = _interopRequireDefault(require('user-home'));
}

var _path;

function _load_path() {
  return _path = _interopRequireWildcard(require('path'));
}

var _chalk;

function _load_chalk() {
  return _chalk = _interopRequireDefault(require('chalk'));
}

var _observatory;

function _load_observatory() {
  return _observatory = require('observatory');
}

var _environment;

function _load_environment() {
  return _environment = _interopRequireWildcard(require('../environment'));
}

var _buildTask;

function _load_buildTask() {
  return _buildTask = _interopRequireWildcard(require('../build-task'));
}

var _buildConfig;

function _load_buildConfig() {
  return _buildConfig = _interopRequireWildcard(require('../build-config'));
}

var _buildSandbox;

function _load_buildSandbox() {
  return _buildSandbox = _interopRequireWildcard(require('../build-sandbox'));
}

var _esyOpam;

function _load_esyOpam() {
  return _esyOpam = _interopRequireWildcard(require('@esy-ocaml/esy-opam'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('core-js/modules/es6.typed.array-buffer');

require('core-js/modules/es6.typed.int8-array');

require('core-js/modules/es6.typed.uint8-array');

require('core-js/modules/es6.typed.uint8-clamped-array');

require('core-js/modules/es6.typed.int16-array');

require('core-js/modules/es6.typed.uint16-array');

require('core-js/modules/es6.typed.int32-array');

require('core-js/modules/es6.typed.uint32-array');

require('core-js/modules/es6.typed.float32-array');

require('core-js/modules/es6.typed.float64-array');

require('core-js/modules/es6.map');

require('core-js/modules/es6.set');

require('core-js/modules/es6.weak-map');

require('core-js/modules/es6.weak-set');

require('core-js/modules/es6.reflect.apply');

require('core-js/modules/es6.reflect.construct');

require('core-js/modules/es6.reflect.define-property');

require('core-js/modules/es6.reflect.delete-property');

require('core-js/modules/es6.reflect.get');

require('core-js/modules/es6.reflect.get-own-property-descriptor');

require('core-js/modules/es6.reflect.get-prototype-of');

require('core-js/modules/es6.reflect.has');

require('core-js/modules/es6.reflect.is-extensible');

require('core-js/modules/es6.reflect.own-keys');

require('core-js/modules/es6.reflect.prevent-extensions');

require('core-js/modules/es6.reflect.set');

require('core-js/modules/es6.reflect.set-prototype-of');

require('core-js/modules/es6.promise');

require('core-js/modules/es6.symbol');

require('core-js/modules/es6.function.name');

require('core-js/modules/es6.regexp.flags');

require('core-js/modules/es6.regexp.match');

require('core-js/modules/es6.regexp.replace');

require('core-js/modules/es6.regexp.split');

require('core-js/modules/es6.regexp.search');

require('core-js/modules/es6.array.from');

require('core-js/modules/es7.array.includes');

require('core-js/modules/es7.object.values');

require('core-js/modules/es7.object.entries');

require('core-js/modules/es7.object.get-own-property-descriptors');

require('core-js/modules/es7.string.pad-start');

require('core-js/modules/es7.string.pad-end');

require('regenerator-runtime/runtime');

// TODO: This is a hack, we need to find a way to solve that more elegantly. But
// for not this is required as we redirected stderr to stdout and those
// possible deprecation warnings can really hurt and make things difficult to
// debug.
// $FlowFixMe: fix me


process.noDeprecation = true;

/**
 * Each package can configure exportedEnvVars with:
 *
 * (object key is environment variable name)
 *
 * val: string
 *
 * scope: In short:
 *    "local": Can be seen by this package at build time, shadows anything
 *    configured by dependencies.
 *    "export": Seen by immediate dependers during their build times, and
 *    shadows any global variables those immediate dependers can see at build
 *    time.
 *    "global": Seen by all packages that have a transitive linktime dependency
 *    on our package.
 *
 *    You can or them together: "local|export", "local|global".
 *
 * Example:
 *
 *   If you are publishing a binary to all transitive dependers, you'd do:
 *
 *     "PATH": {
 *       "val": "PATH:$PATH",
 *       "scope": "global"
 *     }
 *
 *   You wouldn't necessarily use a "local" scope because your package that
 *   builds the resulting binary doesn't care about seeing that binary.
 *
 *   Similarly, if you build library artifacts, you don't care about *seeing*
 *   those library artifacts as the library that is building them.
 *
 *
 *     "FINDLIB": {
 *       "val": "$MY_PACKAGE__LIB:$FINDLIB",
 *       "scope": "export"
 *     }
 *
 * VISIBILITY:
 * -------------
 *
 * Consider that a package my-compiler has defines a variable CC_FLAG. It would
 * normally publish some default flag with a "global" scope so that everyone
 * who transitively depends on it can see the default.
 *
 * "CC_FLAG": {
 *   "val": "-default-flag",
 *   "scope": "global"
 * }
 *
 * Then we want to be able to create a package `my-package` that depends on
 * `my-compiler`, which wants to override those flags for its own package
 * compilation - so it sets the scope flag to "local". The local scope
 * shadows the global scope, and the new value is only observed by
 * `my-package`.
 *
 * "CC_FLAG": {
 *   "val": "-opt 0",
 *   "scope": "local"
 * }
 *
 * In the same way that let bindings shadow global bindings, yet can reference
 * the global one in the definition of the local one, the same is true of local
 * environment variables.
 *
 *   let print_string = fun(s) => print_string(s + "!!!");
 *
 *   // Analogous to
 *   "CC_FLAG": {
 *     "val": "-opt 0 $CC_FLAG",
 *     "scope": "local"
 *   }
 *
 *
 * Local scopes allow us to create a package `my-app` that depends on
 * `my-package` (which in turn depends on `my-compiler`) such that `my-app`
 * doesn't observe the conpiler flags that its dependency (`my-package`) used.
 *
 * Though, in other cases, we *do* want configured flags to be visible.
 * Imagine making a package called `add-opt-flags`, which only has a
 * `package.json` that configures optimized compiler flags. If you directly
 * depend on `add-opt-flags`, you get all the flags added to your package.
 * `add-opt-flags` would configure the variable like:
 *
 * "CC_FLAG": {
 *   "val": "-opt 3",
 *   "scope": "export"
 * }
 *
 * If `your-app` depends on `add-opt-flags`, you would get all the flags set by
 * `add-opt-flags`, but if `app-store` depends on `your-app`, `app-store`
 * wouldn't have opt flags added automatically.
 *
 *
 * Priority of scope visibility is as follows: You see the global scope
 * (consisting of all global variables set by your transitive dependencies)
 * then you see the exported scope of your direct dependencies, shadowing any
 * global scope and then you see your local scope, which shaddows everything
 * else. Each time you shadow a scope, you can reference the lower priority
 * scope *while* shadowing. Just like you can do the following in ML, to
 * redefine addition in terms of addition that was in global scope.
 *
 * A language analogy would be the assumption that every package has an implicit
 * "opening" of its dependencies' exports, to bring them into scope.
 *
 *   open GlobalScopeFromAllTransitiveRuntimeDependencies;
 *   open AllImmediateDependencies.Exports;
 *
 *   let myLocalVariable = expression(in, terms, of, everything, above);
 *
 * In fact, all of this configuration could/should be replaced by a real
 * language. The package builder would then just be something that concatenates
 * files together in a predictable order.
 *
 * WHO CAN WRITE:
 * -------------
 *
 *  When thinking about conflicts, it helps to recall that different scopes are
 *  actually writing to different locations that shadow in convenient ways.
 *  We need some way to control exclusivity of writing these env vars to prevent
 *  conflicts. The current implementaiton just has a single exclusive:
 *  true/false flag and it doesn't take into account scope.
 */

/**
 * Detect the default build platform based on the current OS.
 */
var defaultBuildPlatform = process.platform === 'darwin' ? 'darwin' : process.platform === 'linux' ? 'linux' : 'linux';

/**
 * This is temporary, mostly here for testing. Soon, esy will automatically
 * create build ejects for all valid platforms.
 */
function determineBuildPlatformFromArgument(arg) {
  if (arg === '' || arg === null || arg === undefined) {
    return defaultBuildPlatform;
  } else {
    if (arg === 'darwin') {
      return 'darwin';
    } else if (arg === 'linux') {
      return 'linux';
    } else if (arg === 'cygwin') {
      return 'cygwin';
    }
    throw new Error('Specified build platform ' + arg + ' is invalid: Pass one of "linux", "cygwin", or "darwin"');
  }
}

function formatError(message, stack) {
  var result = `${(_chalk || _load_chalk()).default.red('ERROR')} ${message}`;
  if (stack != null) {
    result += `\n${stack}`;
  }
  return result;
}

function error(error) {
  var message = String(error.message ? error.message : error);
  var stack = error.stack ? String(error.stack) : undefined;
  console.log(formatError(message, stack));
  process.exit(1);
}

var actualArgs = process.argv.slice(2);
// TODO: Need to change this to climb to closest package.json.
var sandboxPath = process.cwd();

/**
 * To relocate binary artifacts, we need to replace all build-time paths that
 * occur in build artifacts with install-time paths, which very well may be on
 * a different computer even. In order to do so safely, we need to never change
 * the length of the paths (otherwise we would corrupt the binaries).
 * Therefore, it's beneficial to reserve as much padding in the build path as
 * possible, without the path to ocamlrun ever exceeding the maximum allowed
 * shebang length (since scripts will have a shebang to the full path to
 * ocamlrun). The maximum line length is 127 (on most linuxes). Mac OS is a
 * little more forgiving with the length restriction, so we plan for the worst
 * (Linux).
 *
 *        This will be replaced by the actual      This must remain.
 *        install location.
 *       +------------------------------+  +--------------------------------+
 *      /                                \/                                  \
 *   #!/path/to/rel/store___padding____/i/ocaml-4.02.3-d8a857f3/bin/ocamlrun
 *
 * The goal is to make this shebang string exactly 127 characters long (maybe a
 * little less to allow room for some other shebangs like `ocamlrun.opt` etc?)
 *
 * It is optimal to make this path as long as possible (because the
 * installation location might be embedded deep in the file system), but no
 * longer than 127 characters. It is optimal to minimize the portion of this
 * shebang consumed by the "ocaml-4.02.3-d8a857f3/bin/ocamlrun" portion, so
 * that more of that 127 can act as a padding.
 */
var desiredShebangPathLength = 127 - '!#'.length;
var pathLengthConsumedByOcamlrun = '/i/ocaml-n.00.0-########/bin/ocamlrun'.length;
var desiredEsyEjectStoreLength = desiredShebangPathLength - pathLengthConsumedByOcamlrun;

function buildConfigForBuildCommand(buildPlatform) {
  var storePath = process.env.ESY__STORE || (_path || _load_path()).join((_userHome || _load_userHome()).default, '.esy', (_buildConfig || _load_buildConfig()).ESY_STORE_VERSION);
  return (_buildConfig || _load_buildConfig()).createConfig({ storePath, sandboxPath, buildPlatform });
}

/**
 * Note that Makefile based builds defers exact locations of sandbox and store
 * to some later point because ejected builds can be transfered to other
 * machines.
 *
 * That means that build env is generated in a way which can be configured later
 * with `$ESY_EJECT__SANDBOX` and `$ESY__STORE` environment variables.
 */
function buildConfigForBuildEjectCommand(buildPlatform) {
  var STORE_PATH = '$ESY_EJECT__STORE';
  var SANDBOX_PATH = '$ESY_EJECT__SANDBOX';
  var buildConfig = (_buildConfig || _load_buildConfig()).createConfig({
    storePath: STORE_PATH,
    sandboxPath: SANDBOX_PATH,
    buildPlatform
  });
  return buildConfig;
}

var AVAILABLE_RELEASE_TYPE = ['dev', 'pack', 'bin'];

var builtInCommands = {
  'build-eject': buildEjectCommand,
  build: buildCommand,
  release: releaseCommand,
  'import-opam': importOpamCommand
};

function indent(string, indent) {
  return string.split('\n').map(function (line) {
    return indent + line;
  }).join('\n');
}

main().catch(error);
(0, (_loudRejection || _load_loudRejection()).default)();