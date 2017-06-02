'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.build = undefined;

var _classCallCheck2;

function _load_classCallCheck() {
  return _classCallCheck2 = _interopRequireDefault(require('babel-runtime/helpers/classCallCheck'));
}

var _possibleConstructorReturn2;

function _load_possibleConstructorReturn() {
  return _possibleConstructorReturn2 = _interopRequireDefault(require('babel-runtime/helpers/possibleConstructorReturn'));
}

var _inherits2;

function _load_inherits() {
  return _inherits2 = _interopRequireDefault(require('babel-runtime/helpers/inherits'));
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

var performBuild = function () {
  var _ref9 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee9(task, config, sandbox) {
    var rootPath, installPath, finalInstallPath, buildPath, log, envForExec, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, item, envPath, darwinSandboxConfig, tempDirs, commandList, logFilename, logStream, i, _commandList$i, command, renderedCommand, sandboxedCommand, execution, _ref10, code, rewriteQueue, files;

    return (_regenerator || _load_regenerator()).default.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            rootPath = config.getRootPath(task.spec);
            installPath = config.getInstallPath(task.spec);
            finalInstallPath = config.getFinalInstallPath(task.spec);
            buildPath = config.getBuildPath(task.spec);
            log = (0, (_debug || _load_debug()).default)(`esy:simple-builder:${task.spec.name}`);


            log('starting build');

            log('removing prev destination directories (if exist)');
            _context9.next = 9;
            return Promise.all([(_fs2 || _load_fs2()).rmdir(finalInstallPath), (_fs2 || _load_fs2()).rmdir(installPath), (_fs2 || _load_fs2()).rmdir(buildPath)]);

          case 9:

            log('creating destination directories');
            _context9.next = 12;
            return Promise.all([].concat((0, (_toConsumableArray2 || _load_toConsumableArray()).default)(BUILD_DIRS.map(function (p) {
              return (_fs2 || _load_fs2()).mkdirp(config.getBuildPath(task.spec, p));
            })), (0, (_toConsumableArray2 || _load_toConsumableArray()).default)(INSTALL_DIRS.map(function (p) {
              return (_fs2 || _load_fs2()).mkdirp(config.getInstallPath(task.spec, p));
            }))));

          case 12:
            if (!(task.spec === sandbox.root)) {
              _context9.next = 15;
              break;
            }

            _context9.next = 15;
            return (_fs2 || _load_fs2()).symlink(buildPath, (_path || _load_path()).join(config.sandboxPath, task.spec.sourcePath, '_build'));

          case 15:
            if (!task.spec.mutatesSourcePath) {
              _context9.next = 19;
              break;
            }

            log('build mutates source directory, rsyncing sources to $cur__target_dir');
            _context9.next = 19;
            return (_fs2 || _load_fs2()).copydir((_path || _load_path()).join(config.sandboxPath, task.spec.sourcePath), config.getBuildPath(task.spec), {
              exclude: PATHS_TO_IGNORE.map(function (p) {
                return (_path || _load_path()).join(config.sandboxPath, task.spec.sourcePath, p);
              })
            });

          case 19:
            envForExec = {};
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context9.prev = 23;

            for (_iterator = task.env.values()[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              item = _step.value;

              envForExec[item.name] = item.value;
            }

            _context9.next = 31;
            break;

          case 27:
            _context9.prev = 27;
            _context9.t0 = _context9['catch'](23);
            _didIteratorError = true;
            _iteratorError = _context9.t0;

          case 31:
            _context9.prev = 31;
            _context9.prev = 32;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 34:
            _context9.prev = 34;

            if (!_didIteratorError) {
              _context9.next = 37;
              break;
            }

            throw _iteratorError;

          case 37:
            return _context9.finish(34);

          case 38:
            return _context9.finish(31);

          case 39:
            log('placing _esy/env');
            envPath = (_path || _load_path()).join(buildPath, '_esy', 'env');
            _context9.next = 43;
            return (_fs2 || _load_fs2()).writeFile(envPath, (0, (_util2 || _load_util2()).renderEnv)(task.env), 'utf8');

          case 43:

            log('placing _esy/sandbox.conf');
            darwinSandboxConfig = (_path || _load_path()).join(buildPath, '_esy', 'sandbox.sb');
            _context9.next = 47;
            return Promise.all(['/tmp', process.env.TMPDIR].filter(Boolean).map(function (p) {
              return (_fs2 || _load_fs2()).realpath(p);
            }));

          case 47:
            tempDirs = _context9.sent;
            _context9.next = 50;
            return (_fs2 || _load_fs2()).writeFile(darwinSandboxConfig, (0, (_util2 || _load_util2()).renderSandboxSbConfig)(task.spec, config, {
              allowFileWrite: tempDirs
            }), 'utf8');

          case 50:
            if (!(task.command != null)) {
              _context9.next = 82;
              break;
            }

            commandList = task.command;
            logFilename = config.getBuildPath(task.spec, '_esy', 'log');
            logStream = (_fs || _load_fs()).createWriteStream(logFilename);
            i = 0;

          case 55:
            if (!(i < commandList.length)) {
              _context9.next = 73;
              break;
            }

            _commandList$i = commandList[i], command = _commandList$i.command, renderedCommand = _commandList$i.renderedCommand;

            log(`executing: ${command}`);
            sandboxedCommand = renderedCommand;

            if (process.platform === 'darwin') {
              sandboxedCommand = `sandbox-exec -f ${darwinSandboxConfig} -- ${renderedCommand}`;
            }
            _context9.next = 62;
            return (0, (_util2 || _load_util2()).exec)(sandboxedCommand, {
              cwd: rootPath,
              env: envForExec,
              maxBuffer: Infinity
            });

          case 62:
            execution = _context9.sent;

            // TODO: we need line-buffering here possibly?
            (0, (_util || _load_util()).interleaveStreams)(execution.process.stdout, execution.process.stderr).pipe(logStream, { end: false });
            _context9.next = 66;
            return execution.exit;

          case 66:
            _ref10 = _context9.sent;
            code = _ref10.code;

            if (!(code !== 0)) {
              _context9.next = 70;
              break;
            }

            throw new BuildTaskError(task, logFilename);

          case 70:
            i++;
            _context9.next = 55;
            break;

          case 73:
            _context9.next = 75;
            return (0, (_util || _load_util()).endWritableStream)(logStream);

          case 75:

            log('rewriting paths in build artefacts');
            rewriteQueue = new (_Promise || _load_Promise()).PromiseQueue({ concurrency: 20 });
            _context9.next = 79;
            return (_fs2 || _load_fs2()).walk(config.getInstallPath(task.spec));

          case 79:
            files = _context9.sent;
            _context9.next = 82;
            return Promise.all(files.map(function (file) {
              return rewriteQueue.add(function () {
                return (0, (_util2 || _load_util2()).rewritePathInFile)(file.absolute, installPath, finalInstallPath);
              });
            }));

          case 82:

            log('finalizing build');

            _context9.next = 85;
            return (_fs2 || _load_fs2()).rename(installPath, finalInstallPath);

          case 85:
            if (!(task.spec === sandbox.root)) {
              _context9.next = 88;
              break;
            }

            _context9.next = 88;
            return (_fs2 || _load_fs2()).symlink(finalInstallPath, (_path || _load_path()).join(config.sandboxPath, task.spec.sourcePath, '_install'));

          case 88:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, this, [[23, 27, 31, 39], [32,, 34, 38]]);
  }));

  return function performBuild(_x14, _x15, _x16) {
    return _ref9.apply(this, arguments);
  };
}();

var initStore = function () {
  var _ref11 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee10(storePath) {
    return (_regenerator || _load_regenerator()).default.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return Promise.all([(_buildConfig || _load_buildConfig()).STORE_BUILD_TREE, (_buildConfig || _load_buildConfig()).STORE_INSTALL_TREE, (_buildConfig || _load_buildConfig()).STORE_STAGE_TREE].map(function (p) {
              return (_fs2 || _load_fs2()).mkdirp((_path || _load_path()).join(storePath, p));
            }));

          case 2:
          case 'end':
            return _context10.stop();
        }
      }
    }, _callee10, this);
  }));

  return function initStore(_x17) {
    return _ref11.apply(this, arguments);
  };
}();

var _debug;

function _load_debug() {
  return _debug = _interopRequireDefault(require('debug'));
}

var _path;

function _load_path() {
  return _path = _interopRequireWildcard(require('path'));
}

var _os;

function _load_os() {
  return _os = _interopRequireWildcard(require('os'));
}

var _fs;

function _load_fs() {
  return _fs = _interopRequireWildcard(require('fs'));
}

var _Promise;

function _load_Promise() {
  return _Promise = require('../lib/Promise');
}

var _fs2;

function _load_fs2() {
  return _fs2 = _interopRequireWildcard(require('../lib/fs'));
}

var _graph;

function _load_graph() {
  return _graph = _interopRequireWildcard(require('../graph'));
}

var _buildConfig;

function _load_buildConfig() {
  return _buildConfig = _interopRequireWildcard(require('../build-config'));
}

var _util;

function _load_util() {
  return _util = require('../util');
}

var _util2;

function _load_util2() {
  return _util2 = require('./util');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var INSTALL_DIRS = ['lib', 'bin', 'sbin', 'man', 'doc', 'share', 'stublibs', 'etc'];

var BUILD_DIRS = ['_esy'];
var PATHS_TO_IGNORE = [(_buildConfig || _load_buildConfig()).STORE_BUILD_TREE, (_buildConfig || _load_buildConfig()).STORE_INSTALL_TREE, (_buildConfig || _load_buildConfig()).STORE_STAGE_TREE, 'node_modules'];
var IGNORE_FOR_CHECKSUM = ['node_modules', '_esy', (_buildConfig || _load_buildConfig()).STORE_BUILD_TREE, (_buildConfig || _load_buildConfig()).STORE_INSTALL_TREE, (_buildConfig || _load_buildConfig()).STORE_STAGE_TREE];

var NUM_CPUS = (_os || _load_os()).cpus().length;

var build = exports.build = function () {
  var _ref = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee8(task, sandbox, config, onTaskStatus) {
    var calculateSourceChecksum = function () {
      var _ref2 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee(spec) {
        var ignoreForChecksum, sourcePath;
        return (_regenerator || _load_regenerator()).default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                ignoreForChecksum = new Set(IGNORE_FOR_CHECKSUM.map(function (s) {
                  return config.getSourcePath(spec, s);
                }));
                _context.next = 3;
                return (_fs2 || _load_fs2()).realpath(config.getSourcePath(spec));

              case 3:
                sourcePath = _context.sent;
                _context.next = 6;
                return (_fs2 || _load_fs2()).calculateMtimeChecksum(sourcePath, {
                  ignore: function ignore(name) {
                    return ignoreForChecksum.has(name);
                  }
                });

              case 6:
                return _context.abrupt('return', _context.sent);

              case 7:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function calculateSourceChecksum(_x5) {
        return _ref2.apply(this, arguments);
      };
    }();

    var readSourceChecksum = function () {
      var _ref3 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee2(spec) {
        var checksumFilename;
        return (_regenerator || _load_regenerator()).default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                checksumFilename = config.getBuildPath(spec, '_esy', 'checksum');
                _context2.next = 3;
                return (_fs2 || _load_fs2()).exists(checksumFilename);

              case 3:
                if (!_context2.sent) {
                  _context2.next = 9;
                  break;
                }

                _context2.next = 6;
                return (_fs2 || _load_fs2()).readFile(checksumFilename);

              case 6:
                _context2.t0 = _context2.sent.trim();
                _context2.next = 10;
                break;

              case 9:
                _context2.t0 = null;

              case 10:
                return _context2.abrupt('return', _context2.t0);

              case 11:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function readSourceChecksum(_x6) {
        return _ref3.apply(this, arguments);
      };
    }();

    var writeStoreChecksum = function () {
      var _ref4 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee3(spec, checksum) {
        var checksumFilename;
        return (_regenerator || _load_regenerator()).default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                checksumFilename = config.getBuildPath(spec, '_esy', 'checksum');
                _context3.next = 3;
                return (_fs2 || _load_fs2()).writeFile(checksumFilename, checksum.trim());

              case 3:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function writeStoreChecksum(_x7, _x8) {
        return _ref4.apply(this, arguments);
      };
    }();

    var performBuildMemoized = function () {
      var _ref5 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee6(task) {
        var _this = this;

        var forced = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var spec, cachedSuccessStatus, inProgress, isInStore, currentChecksum;
        return (_regenerator || _load_regenerator()).default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                spec = task.spec;
                cachedSuccessStatus = {
                  state: 'success',
                  timeEllapsed: null,
                  cached: true,
                  forced: false
                };
                inProgress = taskInProgress.get(task.id);

                if (!(inProgress == null)) {
                  _context6.next = 37;
                  break;
                }

                if (!forced) {
                  _context6.next = 8;
                  break;
                }

                if (task.spec.shouldBePersisted) {
                  inProgress = performBuildWithStatusReport(task, true);
                } else {
                  inProgress = performBuildWithStatusReport(task, true).then(function () {
                    var _ref6 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee4(result) {
                      var currentChecksum;
                      return (_regenerator || _load_regenerator()).default.wrap(function _callee4$(_context4) {
                        while (1) {
                          switch (_context4.prev = _context4.next) {
                            case 0:
                              _context4.next = 2;
                              return calculateSourceChecksum(spec);

                            case 2:
                              currentChecksum = _context4.sent;
                              _context4.next = 5;
                              return writeStoreChecksum(spec, currentChecksum);

                            case 5:
                              return _context4.abrupt('return', result);

                            case 6:
                            case 'end':
                              return _context4.stop();
                          }
                        }
                      }, _callee4, _this);
                    }));

                    return function (_x11) {
                      return _ref6.apply(this, arguments);
                    };
                  }());
                }
                _context6.next = 36;
                break;

              case 8:
                _context6.next = 10;
                return isSpecExistsInStore(spec);

              case 10:
                isInStore = _context6.sent;

                if (!(spec.shouldBePersisted && isInStore)) {
                  _context6.next = 16;
                  break;
                }

                onTaskStatus(task, cachedSuccessStatus);
                inProgress = Promise.resolve(cachedSuccessStatus);
                _context6.next = 36;
                break;

              case 16:
                if (spec.shouldBePersisted) {
                  _context6.next = 35;
                  break;
                }

                _context6.next = 19;
                return calculateSourceChecksum(spec);

              case 19:
                currentChecksum = _context6.sent;
                _context6.t0 = isInStore;

                if (!_context6.t0) {
                  _context6.next = 27;
                  break;
                }

                _context6.next = 24;
                return readSourceChecksum(spec);

              case 24:
                _context6.t1 = _context6.sent;
                _context6.t2 = currentChecksum;
                _context6.t0 = _context6.t1 === _context6.t2;

              case 27:
                if (!_context6.t0) {
                  _context6.next = 32;
                  break;
                }

                onTaskStatus(task, cachedSuccessStatus);
                inProgress = Promise.resolve(cachedSuccessStatus);
                _context6.next = 33;
                break;

              case 32:
                inProgress = performBuildWithStatusReport(task, true).then(function () {
                  var _ref7 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee5(result) {
                    return (_regenerator || _load_regenerator()).default.wrap(function _callee5$(_context5) {
                      while (1) {
                        switch (_context5.prev = _context5.next) {
                          case 0:
                            _context5.next = 2;
                            return writeStoreChecksum(spec, currentChecksum);

                          case 2:
                            return _context5.abrupt('return', result);

                          case 3:
                          case 'end':
                            return _context5.stop();
                        }
                      }
                    }, _callee5, _this);
                  }));

                  return function (_x12) {
                    return _ref7.apply(this, arguments);
                  };
                }());

              case 33:
                _context6.next = 36;
                break;

              case 35:
                inProgress = performBuildWithStatusReport(task);

              case 36:
                taskInProgress.set(task.id, inProgress);

              case 37:
                return _context6.abrupt('return', inProgress);

              case 38:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      return function performBuildMemoized(_x9) {
        return _ref5.apply(this, arguments);
      };
    }();

    var buildQueue, taskInProgress, isSpecExistsInStore, performBuildWithStatusReport;
    return (_regenerator || _load_regenerator()).default.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            performBuildWithStatusReport = function performBuildWithStatusReport(task) {
              var _this2 = this;

              var forced = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

              return buildQueue.add((0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee7() {
                var startTime, _state, endTime, timeEllapsed, state;

                return (_regenerator || _load_regenerator()).default.wrap(function _callee7$(_context7) {
                  while (1) {
                    switch (_context7.prev = _context7.next) {
                      case 0:
                        onTaskStatus(task, { state: 'in-progress' });
                        startTime = Date.now();
                        _context7.prev = 2;
                        _context7.next = 5;
                        return performBuild(task, config, sandbox);

                      case 5:
                        _context7.next = 12;
                        break;

                      case 7:
                        _context7.prev = 7;
                        _context7.t0 = _context7['catch'](2);
                        _state = { state: 'failure', error: _context7.t0 };

                        onTaskStatus(task, _state);
                        return _context7.abrupt('return', _state);

                      case 12:
                        endTime = Date.now();
                        timeEllapsed = endTime - startTime;
                        state = { state: 'success', timeEllapsed, cached: false, forced };

                        onTaskStatus(task, state);
                        return _context7.abrupt('return', state);

                      case 17:
                      case 'end':
                        return _context7.stop();
                    }
                  }
                }, _callee7, _this2, [[2, 7]]);
              })));
            };

            isSpecExistsInStore = function isSpecExistsInStore(spec) {
              return (_fs2 || _load_fs2()).exists(config.getFinalInstallPath(spec));
            };

            _context8.next = 4;
            return Promise.all([initStore(config.storePath), initStore(config.localStorePath)]);

          case 4:
            buildQueue = new (_Promise || _load_Promise()).PromiseQueue({ concurrency: NUM_CPUS });
            taskInProgress = new Map();
            _context8.next = 8;
            return (_graph || _load_graph()).topologicalFold(task, function (directDependencies, allDependencies, task) {
              return Promise.all(directDependencies.values()).then(function (states) {
                if (states.some(function (state) {
                  return state.state === 'failure';
                })) {
                  return Promise.resolve({
                    state: 'failure',
                    error: new Error('dependencies are not built')
                  });
                } else if (states.some(function (state) {
                  return state.state === 'success' && state.forced;
                })) {
                  return performBuildMemoized(task, true);
                } else {
                  return performBuildMemoized(task);
                }
              });
            });

          case 8:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, undefined);
  }));

  return function build(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

var BuildTaskError = function (_Error) {
  (0, (_inherits2 || _load_inherits()).default)(BuildTaskError, _Error);

  function BuildTaskError(task, logFilename) {
    (0, (_classCallCheck2 || _load_classCallCheck()).default)(this, BuildTaskError);

    var _this3 = (0, (_possibleConstructorReturn2 || _load_possibleConstructorReturn()).default)(this, (BuildTaskError.__proto__ || Object.getPrototypeOf(BuildTaskError)).call(this, `Build failed: ${task.spec.name}`));

    _this3.task = task;
    _this3.logFilename = logFilename;
    return _this3;
  }

  return BuildTaskError;
}(Error);