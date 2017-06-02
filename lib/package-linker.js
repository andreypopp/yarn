'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.linkBin = undefined;

var _slicedToArray2;

function _load_slicedToArray() {
  return _slicedToArray2 = _interopRequireDefault(require('babel-runtime/helpers/slicedToArray'));
}

var _asyncToGenerator2;

function _load_asyncToGenerator() {
  return _asyncToGenerator2 = _interopRequireDefault(require('babel-runtime/helpers/asyncToGenerator'));
}

let linkBin = exports.linkBin = (() => {
  var _ref = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)(function* (src, dest) {
    if (process.platform === 'win32') {
      const unlockMutex = yield (0, (_mutex || _load_mutex()).default)(src);
      try {
        yield cmdShim(src, dest);
      } finally {
        unlockMutex();
      }
    } else {
      yield (_fs || _load_fs()).mkdirp(path.dirname(dest));
      yield (_fs || _load_fs()).symlink(src, dest);
      yield (_fs || _load_fs()).chmod(dest, '755');
    }
  });

  return function linkBin(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

var _packageHoister;

function _load_packageHoister() {
  return _packageHoister = _interopRequireDefault(require('./package-hoister.js'));
}

var _constants;

function _load_constants() {
  return _constants = _interopRequireWildcard(require('./constants.js'));
}

var _promise;

function _load_promise() {
  return _promise = _interopRequireWildcard(require('./util/promise.js'));
}

var _misc;

function _load_misc() {
  return _misc = require('./util/misc.js');
}

var _fs;

function _load_fs() {
  return _fs = _interopRequireWildcard(require('./util/fs.js'));
}

var _mutex;

function _load_mutex() {
  return _mutex = _interopRequireDefault(require('./util/mutex.js'));
}

var _semver;

function _load_semver() {
  return _semver = require('./util/semver.js');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const invariant = require('invariant');
const cmdShim = (_promise || _load_promise()).promisify(require('cmd-shim'));
const path = require('path');

class PackageLinker {
  constructor(config, resolver) {
    this.resolver = resolver;
    this.reporter = config.reporter;
    this.config = config;
    this.artifacts = {};
  }

  setArtifacts(artifacts) {
    this.artifacts = artifacts;
  }

  linkSelfDependencies(pkg, pkgLoc, targetBinLoc) {
    return (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)(function* () {
      targetBinLoc = path.join(targetBinLoc, '.bin');
      yield (_fs || _load_fs()).mkdirp(targetBinLoc);
      targetBinLoc = yield (_fs || _load_fs()).realpath(targetBinLoc);
      pkgLoc = yield (_fs || _load_fs()).realpath(pkgLoc);
      for (const _ref2 of (0, (_misc || _load_misc()).entries)(pkg.bin)) {
        var _ref3 = (0, (_slicedToArray2 || _load_slicedToArray()).default)(_ref2, 2);

        const scriptName = _ref3[0];
        const scriptCmd = _ref3[1];

        const dest = path.join(targetBinLoc, scriptName);
        const src = path.join(pkgLoc, scriptCmd);
        if (!(yield (_fs || _load_fs()).exists(src))) {
          // TODO maybe throw an error
          continue;
        }
        yield linkBin(src, dest);
      }
    })();
  }

  linkBinDependencies(pkg, dir) {
    var _this = this;

    return (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)(function* () {
      const deps = [];

      const ref = pkg._reference;
      invariant(ref, 'Package reference is missing');

      const remote = pkg._remote;
      invariant(remote, 'Package remote is missing');

      // link up `bin scripts` in `dependencies`
      for (const pattern of ref.dependencies) {
        const dep = _this.resolver.getStrictResolvedPattern(pattern);
        if (dep.bin && Object.keys(dep.bin).length) {
          deps.push({ dep, loc: _this.config.generateHardModulePath(dep._reference) });
        }
      }

      // link up the `bin` scripts in bundled dependencies
      if (pkg.bundleDependencies) {
        for (const depName of pkg.bundleDependencies) {
          const loc = path.join(_this.config.generateHardModulePath(ref), _this.config.getFolder(pkg), depName);

          const dep = yield _this.config.readManifest(loc, remote.registry);

          if (dep.bin && Object.keys(dep.bin).length) {
            deps.push({ dep, loc });
          }
        }
      }

      // no deps to link
      if (!deps.length) {
        return;
      }

      // write the executables
      for (const _ref4 of deps) {
        const dep = _ref4.dep,
              loc = _ref4.loc;

        yield _this.linkSelfDependencies(dep, loc, dir);
      }
    })();
  }

  getFlatHoistedTree(patterns) {
    const hoister = new (_packageHoister || _load_packageHoister()).default(this.config, this.resolver);
    hoister.seed(patterns);
    return Promise.resolve(hoister.init());
  }

  copyModules(patterns, linkDuplicates) {
    var _this2 = this;

    return (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)(function* () {
      let flatTree = yield _this2.getFlatHoistedTree(patterns);

      // sorted tree makes file creation and copying not to interfere with each other
      flatTree = flatTree.sort(function (dep1, dep2) {
        return dep1[0].localeCompare(dep2[0]);
      });

      // list of artifacts in modules to remove from extraneous removal
      const artifactFiles = [];

      const copyQueue = new Map();
      const hardlinkQueue = new Map();
      const hardlinksEnabled = linkDuplicates && (yield (_fs || _load_fs()).hardlinksWork(_this2.config.cwd));

      const linkTasks = [];
      const copiedSrcs = new Map();
      for (const _ref5 of flatTree) {
        var _ref6 = (0, (_slicedToArray2 || _load_slicedToArray()).default)(_ref5, 2);

        const dest = _ref6[0];
        var _ref6$ = _ref6[1];
        const pkg = _ref6$.pkg;
        const src = _ref6$.loc;

        const ref = pkg._reference;
        invariant(ref, 'expected package reference');
        ref.setLocation(dest);

        // backwards compatibility: get build artifacts from metadata
        const metadata = yield _this2.config.readPackageMetadata(src);
        for (const file of metadata.artifacts) {
          artifactFiles.push(path.join(dest, file));
        }

        linkTasks.push({ remote: metadata.remote, dest });

        const integrityArtifacts = _this2.artifacts[`${pkg.name}@${pkg.version}`];
        if (integrityArtifacts) {
          for (const file of integrityArtifacts) {
            artifactFiles.push(path.join(dest, file));
          }
        }

        const copiedDest = copiedSrcs.get(src);
        if (!copiedDest) {
          if (hardlinksEnabled) {
            copiedSrcs.set(src, dest);
          }
          copyQueue.set(dest, {
            src,
            dest,
            onFresh() {
              if (ref) {
                ref.setFresh(true);
              }
            }
          });
        } else {
          hardlinkQueue.set(dest, {
            src: copiedDest,
            dest,
            onFresh() {
              if (ref) {
                ref.setFresh(true);
              }
            }
          });
        }
      }

      // keep track of all scoped paths to remove empty scopes after copy
      const scopedPaths = new Set();

      // register root & scoped packages as being possibly extraneous
      const possibleExtraneous = new Set();
      for (const folder of _this2.config.registryFolders) {
        const loc = path.join(_this2.config.cwd, folder);

        if (yield (_fs || _load_fs()).exists(loc)) {
          const files = yield (_fs || _load_fs()).readdir(loc);
          let filepath;
          for (const file of files) {
            filepath = path.join(loc, file);
            if (file[0] === '@') {
              // it's a scope, not a package
              scopedPaths.add(filepath);
              const subfiles = yield (_fs || _load_fs()).readdir(filepath);
              for (const subfile of subfiles) {
                possibleExtraneous.add(path.join(filepath, subfile));
              }
            } else {
              possibleExtraneous.add(filepath);
            }
          }
        }
      }

      // linked modules
      for (const loc of possibleExtraneous) {
        const stat = yield (_fs || _load_fs()).lstat(loc);
        if (stat.isSymbolicLink()) {
          possibleExtraneous.delete(loc);
          copyQueue.delete(loc);
        }
      }

      //
      let tick;
      yield (_fs || _load_fs()).copyBulk(Array.from(copyQueue.values()), _this2.reporter, {
        possibleExtraneous,
        artifactFiles,

        ignoreBasenames: [(_constants || _load_constants()).METADATA_FILENAME, (_constants || _load_constants()).TARBALL_FILENAME],

        onStart: function (num) {
          tick = _this2.reporter.progress(num);
        },

        onProgress(src) {
          if (tick) {
            tick(src);
          }
        }
      });
      yield (_fs || _load_fs()).hardlinkBulk(Array.from(hardlinkQueue.values()), _this2.reporter, {
        possibleExtraneous,
        artifactFiles,

        onStart: function (num) {
          tick = _this2.reporter.progress(num);
        },

        onProgress(src) {
          if (tick) {
            tick(src);
          }
        }
      });

      // remove all extraneous files that weren't in the tree
      for (const loc of possibleExtraneous) {
        _this2.reporter.verbose(_this2.reporter.lang('verboseFileRemoveExtraneous', loc));
        yield (_fs || _load_fs()).unlink(loc);
      }

      // inject PackageRemote info into installation dep tree
      yield Promise.all(linkTasks.map((() => {
        var _ref7 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)(function* (_ref8) {
          let remote = _ref8.remote,
              dest = _ref8.dest;

          const packageJsonFilename = path.join(dest, 'package.json');
          const packageJson = yield (_fs || _load_fs()).readJson(packageJsonFilename);
          if (remote != null && remote.resolved != null) {
            packageJson._resolved = remote.resolved;
          }
          yield (_fs || _load_fs()).writeJson(packageJsonFilename, packageJson);
        });

        return function (_x3) {
          return _ref7.apply(this, arguments);
        };
      })()));

      // remove any empty scoped directories
      for (const scopedPath of scopedPaths) {
        const files = yield (_fs || _load_fs()).readdir(scopedPath);
        if (files.length === 0) {
          yield (_fs || _load_fs()).unlink(scopedPath);
        }
      }

      // create binary links
      if (_this2.config.binLinks) {
        const linksToCreate = _this2.determineTopLevelBinLinks(flatTree);
        const tickBin = _this2.reporter.progress(flatTree.length + linksToCreate.length);

        // create links in transient dependencies
        yield (_promise || _load_promise()).queue(flatTree, (() => {
          var _ref9 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)(function* (_ref10) {
            var _ref11 = (0, (_slicedToArray2 || _load_slicedToArray()).default)(_ref10, 2);

            let dest = _ref11[0],
                pkg = _ref11[1].pkg;

            const binLoc = path.join(dest, _this2.config.getFolder(pkg));
            yield _this2.linkBinDependencies(pkg, binLoc);
            tickBin(dest);
          });

          return function (_x4) {
            return _ref9.apply(this, arguments);
          };
        })(), 4);

        // create links at top level for all dependencies.
        // non-transient dependencies will overwrite these during this.save() to ensure they take priority.
        yield (_promise || _load_promise()).queue(linksToCreate, (() => {
          var _ref12 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)(function* (_ref13) {
            var _ref14 = (0, (_slicedToArray2 || _load_slicedToArray()).default)(_ref13, 2);

            let dest = _ref14[0],
                pkg = _ref14[1].pkg;

            if (pkg.bin && Object.keys(pkg.bin).length) {
              const binLoc = path.join(_this2.config.cwd, _this2.config.getFolder(pkg));
              yield _this2.linkSelfDependencies(pkg, dest, binLoc);
              tickBin(_this2.config.cwd);
            }
          });

          return function (_x5) {
            return _ref12.apply(this, arguments);
          };
        })(), 4);
      }
    })();
  }

  determineTopLevelBinLinks(flatTree) {
    const linksToCreate = new Map();

    flatTree.forEach((_ref15) => {
      var _ref16 = (0, (_slicedToArray2 || _load_slicedToArray()).default)(_ref15, 2);

      let dest = _ref16[0],
          hoistManifest = _ref16[1];

      if (!linksToCreate.has(hoistManifest.pkg.name)) {
        linksToCreate.set(hoistManifest.pkg.name, [dest, hoistManifest]);
      }
    });

    return Array.from(linksToCreate.values());
  }

  resolvePeerModules() {
    for (const pkg of this.resolver.getManifests()) {
      this._resolvePeerModules(pkg);
    }
  }

  _resolvePeerModules(pkg) {
    const peerDeps = pkg.peerDependencies;
    if (!peerDeps) {
      return;
    }

    const ref = pkg._reference;
    invariant(ref, 'Package reference is missing');

    for (const name in peerDeps) {
      const range = peerDeps[name];
      const patterns = this.resolver.patternsByPackage[name] || [];
      const foundPattern = patterns.find(pattern => {
        const resolvedPattern = this.resolver.getResolvedPattern(pattern);
        return resolvedPattern ? this._satisfiesPeerDependency(range, resolvedPattern.version) : false;
      });

      if (foundPattern) {
        ref.addDependencies([foundPattern]);
      } else {
        const depError = patterns.length > 0 ? 'incorrectPeer' : 'unmetPeer';
        const pkgHuman = `${pkg.name}@${pkg.version}`,
              depHuman = `${name}@${range}`;

        this.reporter.warn(this.reporter.lang(depError, pkgHuman, depHuman));
      }
    }
  }

  _satisfiesPeerDependency(range, version) {
    return range === '*' || (0, (_semver || _load_semver()).satisfiesWithPreleases)(version, range, this.config.looseSemver);
  }

  init(patterns, linkDuplicates) {
    var _this3 = this;

    return (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)(function* () {
      _this3.resolvePeerModules();
      yield _this3.copyModules(patterns, linkDuplicates);
      yield _this3.saveAll(patterns);
    })();
  }

  save(pattern) {
    var _this4 = this;

    return (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)(function* () {
      const resolved = _this4.resolver.getResolvedPattern(pattern);
      invariant(resolved, `Couldn't find resolved name/version for ${pattern}`);

      const ref = resolved._reference;
      invariant(ref, 'Missing reference');

      //
      const src = _this4.config.generateHardModulePath(ref);

      // link bins
      if (_this4.config.binLinks && resolved.bin && Object.keys(resolved.bin).length && !ref.ignore) {
        const binLoc = _this4.config.modulesFolder || path.join(_this4.config.cwd, _this4.config.getFolder(resolved));
        yield _this4.linkSelfDependencies(resolved, src, binLoc);
      }
    })();
  }

  saveAll(deps) {
    var _this5 = this;

    return (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)(function* () {
      deps = _this5.resolver.dedupePatterns(deps);
      yield (_promise || _load_promise()).queue(deps, function (dep) {
        return _this5.save(dep);
      });
    })();
  }
}
exports.default = PackageLinker;