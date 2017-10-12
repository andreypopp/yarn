'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.STORE_STAGE_TREE = exports.STORE_INSTALL_TREE = exports.STORE_BUILD_TREE = exports.ESY_STORE_VERSION = undefined;

var _toConsumableArray2;

function _load_toConsumableArray() {
  return _toConsumableArray2 = _interopRequireDefault(require('babel-runtime/helpers/toConsumableArray'));
}

exports.createConfig = createConfig;

var _path;

function _load_path() {
  return _path = _interopRequireWildcard(require('path'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// The current version of esy store, bump it whenever the store layout changes.
// We also have the same constant hardcoded into bin/esy executable for perf
// reasons (we don't want to spawn additional processes to read from there).
//
// XXX: Update bin/esy if you change it.
// TODO: We probably still want this be the source of truth so figure out how to
// put this into bin/esy w/o any perf penalties.
var ESY_STORE_VERSION = exports.ESY_STORE_VERSION = '3.x.x';

/**
 * Constants for tree names inside stores. We keep them short not to exhaust
 * available shebang length as install tree will be there.
 */
var STORE_BUILD_TREE = exports.STORE_BUILD_TREE = 'b';
var STORE_INSTALL_TREE = exports.STORE_INSTALL_TREE = 'i';
var STORE_STAGE_TREE = exports.STORE_STAGE_TREE = 's';

function createConfig(params) {
  var storePath = params.storePath,
      sandboxPath = params.sandboxPath,
      buildPlatform = params.buildPlatform;

  var localStorePath = (_path || _load_path()).join(sandboxPath, 'node_modules', '.cache', '_esy', 'store');
  var genStorePath = function genStorePath(build, tree, segments) {
    if (build.shouldBePersisted) {
      return (_path || _load_path()).join.apply(_path || _load_path(), [storePath, tree, build.id].concat((0, (_toConsumableArray2 || _load_toConsumableArray()).default)(segments)));
    } else {
      return (_path || _load_path()).join.apply(_path || _load_path(), [localStorePath, tree, build.id].concat((0, (_toConsumableArray2 || _load_toConsumableArray()).default)(segments)));
    }
  };

  var buildConfig = {
    sandboxPath,
    storePath,
    localStorePath,
    buildPlatform,
    getSourcePath: function getSourcePath(build) {
      for (var _len = arguments.length, segments = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        segments[_key - 1] = arguments[_key];
      }

      return (_path || _load_path()).join.apply(_path || _load_path(), [buildConfig.sandboxPath, build.sourcePath].concat(segments));
    },
    getRootPath: function getRootPath(build) {
      for (var _len2 = arguments.length, segments = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        segments[_key2 - 1] = arguments[_key2];
      }

      if (build.mutatesSourcePath) {
        return genStorePath(build, STORE_BUILD_TREE, segments);
      } else {
        return (_path || _load_path()).join.apply(_path || _load_path(), [buildConfig.sandboxPath, build.sourcePath].concat(segments));
      }
    },
    getBuildPath: function getBuildPath(build) {
      for (var _len3 = arguments.length, segments = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        segments[_key3 - 1] = arguments[_key3];
      }

      return genStorePath(build, STORE_BUILD_TREE, segments);
    },
    getInstallPath: function getInstallPath(build) {
      for (var _len4 = arguments.length, segments = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
        segments[_key4 - 1] = arguments[_key4];
      }

      return genStorePath(build, STORE_STAGE_TREE, segments);
    },
    getFinalInstallPath: function getFinalInstallPath(build) {
      for (var _len5 = arguments.length, segments = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
        segments[_key5 - 1] = arguments[_key5];
      }

      return genStorePath(build, STORE_INSTALL_TREE, segments);
    }
  };
  return buildConfig;
}