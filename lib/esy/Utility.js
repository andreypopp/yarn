'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapObject = mapObject;
exports.flattenArray = flattenArray;
exports.hash = hash;

var _crypto;

function _load_crypto() {
  return _crypto = _interopRequireDefault(require('crypto'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function mapObject(obj, f) {
  let nextObj = {};
  for (var k in obj) {
    nextObj[k] = f(obj[k], k);
  }
  return nextObj;
}

function flattenArray(arrayOfArrays) {
  return [].concat(...arrayOfArrays);
}

function hash(str) {
  const hash = (_crypto || _load_crypto()).default.createHash('sha1');
  hash.update(str);
  return hash.digest('hex');
}