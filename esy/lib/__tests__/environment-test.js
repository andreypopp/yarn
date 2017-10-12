'use strict';

var _buildConfig;

function _load_buildConfig() {
  return _buildConfig = require('../build-config');
}

var _buildTask;

function _load_buildTask() {
  return _buildTask = require('../build-task');
}

var _environment;

function _load_environment() {
  return _environment = require('../environment');
}

function build(_ref) {
  var name = _ref.name,
      exportedEnv = _ref.exportedEnv,
      dependenciesArray = _ref.dependencies;

  var dependencies = new Map();
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = dependenciesArray[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var item = _step.value;

      dependencies.set(item.id, item);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return {
    id: name,
    name,
    version: '0.1.0',
    dependencies,
    exportedEnv,
    mutatesSourcePath: false,
    sourcePath: name,
    sourceType: 'immutable',
    shouldBePersisted: true,
    command: null,
    errors: []
  };
}

var config = (0, (_buildConfig || _load_buildConfig()).createConfig)({
  sandboxPath: '<sandboxPath>',
  storePath: '<storePath>',
  buildPlatform: 'linux'
});

var ocaml = build({
  name: 'ocaml',
  exportedEnv: {
    CAML_LD_LIBRARY_PATH: {
      val: '$ocaml__lib/ocaml',
      scope: 'global'
    }
  },
  dependencies: []
});

var ocamlfind = build({
  name: 'ocamlfind',
  exportedEnv: {
    CAML_LD_LIBRARY_PATH: {
      val: '$ocamlfind__lib/ocaml:$CAML_LD_LIBRARY_PATH',
      scope: 'global'
    }
  },
  dependencies: [ocaml]
});

var lwt = build({
  name: 'lwt',
  exportedEnv: {
    CAML_LD_LIBRARY_PATH: {
      val: '$lwt__lib/ocaml:$CAML_LD_LIBRARY_PATH',
      scope: 'global'
    }
  },
  dependencies: [ocaml]
});

describe('printEnvironment()', function () {
  test('printing environment', function () {
    var app = build({
      name: 'app',
      exportedEnv: {
        CAML_LD_LIBRARY_PATH: {
          val: '$app__lib:$CAML_LD_LIBRARY_PATH',
          scope: 'global'
        }
      },
      dependencies: [ocamlfind, lwt]
    });

    var _fromBuildSpec = (0, (_buildTask || _load_buildTask()).fromBuildSpec)(app, config),
        env = _fromBuildSpec.env;

    expect((0, (_environment || _load_environment()).printEnvironment)(env)).toMatchSnapshot();
  });
});