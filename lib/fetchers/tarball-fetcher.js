'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LocalTarballFetcher = undefined;

var _asyncToGenerator2;

function _load_asyncToGenerator() {
  return _asyncToGenerator2 = _interopRequireDefault(require('babel-runtime/helpers/asyncToGenerator'));
}

var _http;

function _load_http() {
  return _http = _interopRequireDefault(require('http'));
}

var _errors;

function _load_errors() {
  return _errors = require('../errors.js');
}

var _stream;

function _load_stream() {
  return _stream = require('../util/stream.js');
}

var _constants;

function _load_constants() {
  return _constants = _interopRequireWildcard(require('../constants.js'));
}

var _crypto;

function _load_crypto() {
  return _crypto = _interopRequireWildcard(require('../util/crypto.js'));
}

var _baseFetcher;

function _load_baseFetcher() {
  return _baseFetcher = _interopRequireDefault(require('./base-fetcher.js'));
}

var _fs;

function _load_fs() {
  return _fs = _interopRequireWildcard(require('../util/fs.js'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const invariant = require('invariant');

const path = require('path');
const tar = require('tar');
const url = require('url');
const fs = require('fs');

class TarballFetcher extends (_baseFetcher || _load_baseFetcher()).default {
  getResolvedFromCached(hash) {
    var _this = this;

    return (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)(function* () {
      const mirrorPath = _this.getMirrorPath();
      if (mirrorPath == null) {
        // no mirror
        return null;
      }

      const tarballLoc = path.join(_this.dest, (_constants || _load_constants()).TARBALL_FILENAME);
      if (!(yield (_fs || _load_fs()).exists(tarballLoc))) {
        // no tarball located in the cache
        return null;
      }

      // copy the file over
      if (!(yield (_fs || _load_fs()).exists(mirrorPath))) {
        yield (_fs || _load_fs()).copy(tarballLoc, mirrorPath, _this.reporter);
      }

      const relativeMirrorPath = _this.getRelativeMirrorPath(mirrorPath);
      invariant(relativeMirrorPath != null, 'Missing offline mirror path');

      return `${relativeMirrorPath}#${hash}`;
    })();
  }

  getMirrorPath() {
    var _url$parse = url.parse(this.reference);

    const pathname = _url$parse.pathname;


    if (pathname == null) {
      return this.config.getOfflineMirrorPath();
    }

    let packageFilename = path.basename(pathname);

    // handle scoped packages
    const pathParts = pathname.slice(1).split('/');
    if (pathParts[0][0] === '@') {
      // scoped npm package
      packageFilename = `${pathParts[0]}-${packageFilename}`;
    }

    return this.config.getOfflineMirrorPath(packageFilename);
  }

  getRelativeMirrorPath(mirrorPath) {
    const offlineMirrorPath = this.config.getOfflineMirrorPath();
    if (offlineMirrorPath == null) {
      return null;
    }
    return path.relative(offlineMirrorPath, mirrorPath);
  }

  createExtractor(mirrorPath, resolve, reject) {
    const validateStream = new (_crypto || _load_crypto()).HashStream();
    const extractorStream = new (_stream || _load_stream()).UnpackStream();
    const untarStream = tar.Extract({ path: this.dest, strip: 1 });

    extractorStream.pipe(untarStream).on('error', reject).on('entry', entry => {
      if ((_constants || _load_constants()).ROOT_USER) {
        entry.props.uid = entry.uid = 0;
        entry.props.gid = entry.gid = 0;
      }
    }).on('end', () => {
      const expectHash = this.hash;
      const actualHash = validateStream.getHash();
      if (!expectHash || expectHash === actualHash) {
        resolve({
          hash: actualHash,
          resolved: mirrorPath ? `${mirrorPath}#${actualHash}` : null
        });
      } else {
        reject(new (_errors || _load_errors()).SecurityError(this.config.reporter.lang('fetchBadHash', expectHash, actualHash)));
      }
    });

    return { validateStream, extractorStream };
  }

  fetchFromLocal(pathname) {
    var _this2 = this;

    return (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)(function* () {
      const ref = _this2.reference,
            config = _this2.config;
      const reporter = config.reporter;

      // path to the local tarball

      let localTarball;
      let isOfflineTarball = false;

      const relativeFileLoc = pathname ? path.join(config.cwd, pathname) : null;
      if (relativeFileLoc && (yield (_fs || _load_fs()).exists(relativeFileLoc))) {
        // this is a reference to a file relative to the cwd
        localTarball = relativeFileLoc;
      } else {
        // generate a offline cache location
        const offlineMirrorPath = config.getOfflineMirrorPath() || '';
        localTarball = path.resolve(offlineMirrorPath, ref);
        isOfflineTarball = true;
      }

      if (!(yield (_fs || _load_fs()).exists(localTarball))) {
        throw new (_errors || _load_errors()).MessageError(reporter.lang('tarballNotInNetworkOrCache', ref, localTarball));
      }

      return new Promise(function (resolve, reject) {
        var _createExtractor = _this2.createExtractor(null, resolve, reject);

        const validateStream = _createExtractor.validateStream,
              extractorStream = _createExtractor.extractorStream;


        const cachedStream = fs.createReadStream(localTarball);

        cachedStream.pipe(validateStream).pipe(extractorStream).on('error', function (err) {
          let msg = 'errorDecompressingTarball';
          if (isOfflineTarball) {
            msg = 'fetchErrorCorrupt';
          }
          reject(new (_errors || _load_errors()).MessageError(reporter.lang(msg, err.message, localTarball)));
        });
      });
    })();
  }

  fetchFromExternal() {
    const ref = this.reference;

    const registry = this.config.registries[this.registry];

    return registry.request(ref, {
      headers: {
        'Accept-Encoding': 'gzip',
        'Accept': 'application/octet-stream'
      },
      buffer: true,
      process: (req, resolve, reject) => {
        const reporter = this.config.reporter;
        // should we save this to the offline cache?

        const mirrorPath = this.getMirrorPath();
        const tarballStorePath = path.join(this.dest, (_constants || _load_constants()).TARBALL_FILENAME);
        const overwriteResolved = mirrorPath ? this.getRelativeMirrorPath(mirrorPath) : null;

        //

        var _createExtractor2 = this.createExtractor(overwriteResolved, resolve, reject);

        const validateStream = _createExtractor2.validateStream,
              extractorStream = _createExtractor2.extractorStream;


        const handleRequestError = res => {
          if (res.statusCode >= 400) {
            // $FlowFixMe
            const statusDescription = (_http || _load_http()).default.STATUS_CODES[res.statusCode];
            reject(new Error(reporter.lang('requestFailed', `${res.statusCode} ${statusDescription}`)));
          }
        };

        req.on('response', handleRequestError);
        req.pipe(validateStream);

        validateStream.pipe(fs.createWriteStream(tarballStorePath)).on('error', reject);

        validateStream.pipe(extractorStream).on('error', reject);
        if (mirrorPath) {
          validateStream.pipe(fs.createWriteStream(mirrorPath)).on('error', reject);
        }
      }
    });
  }

  _fetch() {
    var _url$parse2 = url.parse(this.reference);

    const protocol = _url$parse2.protocol,
          pathname = _url$parse2.pathname;

    if (protocol === null && typeof pathname === 'string') {
      return this.fetchFromLocal(pathname);
    } else {
      return this.fetchFromExternal();
    }
  }
}

exports.default = TarballFetcher;
class LocalTarballFetcher extends TarballFetcher {
  _fetch() {
    return this.fetchFromLocal(this.reference);
  }
}
exports.LocalTarballFetcher = LocalTarballFetcher;