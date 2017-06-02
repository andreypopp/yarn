'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.read = exports.write = undefined;

var _regenerator;

function _load_regenerator() {
  return _regenerator = _interopRequireDefault(require('babel-runtime/regenerator'));
}

var _asyncToGenerator2;

function _load_asyncToGenerator() {
  return _asyncToGenerator2 = _interopRequireDefault(require('babel-runtime/helpers/asyncToGenerator'));
}

var write = exports.write = function () {
  var _ref = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee4(rootDirname, nodes) {
    var writeFile = function () {
      var _ref2 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee(pathname, node) {
        var content;
        return (_regenerator || _load_regenerator()).default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                content = typeof node.content === 'string' || node.content instanceof Buffer ? node.content : JSON.stringify(node.content);
                _context.next = 3;
                return (_fs || _load_fs()).writeFile(pathname, content);

              case 3:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function writeFile(_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }();

    var writeLink = function () {
      var _ref3 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee2(pathname, node) {
        return (_regenerator || _load_regenerator()).default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return (_fs || _load_fs()).symlink((_path || _load_path()).resolve(node.realpath, rootDirname), pathname);

              case 2:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function writeLink(_x5, _x6) {
        return _ref3.apply(this, arguments);
      };
    }();

    var writeDirectory = function () {
      var _ref4 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee3(pathname, node) {
        var tasks, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, nextNode, nextPathname;

        return (_regenerator || _load_regenerator()).default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return (_fs || _load_fs()).mkdirp(pathname);

              case 2:
                tasks = [];
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context3.prev = 6;

                for (_iterator = node.nodes[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  nextNode = _step.value;
                  nextPathname = (_path || _load_path()).join(pathname, nextNode.name);

                  if (nextNode.type === 'file') {
                    tasks.push(writeFile(nextPathname, nextNode));
                  } else if (nextNode.type === 'link') {
                    tasks.push(writeLink(nextPathname, nextNode));
                  } else if (nextNode.type === 'directory') {
                    tasks.push(writeDirectory(nextPathname, nextNode));
                  }
                }
                _context3.next = 14;
                break;

              case 10:
                _context3.prev = 10;
                _context3.t0 = _context3['catch'](6);
                _didIteratorError = true;
                _iteratorError = _context3.t0;

              case 14:
                _context3.prev = 14;
                _context3.prev = 15;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 17:
                _context3.prev = 17;

                if (!_didIteratorError) {
                  _context3.next = 20;
                  break;
                }

                throw _iteratorError;

              case 20:
                return _context3.finish(17);

              case 21:
                return _context3.finish(14);

              case 22:
                _context3.next = 24;
                return Promise.all(tasks);

              case 24:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this, [[6, 10, 14, 22], [15,, 17, 21]]);
      }));

      return function writeDirectory(_x7, _x8) {
        return _ref4.apply(this, arguments);
      };
    }();

    return (_regenerator || _load_regenerator()).default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.t0 = (_invariant || _load_invariant()).default;
            _context4.next = 3;
            return (_fs || _load_fs()).readdir(rootDirname);

          case 3:
            _context4.t1 = _context4.sent.length;
            _context4.t2 = _context4.t1 === 0;
            (0, _context4.t0)(_context4.t2, 'Directory is not empty');
            _context4.next = 8;
            return writeDirectory(rootDirname, { type: 'directory', name: '<root>', nodes });

          case 8:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function write(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var read = exports.read = function () {
  var _ref5 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee7(rootDirname) {
    var crawlLink = function () {
      var _ref6 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee5(pathname, name) {
        var realpath;
        return (_regenerator || _load_regenerator()).default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.t0 = _path || _load_path();
                _context5.next = 3;
                return (_fs || _load_fs()).realpath(pathname);

              case 3:
                _context5.t1 = _context5.sent;
                _context5.t2 = rootDirname;
                realpath = _context5.t0.relative.call(_context5.t0, _context5.t1, _context5.t2);
                return _context5.abrupt('return', {
                  type: 'link',
                  name,
                  realpath
                });

              case 7:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      return function crawlLink(_x10, _x11) {
        return _ref6.apply(this, arguments);
      };
    }();

    var crawlDirectory = function () {
      var _ref7 = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee6(pathname, name) {
        var tasks, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _name, nextPathname, stat, nodes;

        return (_regenerator || _load_regenerator()).default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                tasks = [];
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context6.prev = 4;
                _context6.next = 7;
                return (_fs || _load_fs()).readdir(pathname);

              case 7:
                _context6.t0 = Symbol.iterator;
                _iterator2 = _context6.sent[_context6.t0]();

              case 9:
                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                  _context6.next = 19;
                  break;
                }

                _name = _step2.value;
                nextPathname = (_path || _load_path()).join(pathname, _name);
                _context6.next = 14;
                return (_fs || _load_fs()).stat(nextPathname);

              case 14:
                stat = _context6.sent;

                if (stat.isSymbolicLink()) {
                  tasks.push(crawlLink(nextPathname, _name));
                } else if (stat.isFile()) {
                  tasks.push(crawlFile(nextPathname, _name));
                } else if (stat.isDirectory()) {
                  tasks.push(crawlDirectory(nextPathname, _name));
                }

              case 16:
                _iteratorNormalCompletion2 = true;
                _context6.next = 9;
                break;

              case 19:
                _context6.next = 25;
                break;

              case 21:
                _context6.prev = 21;
                _context6.t1 = _context6['catch'](4);
                _didIteratorError2 = true;
                _iteratorError2 = _context6.t1;

              case 25:
                _context6.prev = 25;
                _context6.prev = 26;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 28:
                _context6.prev = 28;

                if (!_didIteratorError2) {
                  _context6.next = 31;
                  break;
                }

                throw _iteratorError2;

              case 31:
                return _context6.finish(28);

              case 32:
                return _context6.finish(25);

              case 33:
                _context6.next = 35;
                return Promise.all(tasks);

              case 35:
                nodes = _context6.sent;

                nodes.sort(function (a, b) {
                  return a.name.localeCompare(b.name);
                });
                return _context6.abrupt('return', { type: 'directory', name, nodes });

              case 38:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this, [[4, 21, 25, 33], [26,, 28, 32]]);
      }));

      return function crawlDirectory(_x12, _x13) {
        return _ref7.apply(this, arguments);
      };
    }();

    var crawlFile, _ref8, nodes;

    return (_regenerator || _load_regenerator()).default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            crawlFile = function crawlFile(pathname, name) {
              return Promise.resolve({
                type: 'file',
                name,
                content: null
              });
            };

            _context7.next = 3;
            return crawlDirectory(rootDirname, '<root>');

          case 3:
            _ref8 = _context7.sent;
            nodes = _ref8.nodes;
            return _context7.abrupt('return', nodes);

          case 6:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, this);
  }));

  return function read(_x9) {
    return _ref5.apply(this, arguments);
  };
}();

exports.file = file;
exports.link = link;
exports.directory = directory;

var _invariant;

function _load_invariant() {
  return _invariant = _interopRequireDefault(require('invariant'));
}

var _path;

function _load_path() {
  return _path = _interopRequireWildcard(require('path'));
}

var _fs;

function _load_fs() {
  return _fs = _interopRequireWildcard(require('./fs'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function file(name, content) {
  return { type: 'file', name, content };
}

function link(name, realpath) {
  return { type: 'link', name, realpath };
}

function directory(name, nodes) {
  return { type: 'directory', name, nodes };
}