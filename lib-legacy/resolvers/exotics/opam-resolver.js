'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lookupOpamPackageManifest = undefined;

var _keys;

function _load_keys() {
  return _keys = _interopRequireDefault(require('babel-runtime/core-js/object/keys'));
}

var _slicedToArray2;

function _load_slicedToArray() {
  return _slicedToArray2 = _interopRequireDefault(require('babel-runtime/helpers/slicedToArray'));
}

var _asyncToGenerator2;

function _load_asyncToGenerator() {
  return _asyncToGenerator2 = _interopRequireDefault(require('babel-runtime/helpers/asyncToGenerator'));
}

let lookupOpamPackageManifest = exports.lookupOpamPackageManifest = (() => {
  var _ref = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)(function* (name, versionRange, config) {
    const packageRecordFilename = path.join(OPAM_METADATA_STORE, `${name}.json`);

    if (!(yield (_fs || _load_fs()).exists(packageRecordFilename))) {
      throw new Error(`No package found: @${OPAM_SCOPE}/${name}`);
    }

    const packageCollection = yield (_fs || _load_fs()).readJson(packageRecordFilename);
    const versions = (0, (_keys || _load_keys()).default)(packageCollection.versions);
    if (versionRange == null || versionRange === 'latest') {
      versionRange = '*';
    }
    const version = yield config.resolveConstraints(versions, versionRange);
    if (version == null) {
      // TODO: figure out how to report error
      throw new Error(`No compatible version found: ${versionRange}`);
    }
    const packageJson = packageCollection.versions[version];
    packageJson._uid = packageJson.opam.checksum || packageJson.version;
    return packageJson;
  });

  return function lookupOpamPackageManifest(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

exports.parseOpamResolution = parseOpamResolution;

var _exoticResolver;

function _load_exoticResolver() {
  return _exoticResolver = _interopRequireDefault(require('./exotic-resolver.js'));
}

var _fs;

function _load_fs() {
  return _fs = _interopRequireWildcard(require('../../util/fs.js'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const path = require('path');

const OPAM_METADATA_STORE = path.join(__dirname, '..', '..', '..', 'opam-packages');

const OPAM_SCOPE = 'opam-alpha';

class OpamResolver extends (_exoticResolver || _load_exoticResolver()).default {

  constructor(request, fragment) {
    super(request, fragment);

    var _parseOpamResolution = parseOpamResolution(fragment);

    const name = _parseOpamResolution.name,
          version = _parseOpamResolution.version;

    this.name = name;
    this.version = version;
  }

  static isVersion(pattern) {
    if (pattern.startsWith(`@${OPAM_SCOPE}`)) {
      return true;
    }

    return false;
  }

  static getPatternVersion(pattern, pkg) {
    return pkg.version;
  }

  resolve() {
    var _this = this;

    return (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)(function* () {
      const shrunk = _this.request.getLocked('opam');
      if (shrunk) {
        return shrunk;
      }

      const manifest = yield lookupOpamPackageManifest(_this.name, _this.version, _this.config);
      const reference = `${manifest.name}@${manifest.version}`;

      manifest._remote = {
        type: 'opam',
        registry: 'npm',
        hash: manifest.opam.checksum,
        reference: reference,
        resolved: reference
      };

      return manifest;
    })();
  }
}

exports.default = OpamResolver;
function parseOpamResolution(fragment) {
  fragment = fragment.slice(`@${OPAM_SCOPE}/`.length);

  var _fragment$split = fragment.split('@'),
      _fragment$split2 = (0, (_slicedToArray2 || _load_slicedToArray()).default)(_fragment$split, 2);

  const name = _fragment$split2[0];
  var _fragment$split2$ = _fragment$split2[1];
  const version = _fragment$split2$ === undefined ? '*' : _fragment$split2$;

  return {
    name: name,
    version: version
  };
}