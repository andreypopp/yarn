'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = undefined;

var _assign;

function _load_assign() {
  return _assign = _interopRequireDefault(require('babel-runtime/core-js/object/assign'));
}

var _asyncToGenerator2;

function _load_asyncToGenerator() {
  return _asyncToGenerator2 = _interopRequireDefault(require('babel-runtime/helpers/asyncToGenerator'));
}

let run = exports.run = (() => {
  var _ref = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)(function* (config, reporter, flags, args) {
    const versions = { yarn: YARN_VERSION };

    const pkg = yield config.maybeReadManifest(config.cwd);
    if (pkg && pkg.name && pkg.version) {
      versions[pkg.name] = pkg.version;
    }

    (0, (_assign || _load_assign()).default)(versions, process.versions);

    reporter.inspect(versions);
  });

  return function run(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const YARN_VERSION = require('../../../package.json').version;