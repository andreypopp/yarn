'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise;

function _load_promise() {
  return _promise = _interopRequireDefault(require('babel-runtime/core-js/promise'));
}

var _asyncToGenerator2;

function _load_asyncToGenerator() {
  return _asyncToGenerator2 = _interopRequireDefault(require('babel-runtime/helpers/asyncToGenerator'));
}

var _errors;

function _load_errors() {
  return _errors = require('../errors.js');
}

var _baseFetcher;

function _load_baseFetcher() {
  return _baseFetcher = _interopRequireDefault(require('./base-fetcher.js'));
}

var _git;

function _load_git() {
  return _git = _interopRequireDefault(require('../util/git.js'));
}

var _fs;

function _load_fs() {
  return _fs = _interopRequireWildcard(require('../util/fs.js'));
}

var _crypto;

function _load_crypto() {
  return _crypto = _interopRequireWildcard(require('../util/crypto.js'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const tar = require('tar');

const url = require('url');
const path = require('path');
const fs = require('fs');

const invariant = require('invariant');

class GitFetcher extends (_baseFetcher || _load_baseFetcher()).default {
  _fetch() {
    var _url$parse = url.parse(this.reference);

    const protocol = _url$parse.protocol,
          pathname = _url$parse.pathname;

    if (protocol === null && typeof pathname === 'string') {
      return this.fetchFromLocal(pathname);
    } else {
      return this.fetchFromExternal();
    }
  }

  fetchFromLocal(pathname) {
    var _this = this;

    return (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)(function* () {
      const ref = _this.reference,
            config = _this.config;

      const offlineMirrorPath = config.getOfflineMirrorPath() || '';
      const localTarball = path.resolve(offlineMirrorPath, ref);
      const reporter = config.reporter;

      if (!(yield (_fs || _load_fs()).exists(localTarball))) {
        throw new (_errors || _load_errors()).MessageError(reporter.lang('tarballNotInNetworkOrCache', ref, localTarball));
      }

      return new (_promise || _load_promise()).default(function (resolve, reject) {
        const untarStream = tar.Extract({ path: _this.dest });

        const hashStream = new (_crypto || _load_crypto()).HashStream();

        const cachedStream = fs.createReadStream(localTarball);
        cachedStream.pipe(hashStream).pipe(untarStream).on('end', function () {
          const expectHash = _this.hash;
          const actualHash = hashStream.getHash();
          if (!expectHash || expectHash === actualHash) {
            resolve({
              hash: actualHash,
              resolved: `${pathname}#${actualHash}`
            });
          } else {
            reject(new (_errors || _load_errors()).SecurityError(reporter.lang('fetchBadHash', expectHash, actualHash)));
          }
        }).on('error', function (err) {
          reject(new (_errors || _load_errors()).MessageError(reporter.lang('fetchErrorCorrupt', err.message, localTarball)));
        });
      });
    })();
  }

  fetchFromExternal() {
    var _this2 = this;

    return (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)(function* () {
      const commit = _this2.hash;
      invariant(commit, 'Commit hash required');

      const git = new (_git || _load_git()).default(_this2.config, _this2.reference, commit);
      yield git.init();
      yield git.clone(_this2.dest);

      // Get the tarball filename from the url

      var _url$parse2 = url.parse(_this2.reference);

      const pathname = _url$parse2.pathname;

      let tarballFilename;
      if (pathname == null) {
        tarballFilename = _this2.reference;
      } else {
        tarballFilename = path.basename(pathname);
      }

      let tarballInMirrorPath = _this2.config.getOfflineMirrorPath(tarballFilename);

      const mirrorRootPath = _this2.config.getOfflineMirrorPath();
      if (tarballInMirrorPath && _this2.hash && mirrorRootPath) {
        tarballInMirrorPath = `${tarballInMirrorPath}-${commit}`;
        const hash = yield git.archive(tarballInMirrorPath);
        const relativeMirrorPath = path.relative(mirrorRootPath, tarballInMirrorPath);
        return {
          hash: commit,
          resolved: relativeMirrorPath ? `${relativeMirrorPath}#${hash}` : null
        };
      }

      return {
        hash: commit,
        resolved: null
      };
    })();
  }
}
exports.default = GitFetcher;