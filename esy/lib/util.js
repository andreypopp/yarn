'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveToRealpath = undefined;

var _slicedToArray2;

function _load_slicedToArray() {
  return _slicedToArray2 = _interopRequireDefault(require('babel-runtime/helpers/slicedToArray'));
}

var _regenerator;

function _load_regenerator() {
  return _regenerator = _interopRequireDefault(require('babel-runtime/regenerator'));
}

var _asyncToGenerator2;

function _load_asyncToGenerator() {
  return _asyncToGenerator2 = _interopRequireDefault(require('babel-runtime/helpers/asyncToGenerator'));
}

var _toConsumableArray2;

function _load_toConsumableArray() {
  return _toConsumableArray2 = _interopRequireDefault(require('babel-runtime/helpers/toConsumableArray'));
}

var resolveToRealpath = exports.resolveToRealpath = function () {
  var _ref2 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee(packageName, baseDirectory) {
    var resolution;
    return (_regenerator || _load_regenerator()).default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return resolve(packageName, baseDirectory);

          case 2:
            resolution = _context.sent;
            return _context.abrupt('return', (_fs || _load_fs()).realpath(resolution));

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function resolveToRealpath(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
}();

exports.mapObject = mapObject;
exports.flattenArray = flattenArray;
exports.computeHash = computeHash;
exports.setDefaultToMap = setDefaultToMap;
exports.resolve = resolve;
exports.normalizePackageName = normalizePackageName;
exports.filterMap = filterMap;
exports.mapValuesMap = mapValuesMap;
exports.mergeIntoMap = mergeIntoMap;
exports.interleaveStreams = interleaveStreams;
exports.endWritableStream = endWritableStream;

var _resolve;

function _load_resolve() {
  return _resolve = _interopRequireDefault(require('resolve'));
}

var _stream;

function _load_stream() {
  return _stream = _interopRequireWildcard(require('stream'));
}

var _fs;

function _load_fs() {
  return _fs = _interopRequireWildcard(require('./lib/fs'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Using ES "import" syntax triggers deprecation warnings in Node
var crypto = require('crypto');
function mapObject(obj, f) {
  var nextObj = {};
  for (var k in obj) {
    nextObj[k] = f(obj[k], k);
  }
  return nextObj;
}

function flattenArray(arrayOfArrays) {
  var _ref;

  return (_ref = []).concat.apply(_ref, (0, (_toConsumableArray2 || _load_toConsumableArray()).default)(arrayOfArrays));
}

function computeHash(str) {
  var algo = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'sha1';

  var hash = crypto.createHash(algo);
  hash.update(str);
  return hash.digest('hex');
}

function setDefaultToMap(map, key, makeDefaultValue) {
  var existingValue = map.get(key);
  if (existingValue == null) {
    var value = makeDefaultValue();
    map.set(key, value);
    return value;
  } else {
    return existingValue;
  }
}

function resolve(packageName, baseDirectory) {
  return new Promise(function (resolve, reject) {
    (0, (_resolve || _load_resolve()).default)(packageName, { basedir: baseDirectory }, function (err, resolution) {
      if (err) {
        reject(err);
      } else {
        resolve(resolution);
      }
    });
  });
}

function normalizePackageName(name) {
  return name.toLowerCase().replace(/@/g, '').replace(/_+/g, function (matched) {
    return matched + '__';
  }).replace(/\//g, '__slash__')
  // Add two underscores to every group we see.
  .replace(/\./g, '__dot__').replace(/\-/g, '_');
}

function filterMap(map, filter) {
  var res = new Map();
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = map.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _ref3 = _step.value;

      var _ref4 = (0, (_slicedToArray2 || _load_slicedToArray()).default)(_ref3, 2);

      var k = _ref4[0];
      var v = _ref4[1];

      if (filter(v, k)) {
        res.set(k, v);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return res;
}

function mapValuesMap(map, mapper) {
  var res = new Map();
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = map.entries()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _ref5 = _step2.value;

      var _ref6 = (0, (_slicedToArray2 || _load_slicedToArray()).default)(_ref5, 2);

      var k = _ref6[0];
      var v = _ref6[1];

      res.set(k, mapper(v, k));
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

  return res;
}

function mergeIntoMap(src, from, merge) {
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = from.entries()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _ref7 = _step3.value;

      var _ref8 = (0, (_slicedToArray2 || _load_slicedToArray()).default)(_ref7, 2);

      var k = _ref8[0];
      var v = _ref8[1];

      var _prev = src.get(k);
      if (_prev != null && merge) {
        src.set(k, merge(_prev, v, k));
      } else {
        src.set(k, v);
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }
}

function interleaveStreams() {
  var output = new (_stream || _load_stream()).PassThrough();

  for (var _len = arguments.length, sources = Array(_len), _key = 0; _key < _len; _key++) {
    sources[_key] = arguments[_key];
  }

  var streamActiveNumber = sources.length;
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = sources[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var source = _step4.value;

      source.on('error', function (err) {
        return output.emit(err);
      });
      source.once('end', function () {
        streamActiveNumber -= 1;
        if (streamActiveNumber === 0) {
          output.end('', 'ascii');
        }
      });
      source.pipe(output, { end: false });
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  return output;
}

function endWritableStream(s) {
  return new Promise(function (resolve, reject) {
    s.write('', 'ascii', function (err) {
      s.end();
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}