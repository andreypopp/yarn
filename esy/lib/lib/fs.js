'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.walk = exports.symlink = exports.readJson = exports.readFile = exports.copydir = exports.mkdirp = exports.rmdir = exports.chmod = exports.writeFile = exports.readFileBuffer = exports.unlink = exports.realpath = exports.exists = exports.rename = exports.readdir = exports.lstat = exports.stat = undefined;

var _regenerator;

function _load_regenerator() {
  return _regenerator = _interopRequireDefault(require('babel-runtime/regenerator'));
}

var _asyncToGenerator2;

function _load_asyncToGenerator() {
  return _asyncToGenerator2 = _interopRequireDefault(require('babel-runtime/helpers/asyncToGenerator'));
}

var copydir = exports.copydir = function () {
  var _ref = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee(from, to) {
    var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    return (_regenerator || _load_regenerator()).default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _copydir(from, to, {
              filter: function filter(filename) {
                return !(params.exclude && params.exclude.includes(filename));
              }
            });

          case 2:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function copydir(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var readFile = exports.readFile = function () {
  var _ref2 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee2(p) {
    var data;
    return (_regenerator || _load_regenerator()).default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return readFileBuffer(p);

          case 2:
            data = _context2.sent;
            return _context2.abrupt('return', data.toString('utf8'));

          case 4:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function readFile(_x4) {
    return _ref2.apply(this, arguments);
  };
}();

var readJson = exports.readJson = function () {
  var _ref3 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee3(p) {
    var data;
    return (_regenerator || _load_regenerator()).default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return readFile(p);

          case 2:
            data = _context3.sent;
            return _context3.abrupt('return', JSON.parse(data));

          case 4:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function readJson(_x5) {
    return _ref3.apply(this, arguments);
  };
}();

var symlink = exports.symlink = function () {
  var _ref4 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee4(src, dest) {
    var stats, resolved, _relative;

    return (_regenerator || _load_regenerator()).default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return lstat(dest);

          case 3:
            stats = _context4.sent;
            _context4.t0 = stats.isSymbolicLink();

            if (!_context4.t0) {
              _context4.next = 9;
              break;
            }

            _context4.next = 8;
            return exists(dest);

          case 8:
            _context4.t0 = _context4.sent;

          case 9:
            if (!_context4.t0) {
              _context4.next = 15;
              break;
            }

            _context4.next = 12;
            return realpath(dest);

          case 12:
            resolved = _context4.sent;

            if (!(resolved === src)) {
              _context4.next = 15;
              break;
            }

            return _context4.abrupt('return');

          case 15:
            _context4.next = 17;
            return unlink(dest);

          case 17:
            _context4.next = 23;
            break;

          case 19:
            _context4.prev = 19;
            _context4.t1 = _context4['catch'](0);

            if (!(_context4.t1.code !== 'ENOENT')) {
              _context4.next = 23;
              break;
            }

            throw _context4.t1;

          case 23:
            _context4.prev = 23;

            if (!(process.platform === 'win32')) {
              _context4.next = 29;
              break;
            }

            _context4.next = 27;
            return fsSymlink(src, dest, 'junction');

          case 27:
            _context4.next = 32;
            break;

          case 29:
            // use relative paths otherwise which will be retained if the directory is moved
            _relative = path.relative(fs.realpathSync(path.dirname(dest)), fs.realpathSync(src));
            _context4.next = 32;
            return fsSymlink(_relative, dest);

          case 32:
            _context4.next = 42;
            break;

          case 34:
            _context4.prev = 34;
            _context4.t2 = _context4['catch'](23);

            if (!(_context4.t2.code === 'EEXIST')) {
              _context4.next = 41;
              break;
            }

            _context4.next = 39;
            return symlink(src, dest);

          case 39:
            _context4.next = 42;
            break;

          case 41:
            throw _context4.t2;

          case 42:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this, [[0, 19], [23, 34]]);
  }));

  return function symlink(_x6, _x7) {
    return _ref4.apply(this, arguments);
  };
}();

var walk = exports.walk = function () {
  var _ref5 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee5(dir, relativeDir) {
    var ignoreBasenames = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Set();

    var files, filenames, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, name, _relative2, loc, _stat;

    return (_regenerator || _load_regenerator()).default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            files = [];
            _context5.next = 3;
            return readdir(dir);

          case 3:
            filenames = _context5.sent;

            if (ignoreBasenames.size) {
              filenames = filenames.filter(function (name) {
                return !ignoreBasenames.has(name);
              });
            }

            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context5.prev = 8;
            _iterator = filenames[Symbol.iterator]();

          case 10:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context5.next = 27;
              break;
            }

            name = _step.value;
            _relative2 = relativeDir ? path.join(relativeDir, name) : name;
            loc = path.join(dir, name);
            _context5.next = 16;
            return lstat(loc);

          case 16:
            _stat = _context5.sent;


            files.push({
              relative: _relative2,
              basename: name,
              absolute: loc,
              mtime: +_stat.mtime
            });

            if (!_stat.isDirectory()) {
              _context5.next = 24;
              break;
            }

            _context5.t0 = files;
            _context5.next = 22;
            return walk(loc, _relative2, ignoreBasenames);

          case 22:
            _context5.t1 = _context5.sent;
            files = _context5.t0.concat.call(_context5.t0, _context5.t1);

          case 24:
            _iteratorNormalCompletion = true;
            _context5.next = 10;
            break;

          case 27:
            _context5.next = 33;
            break;

          case 29:
            _context5.prev = 29;
            _context5.t2 = _context5['catch'](8);
            _didIteratorError = true;
            _iteratorError = _context5.t2;

          case 33:
            _context5.prev = 33;
            _context5.prev = 34;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 36:
            _context5.prev = 36;

            if (!_didIteratorError) {
              _context5.next = 39;
              break;
            }

            throw _iteratorError;

          case 39:
            return _context5.finish(36);

          case 40:
            return _context5.finish(33);

          case 41:
            return _context5.abrupt('return', files);

          case 42:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this, [[8, 29, 33, 41], [34,, 36, 40]]);
  }));

  return function walk(_x8, _x9) {
    return _ref5.apply(this, arguments);
  };
}();

exports.mkdtemp = mkdtemp;
exports.calculateMtimeChecksum = calculateMtimeChecksum;

var _walkdir;

function _load_walkdir() {
  return _walkdir = _interopRequireDefault(require('walkdir'));
}

var _fsExtra;

function _load_fsExtra() {
  return _fsExtra = require('fs-extra');
}

var _Promise;

function _load_Promise() {
  return _Promise = require('./Promise');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var os = require('os');

// Promote some of the fs built-ins
var stat = exports.stat = (0, (_Promise || _load_Promise()).promisify)(fs.stat);
var lstat = exports.lstat = (0, (_Promise || _load_Promise()).promisify)(fs.lstat);
var readdir = exports.readdir = (0, (_Promise || _load_Promise()).promisify)(fs.readdir);
var rename = exports.rename = (0, (_Promise || _load_Promise()).promisify)(fs.rename);
var exists = exports.exists = (0, (_Promise || _load_Promise()).promisify)(fs.exists, true);
var realpath = exports.realpath = (0, (_Promise || _load_Promise()).promisify)(fs.realpath);
var unlink = exports.unlink = (0, (_Promise || _load_Promise()).promisify)(fs.unlink);
var readFileBuffer = exports.readFileBuffer = (0, (_Promise || _load_Promise()).promisify)(fs.readFile);
var writeFile = exports.writeFile = (0, (_Promise || _load_Promise()).promisify)(fs.writeFile);
var chmod = exports.chmod = (0, (_Promise || _load_Promise()).promisify)(fs.chmod);

// Promote 3rd-party fs utils
var rmdir = exports.rmdir = (0, (_Promise || _load_Promise()).promisify)(require('rimraf'));
var mkdirp = exports.mkdirp = (0, (_Promise || _load_Promise()).promisify)(require('mkdirp'));

// mkdtemp
var _mkdtemp = (0, (_Promise || _load_Promise()).promisify)(fs.mkdtemp);

function mkdtemp(prefix) {
  var root = os.tmpdir();
  return _mkdtemp(path.join(root, prefix));
}

// copydir
var _copydir = (0, (_Promise || _load_Promise()).promisify)((_fsExtra || _load_fsExtra()).copy);

var fsSymlink = (0, (_Promise || _load_Promise()).promisify)(fs.symlink);

function calculateMtimeChecksum(dirname) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var ignore = options.ignore ? options.ignore : function (_filename) {
    return false;
  };
  var mtimes = new Map();

  return new Promise(function (resolve, _reject) {
    var w = (0, (_walkdir || _load_walkdir()).default)(dirname);
    w.on('path', function (name, stat) {
      if (ignore(name)) {
        w.ignore(name);
      }
      if (stat.isFile()) {
        mtimes.set(name, String(stat.mtime.getTime()));
      }
    });
    w.on('end', function () {
      var filenames = Array.from(mtimes.keys());
      filenames.sort();
      var hasher = crypto.createHash('sha1');
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = filenames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var filename = _step2.value;

          hasher.update(mtimes.get(filename) || '');
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

      resolve(hasher.digest('hex'));
    });
  });
}