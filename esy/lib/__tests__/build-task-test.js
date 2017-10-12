'use strict';

var _buildTask;

function _load_buildTask() {
  return _buildTask = require('../build-task');
}

var _buildConfig;

function _load_buildConfig() {
  return _buildConfig = _interopRequireWildcard(require('../build-config'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function calculate(config, spec, params) {
  var _fromBuildSpec = (0, (_buildTask || _load_buildTask()).fromBuildSpec)(spec, config, params),
      env = _fromBuildSpec.env,
      scope = _fromBuildSpec.scope;

  return { env, scope };
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
    sourcePath: name,
    sourceType: 'immutable',
    dependencies,
    exportedEnv,
    mutatesSourcePath: false,
    shouldBePersisted: true,
    command: null,
    errors: []
  };
}

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

var config = (_buildConfig || _load_buildConfig()).createConfig({
  sandboxPath: '<sandboxPath>',
  storePath: '<storePath>',
  buildPlatform: 'linux'
});

describe('renderWithScope()', function () {
  test('simple replacement: $var syntax', function () {
    var scope = new Map([['name', { value: 'World' }]]);
    expect((0, (_buildTask || _load_buildTask()).renderWithScope)('Hello, $name!', scope)).toEqual({
      rendered: 'Hello, World!'
    });
  });

  test('multiple replacements', function () {
    var scope = new Map([['name', { value: 'World' }]]);
    expect((0, (_buildTask || _load_buildTask()).renderWithScope)('Hello, $name + $name!', scope)).toEqual({
      rendered: 'Hello, World + World!'
    });
  });

  test('missing in scope', function () {
    var scope = new Map([]);
    expect((0, (_buildTask || _load_buildTask()).renderWithScope)('Hello, $unknown!', scope)).toEqual({
      rendered: 'Hello, $unknown!'
    });
  });
});

describe('expandWithScope()', function () {
  test('simple replacement: $var syntax', function () {
    var scope = new Map([['name', { value: 'World' }]]);
    expect((0, (_buildTask || _load_buildTask()).expandWithScope)('Hello, $name!', scope)).toEqual({
      rendered: 'Hello, World!'
    });
  });

  test('simple replacement: ${var} syntax', function () {
    var scope = new Map([['name', { value: 'World' }]]);
    expect((0, (_buildTask || _load_buildTask()).expandWithScope)('Hello, ${name}!', scope)).toEqual({
      rendered: 'Hello, World!'
    });
  });

  test('multiple replacements', function () {
    var scope = new Map([['name', { value: 'World' }]]);
    expect((0, (_buildTask || _load_buildTask()).expandWithScope)('Hello, $name + $name!', scope)).toEqual({
      rendered: 'Hello, World + World!'
    });
  });

  test('missing in scope', function () {
    var scope = new Map([]);
    expect((0, (_buildTask || _load_buildTask()).expandWithScope)('Hello, $unknown!', scope)).toEqual({
      rendered: 'Hello, !'
    });
  });

  test('expansion with fallback to default value', function () {
    var scope = new Map([]);
    expect((0, (_buildTask || _load_buildTask()).expandWithScope)('Hello, ${unknown:-Me}!', scope)).toEqual({
      rendered: 'Hello, Me!'
    });
  });
});

describe('calculating env', function () {
  // $FlowFixMe: fix jest flow-typed defs
  expect.addSnapshotSerializer({
    test(val) {
      return val.id && val.name && val.dependencies && val.exportedEnv;
    },
    print(val) {
      return `BuildSpec { id: "${val.id}" }`;
    }
  });

  test('build with no exports', function () {
    var app = build({
      name: 'app',
      exportedEnv: {},
      dependencies: []
    });
    expect(calculate(config, app)).toMatchSnapshot();
  });

  test('build with local exports', function () {
    var app = build({
      name: 'app',
      exportedEnv: {
        app__var: { val: 'hello' }
      },
      dependencies: []
    });
    expect(calculate(config, app)).toMatchSnapshot();
  });

  test('build with global exports', function () {
    var app = build({
      name: 'app',
      exportedEnv: {
        APP: { val: 'hello', scope: 'global' }
      },
      dependencies: []
    });
    expect(calculate(config, app)).toMatchSnapshot();
  });

  test('build with global export referencing built-in', function () {
    var app = build({
      name: 'app',
      exportedEnv: {
        APP: { val: 'hello, $app__name', scope: 'global' }
      },
      dependencies: []
    });
    expect(calculate(config, app)).toMatchSnapshot();
  });

  test('build with global export referencing built-in (cur-version)', function () {
    var app = build({
      name: 'app',
      exportedEnv: {
        APP: { val: 'hello, $cur__name', scope: 'global' }
      },
      dependencies: []
    });
    expect(calculate(config, app)).toMatchSnapshot();
  });

  test('build with (dep with local export)', function () {
    var dep = build({
      name: 'dep',
      exportedEnv: {
        dep__var: { val: 'hello' }
      },
      dependencies: []
    });
    var app = build({
      name: 'app',
      exportedEnv: {},
      dependencies: [dep]
    });
    expect(calculate(config, app)).toMatchSnapshot();
  });

  test('build with (dep with local export) with global export referencing dep built-in', function () {
    var dep = build({
      name: 'dep',
      exportedEnv: {},
      dependencies: []
    });
    var app = build({
      name: 'app',
      exportedEnv: {
        APP: { val: 'hello, $dep__name', scope: 'global' }
      },
      dependencies: [dep]
    });
    expect(calculate(config, app)).toMatchSnapshot();
  });

  test('build with (dep with local export) with global export referencing dep local export', function () {
    var dep = build({
      name: 'dep',
      exportedEnv: {
        dep__var: { val: 'hello' }
      },
      dependencies: []
    });
    var app = build({
      name: 'app',
      exportedEnv: {
        APP: { val: '$dep__var, world', scope: 'global' }
      },
      dependencies: [dep]
    });
    expect(calculate(config, app)).toMatchSnapshot();
  });

  test('build with (dep with local export) with local export referencing dep built-in', function () {
    var dep = build({
      name: 'dep',
      exportedEnv: {},
      dependencies: []
    });
    var app = build({
      name: 'app',
      exportedEnv: {
        app__var: { val: 'hello, $dep__name' }
      },
      dependencies: [dep]
    });
    expect(calculate(config, app)).toMatchSnapshot();
  });

  test('build with (dep with local export) with local export referencing dep local export', function () {
    var dep = build({
      name: 'dep',
      exportedEnv: {
        dep__var: { val: 'hello' }
      },
      dependencies: []
    });
    var app = build({
      name: 'app',
      exportedEnv: {
        app_var: { val: '$dep__var, world' }
      },
      dependencies: [dep]
    });
    expect(calculate(config, app)).toMatchSnapshot();
  });

  test('build with (dep with (dep with local export) with local export)', function () {
    var depOfDep = build({
      name: 'dep-of-dep',
      exportedEnv: {
        dep_of_dep__var: { val: 'hello' }
      },
      dependencies: []
    });
    var dep = build({
      name: 'dep',
      exportedEnv: {
        dep__var: { val: 'hello' }
      },
      dependencies: [depOfDep]
    });
    var app = build({
      name: 'app',
      exportedEnv: {},
      dependencies: [dep]
    });
    expect(calculate(config, app)).toMatchSnapshot();
  });

  test('concatenating global exports', function () {
    var app1 = build({
      name: 'app',
      exportedEnv: {},
      dependencies: [ocamlfind, ocaml]
    });
    expect(calculate(config, app1)).toMatchSnapshot();
    // check that order is deterministic (b/c of topo sort order of deps)
    var app2 = build({
      name: 'app',
      exportedEnv: {},
      dependencies: [ocaml, ocamlfind]
    });
    // TODO: uncomment this and make it pass
    //expect(calculate(config, app1)).toEqual(calculate(config, app2));
  });

  test('concatenating global exports (same level exports)', function () {
    var app = build({
      name: 'app',
      exportedEnv: {},
      dependencies: [ocamlfind, lwt]
    });
    expect(calculate(config, app)).toMatchSnapshot();
  });

  test('concatenating global exports (same level exports + package itself)', function () {
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
    expect(calculate(config, app)).toMatchSnapshot();
  });

  test('exposing own $cur__bin in $PATH', function () {
    var dep = build({
      name: 'dep',
      exportedEnv: {
        dep__var: { val: 'hello' }
      },
      dependencies: []
    });
    var app = build({
      name: 'app',
      exportedEnv: {},
      dependencies: [dep]
    });
    var PATH = calculate(config, app, { exposeOwnPath: true }).env.get('PATH');
    expect(PATH).toMatchSnapshot();
  });
});