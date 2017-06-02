'use strict';

var _regenerator;

function _load_regenerator() {
  return _regenerator = _interopRequireDefault(require('babel-runtime/regenerator'));
}

var _asyncToGenerator2;

function _load_asyncToGenerator() {
  return _asyncToGenerator2 = _interopRequireDefault(require('babel-runtime/helpers/asyncToGenerator'));
}

var _fs;

function _load_fs() {
  return _fs = _interopRequireWildcard(require('../lib/fs'));
}

var _fsRepr;

function _load_fsRepr() {
  return _fsRepr = _interopRequireWildcard(require('../lib/fs-repr'));
}

var _buildSandbox;

function _load_buildSandbox() {
  return _buildSandbox = require('../build-sandbox');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function pkg(packageJson) {
  var nodes = [(_fsRepr || _load_fsRepr()).file('package.json', packageJson)];

  for (var _len = arguments.length, dependencies = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    dependencies[_key - 1] = arguments[_key];
  }

  if (dependencies.length > 0) {
    nodes.push((_fsRepr || _load_fsRepr()).directory('node_modules', dependencies));
  }
  return (_fsRepr || _load_fsRepr()).directory(packageJson.name, nodes);
}

describe('build-sandbox', function () {
  var prepareSandbox = function () {
    var _ref = (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee(nodes) {
      var tempdir;
      return (_regenerator || _load_regenerator()).default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return (_fs || _load_fs()).mkdtemp('esy-test-sandbox');

            case 2:
              tempdir = _context.sent;

              directoriesToCleanup.push(tempdir);
              _context.next = 6;
              return (_fsRepr || _load_fsRepr()).write(tempdir, nodes);

            case 6:
              return _context.abrupt('return', tempdir);

            case 7:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function prepareSandbox(_x) {
      return _ref.apply(this, arguments);
    };
  }();

  var directoriesToCleanup = [];

  beforeEach(function () {
    directoriesToCleanup = [];
  });

  afterEach((0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee2() {
    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, dirname;

    return (_regenerator || _load_regenerator()).default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context2.prev = 3;
            _iterator = directoriesToCleanup[Symbol.iterator]();

          case 5:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context2.next = 17;
              break;
            }

            dirname = _step.value;
            _context2.prev = 7;
            _context2.next = 10;
            return (_fs || _load_fs()).unlink(dirname);

          case 10:
            _context2.next = 14;
            break;

          case 12:
            _context2.prev = 12;
            _context2.t0 = _context2['catch'](7);

          case 14:
            _iteratorNormalCompletion = true;
            _context2.next = 5;
            break;

          case 17:
            _context2.next = 23;
            break;

          case 19:
            _context2.prev = 19;
            _context2.t1 = _context2['catch'](3);
            _didIteratorError = true;
            _iteratorError = _context2.t1;

          case 23:
            _context2.prev = 23;
            _context2.prev = 24;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 26:
            _context2.prev = 26;

            if (!_didIteratorError) {
              _context2.next = 29;
              break;
            }

            throw _iteratorError;

          case 29:
            return _context2.finish(26);

          case 30:
            return _context2.finish(23);

          case 31:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[3, 19, 23, 31], [7, 12], [24,, 26, 30]]);
  })));

  test('builds a sandbox from a single package', (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee3() {
    var sandboxDir, sandbox;
    return (_regenerator || _load_regenerator()).default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return prepareSandbox(pkg({
              name: 'app',
              version: '0.1.0'
            }).nodes);

          case 2:
            sandboxDir = _context3.sent;
            _context3.next = 5;
            return (0, (_buildSandbox || _load_buildSandbox()).fromDirectory)(sandboxDir);

          case 5:
            sandbox = _context3.sent;

            expect(sandbox.root).toMatchSnapshot();

          case 7:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  })));

  test('builds a sandbox from a package with deps', (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee4() {
    var sandboxDir, sandbox;
    return (_regenerator || _load_regenerator()).default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return prepareSandbox(pkg({
              name: 'app',
              version: '0.1.0',
              dependencies: {
                dep: '*'
              }
            }, pkg({
              name: 'dep',
              version: '0.1.0'
            })).nodes);

          case 2:
            sandboxDir = _context4.sent;
            _context4.next = 5;
            return (0, (_buildSandbox || _load_buildSandbox()).fromDirectory)(sandboxDir);

          case 5:
            sandbox = _context4.sent;

            expect(sandbox.root).toMatchSnapshot();

          case 7:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  })));

  test('error: missing a dep', (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee5() {
    var sandboxDir, sandbox;
    return (_regenerator || _load_regenerator()).default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return prepareSandbox(pkg({
              name: 'app',
              version: '0.1.0',
              dependencies: {
                dep: '*'
              }
            }).nodes);

          case 2:
            sandboxDir = _context5.sent;
            _context5.next = 5;
            return (0, (_buildSandbox || _load_buildSandbox()).fromDirectory)(sandboxDir);

          case 5:
            sandbox = _context5.sent;

            expect(sandbox.root).toMatchSnapshot();

          case 7:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this);
  })));

  test('error: circular deps', (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee6() {
    var sandboxDir, sandbox;
    return (_regenerator || _load_regenerator()).default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return prepareSandbox(pkg({
              name: 'app',
              version: '0.1.0',
              dependencies: {
                dep: '*'
              }
            }, pkg({
              name: 'dep',
              version: '0.1.0',
              dependencies: {
                app: '*'
              }
            })).nodes);

          case 2:
            sandboxDir = _context6.sent;
            _context6.next = 5;
            return (0, (_buildSandbox || _load_buildSandbox()).fromDirectory)(sandboxDir);

          case 5:
            sandbox = _context6.sent;

            expect(sandbox.root).toMatchSnapshot();

          case 7:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, this);
  })));

  test('error: duplicate dep', (0, (_asyncToGenerator2 || _load_asyncToGenerator()).default)((_regenerator || _load_regenerator()).default.mark(function _callee7() {
    var sandboxDir, sandbox;
    return (_regenerator || _load_regenerator()).default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return prepareSandbox(pkg({
              name: 'app',
              version: '0.1.0',
              dependencies: {
                dep: '*',
                ocaml: '*'
              }
            }, pkg({
              name: 'ocaml',
              version: '4.3.0'
            }), pkg({
              name: 'dep',
              version: '0.1.0',
              dependencies: {
                ocaml: '*'
              }
            }, pkg({
              name: 'ocaml',
              version: '4.3.0'
            }))).nodes);

          case 2:
            sandboxDir = _context7.sent;
            _context7.next = 5;
            return (0, (_buildSandbox || _load_buildSandbox()).fromDirectory)(sandboxDir);

          case 5:
            sandbox = _context7.sent;

            expect(sandbox.root).toMatchSnapshot();

          case 7:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, this);
  })));
});