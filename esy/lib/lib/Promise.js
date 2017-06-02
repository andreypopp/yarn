'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pQueue;

function _load_pQueue() {
  return _pQueue = require('p-queue');
}

Object.defineProperty(exports, 'PromiseQueue', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_pQueue || _load_pQueue()).default;
  }
});
exports.promisify = promisify;
exports.promisifyObject = promisifyObject;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Promise = Promise;
function promisify(fn, firstData) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return new Promise(function (resolve, reject) {
      args.push(function (err) {
        for (var _len2 = arguments.length, result = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          result[_key2 - 1] = arguments[_key2];
        }

        var res = result;

        if (result.length <= 1) {
          res = result[0];
        }

        if (firstData) {
          res = err;
          err = null;
        }

        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });

      fn.apply(null, args);
    });
  };
}

function promisifyObject(obj) {
  var promisedObj = {};
  for (var _key3 in obj) {
    promisedObj[_key3] = promisify(obj[_key3]);
  }
  return promisedObj;
}