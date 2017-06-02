'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rewritePathInFile = undefined;

var _regenerator;

function _load_regenerator() {
  return _regenerator = _interopRequireDefault(require('babel-runtime/regenerator'));
}

var _asyncToGenerator2;

function _load_asyncToGenerator() {
  return _asyncToGenerator2 = _interopRequireDefault(require('babel-runtime/helpers/asyncToGenerator'));
}

var rewritePathInFile = exports.rewritePathInFile = function () {
  var _ref = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee(filename, origPath, destPath) {
    var stat, content, offset, needRewrite;
    return (_regenerator || _load_regenerator()).default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (_fs || _load_fs()).stat(filename);

          case 2:
            stat = _context.sent;

            if (stat.isFile()) {
              _context.next = 5;
              break;
            }

            return _context.abrupt('return');

          case 5:
            _context.next = 7;
            return (_fs || _load_fs()).readFileBuffer(filename);

          case 7:
            content = _context.sent;
            offset = content.indexOf(origPath);
            needRewrite = offset > -1;

            while (offset > -1) {
              content.write(destPath, offset);
              offset = content.indexOf(origPath);
            }

            if (!needRewrite) {
              _context.next = 14;
              break;
            }

            _context.next = 14;
            return (_fs || _load_fs()).writeFile(filename, content);

          case 14:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function rewritePathInFile(_x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

exports.renderSandboxSbConfig = renderSandboxSbConfig;
exports.renderEnv = renderEnv;
exports.exec = exec;

var _child_process;

function _load_child_process() {
  return _child_process = _interopRequireWildcard(require('child_process'));
}

var _fs;

function _load_fs() {
  return _fs = _interopRequireWildcard(require('../lib/fs'));
}

var _outdent;

function _load_outdent() {
  return _outdent = _interopRequireDefault(require('outdent'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function renderSandboxSbConfig(spec, config) {
  var sandboxSpec = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var subpathList = function subpathList(pathList) {
    return pathList ? pathList.filter(Boolean).map(function (path) {
      return `(subpath "${path}")`;
    }).join(' ') : '';
  };

  // TODO: Right now the only thing this sandbox configuration does is it
  // disallows writing into locations other than $cur__root,
  // $cur__target_dir and $cur__install. We should implement proper out of
  // source builds and also disallow $cur__root.
  // TODO: Try to use (deny default) and pick a set of rules for builds to
  // proceed (it chokes on xcodebuild for now if we disable reading "/" and
  // networking).
  return (_outdent || _load_outdent()).default`
    (version 1.0)
    (allow default)

    (deny file-write*
      (subpath "/"))

    (allow file-write*
      (literal "/dev/null")

      ; $cur__target_dir
      (subpath "${config.getBuildPath(spec)}")

      ; $cur__install
      (subpath "${config.getInstallPath(spec)}")

      ; config.allowFileWrite
      ${subpathList(sandboxSpec.allowFileWrite)}
    )

  `;
}

function renderEnv(env) {
  return Array.from(env.values()).map(function (env) {
    return `export ${env.name}="${env.value}";`;
  }).join('\n');
}

function exec() {
  var process = (_child_process || _load_child_process()).exec.apply(_child_process || _load_child_process(), arguments);
  var exit = new Promise(function (resolve) {
    process.on('exit', function (code, signal) {
      return resolve({ code, signal });
    });
  });
  return { process, exit };
}