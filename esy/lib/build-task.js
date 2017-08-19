'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2;

function _load_extends() {
  return _extends2 = _interopRequireDefault(require('babel-runtime/helpers/extends'));
}

exports.fromBuildSpec = fromBuildSpec;
exports.renderWithScope = renderWithScope;
exports.quoteArgIfNeeded = quoteArgIfNeeded;
exports.expandWithScope = expandWithScope;
exports.fromBuildSandbox = fromBuildSandbox;

var _varExpansion;

function _load_varExpansion() {
  return _varExpansion = require('var-expansion');
}

var _util;

function _load_util() {
  return _util = require('./util');
}

var _graph;

function _load_graph() {
  return _graph = _interopRequireWildcard(require('./graph'));
}

var _environment;

function _load_environment() {
  return _environment = _interopRequireWildcard(require('./environment'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Produce a task graph from a build spec graph.
 */
function fromBuildSpec(rootBuild, config, params) {
  var _Graph$topologicalFol = (_graph || _load_graph()).topologicalFold(rootBuild, function (dependencies, allDependencies, spec) {
    var scopes = computeScopes(dependencies, allDependencies, spec);
    var task = createTask(scopes);
    return { spec, scopes, task };
  }),
      task = _Graph$topologicalFol.task;

  function computeScopes(dependencies, allDependencies, spec) {
    // scope which is used to eval exported variables
    var evalScope = getEvalScope(spec, dependencies, config);
    // global env vars exported from a spec
    var globalScope = new Map();
    // local env vars exported from a spec
    var localScope = new Map();
    for (var _name in spec.exportedEnv) {
      var envConfig = spec.exportedEnv[_name];
      var _value = renderWithScope(envConfig.val, evalScope).rendered;
      var item = {
        name: _name,
        value: _value,
        spec,
        builtIn: false,
        exported: true,
        exclusive: Boolean(envConfig.exclusive)
      };
      if (envConfig.scope === 'global') {
        globalScope.set(_name, item);
      } else {
        localScope.set(_name, item);
      }
    }
    var scopes = {
      spec,
      localScope,
      globalScope,
      dependencies,
      allDependencies
    };
    return scopes;
  }

  function createTask(scopes) {
    var env = new Map();

    var ocamlfindDest = config.getInstallPath(scopes.spec, 'lib');
    var ocamlpath = Array.from(scopes.allDependencies.values()).map(function (dep) {
      return config.getFinalInstallPath(dep.spec, 'lib');
    }).join(':');

    evalIntoEnv(env, [{
      name: 'OCAMLPATH',
      value: ocamlpath,
      exported: true,
      exclusive: true
    }, {
      name: 'OCAMLFIND_DESTDIR',
      value: ocamlfindDest,
      exported: true,
      exclusive: true
    }, {
      name: 'OCAMLFIND_LDCONF',
      value: 'ignore',
      exported: true,
      exclusive: true
    }, {
      name: 'OCAMLFIND_COMMANDS',
      // eslint-disable-next-line max-len
      value: 'ocamlc=ocamlc.opt ocamldep=ocamldep.opt ocamldoc=ocamldoc.opt ocamllex=ocamllex.opt ocamlopt=ocamlopt.opt',
      exported: true,
      exclusive: true
    }, {
      name: 'PATH',
      value: Array.from(scopes.allDependencies.values()).map(function (dep) {
        return config.getFinalInstallPath(dep.spec, 'bin');
      }).concat('$PATH').join(':'),
      exported: true
    }, {
      name: 'MAN_PATH',
      value: Array.from(scopes.allDependencies.values()).map(function (dep) {
        return config.getFinalInstallPath(dep.spec, 'man');
      }).concat('$MAN_PATH').join(':'),
      exported: true
    }]);

    if (scopes.spec === rootBuild) {
      // Check if we want to expose $cur__bin in $PATH
      if (params != null && params.exposeOwnPath) {
        evalIntoEnv(env, [{
          name: 'PATH',
          value: `${config.getFinalInstallPath(rootBuild, 'bin')}:$PATH`
        }, {
          name: 'MAN_PATH',
          value: `${config.getFinalInstallPath(rootBuild, 'man')}:$MAN_PATH`
        }]);
      }
    }

    var errors = [];

    // $cur__name, $cur__version and so on...
    (0, (_util || _load_util()).mergeIntoMap)(env, getBuiltInScope(scopes.spec, config, true));

    // direct deps' local scopes
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = scopes.dependencies.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var dep = _step.value;

        (0, (_util || _load_util()).mergeIntoMap)(env, dep.scopes.localScope);
      }
      // build's own local scope
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

    (0, (_util || _load_util()).mergeIntoMap)(env, scopes.localScope);
    // all deps' global scopes merged
    (0, (_util || _load_util()).mergeIntoMap)(env, (_environment || _load_environment()).merge(Array.from(scopes.allDependencies.values()).map(function (dep) {
      return dep.scopes.globalScope;
    }).concat(scopes.globalScope), evalIntoEnv));

    if (params != null && params.env != null) {
      evalIntoEnv(env, Array.from(params.env.values()));
    }

    var scope = new Map();
    (0, (_util || _load_util()).mergeIntoMap)(scope, getEvalScope(scopes.spec, scopes.dependencies, config));
    (0, (_util || _load_util()).mergeIntoMap)(scope, env);

    var command = scopes.spec.command != null ? scopes.spec.command.map(function (command) {
      return renderCommand(command, scope);
    }) : scopes.spec.command;

    return {
      id: scopes.spec.id,
      spec: scopes.spec,
      command,
      env,
      scope,
      dependencies: (0, (_util || _load_util()).mapValuesMap)(scopes.dependencies, function (dep) {
        return dep.task;
      }),
      errors
    };
  }

  function renderCommand(command, scope) {
    if (Array.isArray(command)) {
      return {
        command: command.join(' '),
        renderedCommand: command.map(function (command) {
          return quoteArgIfNeeded(expandWithScope(command, scope).rendered);
        }).join(' ')
      };
    } else {
      return {
        command,
        renderedCommand: expandWithScope(command, scope).rendered
      };
    }
  }

  return task;
}

function builtInEntry(_ref) {
  var name = _ref.name,
      value = _ref.value,
      spec = _ref.spec,
      _ref$exclusive = _ref.exclusive,
      exclusive = _ref$exclusive === undefined ? true : _ref$exclusive,
      _ref$exported = _ref.exported,
      exported = _ref$exported === undefined ? false : _ref$exported;

  return [name, { name, value, spec, builtIn: true, exclusive, exported }];
}

function builtInEntries() {
  for (var _len = arguments.length, values = Array(_len), _key = 0; _key < _len; _key++) {
    values[_key] = arguments[_key];
  }

  return new Map(values.map(builtInEntry));
}

function getBuiltInScope(spec, config, currentlyBuilding) {
  var prefix = currentlyBuilding ? 'cur' : (0, (_util || _load_util()).normalizePackageName)(spec.name);
  var getInstallPath = currentlyBuilding ? config.getInstallPath : config.getFinalInstallPath;
  return builtInEntries({
    name: `${prefix}__name`,
    value: spec.name,
    spec
  }, {
    name: `${prefix}__version`,
    value: spec.version,
    spec
  }, {
    name: `${prefix}__root`,
    value: currentlyBuilding && spec.mutatesSourcePath ? config.getBuildPath(spec) : config.getRootPath(spec),
    spec
  }, {
    name: `${prefix}__depends`,
    value: Array.from(spec.dependencies.values(), function (dep) {
      return dep.name;
    }).join(' '),
    spec
  }, {
    name: `${prefix}__target_dir`,
    value: config.getBuildPath(spec),
    spec
  }, {
    name: `${prefix}__install`,
    value: getInstallPath(spec),
    spec
  }, {
    name: `${prefix}__bin`,
    value: getInstallPath(spec, 'bin'),
    spec
  }, {
    name: `${prefix}__sbin`,
    value: getInstallPath(spec, 'sbin'),
    spec
  }, {
    name: `${prefix}__lib`,
    value: getInstallPath(spec, 'lib'),
    spec
  }, {
    name: `${prefix}__man`,
    value: getInstallPath(spec, 'man'),
    spec
  }, {
    name: `${prefix}__doc`,
    value: getInstallPath(spec, 'doc'),
    spec
  }, {
    name: `${prefix}__stublibs`,
    value: getInstallPath(spec, 'stublibs'),
    spec
  }, {
    name: `${prefix}__toplevel`,
    value: getInstallPath(spec, 'toplevel'),
    spec
  }, {
    name: `${prefix}__share`,
    value: getInstallPath(spec, 'share'),
    spec
  }, {
    name: `${prefix}__etc`,
    value: getInstallPath(spec, 'etc'),
    spec
  });
}

function evalIntoEnv(scope, items) {
  var update = new Map();
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = items[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var item = _step2.value;

      var nextItem = (0, (_extends2 || _load_extends()).default)({
        exported: true,
        exclusive: false,
        builtIn: false
      }, item, {
        value: renderWithScope(item.value, scope).rendered
      });
      update.set(item.name, nextItem);
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  (0, (_util || _load_util()).mergeIntoMap)(scope, update);
  return scope;
}

function getEvalScope(spec, dependencies, config) {
  var evalScope = new Map();
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = dependencies.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var dep = _step3.value;

      (0, (_util || _load_util()).mergeIntoMap)(evalScope, getBuiltInScope(dep.spec, config));
      (0, (_util || _load_util()).mergeIntoMap)(evalScope, dep.scopes.localScope);
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  (0, (_util || _load_util()).mergeIntoMap)(evalScope, getBuiltInScope(spec, config));
  return evalScope;
}

var FIND_VAR_RE = /\$([a-zA-Z0-9_]+)/g;

function renderWithScope(value, scope) {
  var rendered = value.replace(FIND_VAR_RE, function (_, name) {
    var value = scope.get(name);
    if (value == null) {
      return `\$${name}`;
    } else {
      return value.value;
    }
  });
  return { rendered };
}

function quoteArgIfNeeded(arg) {
  if (arg.indexOf(' ') === -1) {
    return arg;
  } else {
    return `"${arg}"`;
  }
}

function expandWithScope(value, scope) {
  var _substituteVariables = (0, (_varExpansion || _load_varExpansion()).substituteVariables)(value, {
    env: function env(name) {
      var item = scope.get(name);
      return item != null ? item.value : undefined;
    }
  }),
      rendered = _substituteVariables.value;

  return { rendered: rendered != null ? rendered : value };
}

function fromBuildSandbox(sandbox, config, params) {
  var env = new Map();
  if (sandbox.env) {
    (0, (_util || _load_util()).mergeIntoMap)(env, sandbox.env);
  }
  if (params != null && params.env != null) {
    (0, (_util || _load_util()).mergeIntoMap)(env, params.env);
  }
  return fromBuildSpec(sandbox.root, config, (0, (_extends2 || _load_extends()).default)({}, params, { env }));
}