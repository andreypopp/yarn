'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2;

function _load_toConsumableArray() {
  return _toConsumableArray2 = _interopRequireDefault(require('babel-runtime/helpers/toConsumableArray'));
}

exports.renderToMakefile = renderToMakefile;

var _path;

function _load_path() {
  return _path = _interopRequireWildcard(require('path'));
}

var _fs;

function _load_fs() {
  return _fs = _interopRequireWildcard(require('fs'));
}

var _mkdirp;

function _load_mkdirp() {
  return _mkdirp = require('mkdirp');
}

var _debug;

function _load_debug() {
  return _debug = _interopRequireDefault(require('debug'));
}

var _outdent;

function _load_outdent() {
  return _outdent = _interopRequireDefault(require('outdent'));
}

var _graph;

function _load_graph() {
  return _graph = _interopRequireWildcard(require('../../graph'));
}

var _buildConfig;

function _load_buildConfig() {
  return _buildConfig = _interopRequireWildcard(require('../../build-config'));
}

var _buildTask;

function _load_buildTask() {
  return _buildTask = _interopRequireWildcard(require('../../build-task'));
}

var _environment;

function _load_environment() {
  return _environment = _interopRequireWildcard(require('../../environment'));
}

var _Makefile;

function _load_Makefile() {
  return _Makefile = _interopRequireWildcard(require('../../Makefile'));
}

var _util;

function _load_util() {
  return _util = require('../../util');
}

var _util2;

function _load_util2() {
  return _util2 = require('../util');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, (_debug || _load_debug()).default)('esy:makefile-builder');

var CWD = process.cwd();

var RUNTIME = (_fs || _load_fs()).readFileSync((_path || _load_path()).join(__dirname, 'runtime.sh'), 'utf8');

var fastReplaceStringSrc = (_fs || _load_fs()).readFileSync(require.resolve('fastreplacestring/fastreplacestring.cpp'), 'utf8');

/**
 * Render `build` as Makefile (+ related files) into the supplied `outputPath`.
 */
function renderToMakefile(sandbox, outputPath, buildConfig) {
  log(`eject build environment into <ejectRootDir>=./${(_path || _load_path()).relative(CWD, outputPath)}`);

  var finalInstallPathSet = [];

  var ruleSet = [{
    type: 'raw',
    value: 'SHELL := env -i /bin/bash --norc --noprofile'
  },

  // ESY_EJECT__ROOT is the root directory of the ejected Esy build
  // environment.
  {
    type: 'raw',
    value: 'ESY_EJECT__ROOT := $(dir $(realpath $(lastword $(MAKEFILE_LIST))))'
  },

  // ESY_EJECT__STORE is the directory where build artifacts should be stored.
  {
    type: 'raw',
    value: `ESY_EJECT__STORE ?= $(HOME)/.esy/${(_buildConfig || _load_buildConfig()).ESY_STORE_VERSION}`
  },

  // ESY_EJECT__SANDBOX is the sandbox directory, the directory where the root
  // package resides.
  {
    type: 'raw',
    value: 'ESY_EJECT__SANDBOX ?= $(CURDIR)'
  },

  // These are public API

  {
    type: 'rule',
    target: 'build',
    phony: true,
    dependencies: [createBuildRuleName(sandbox.root, 'build')]
  }, {
    type: 'rule',
    target: 'build-shell',
    phony: true,
    dependencies: [createBuildRuleName(sandbox.root, 'shell')]
  }, {
    type: 'rule',
    target: 'clean',
    phony: true,
    command: (_outdent || _load_outdent()).default`
        rm $(ESY_EJECT__SANDBOX)/_build
        rm $(ESY_EJECT__SANDBOX)/_install
      `
  }, {
    type: 'define',
    name: `shell_env_sandbox`,
    value: [{
      CI: process.env.CI ? process.env.CI : null,
      TMPDIR: '$(TMPDIR)',
      ESY_EJECT__STORE: '$(ESY_EJECT__STORE)',
      ESY_EJECT__SANDBOX: '$(ESY_EJECT__SANDBOX)',
      ESY_EJECT__ROOT: '$(ESY_EJECT__ROOT)'
    }]
  },

  // Create store directory structure
  {
    type: 'rule',
    target: [`$(ESY_EJECT__STORE)/${(_buildConfig || _load_buildConfig()).STORE_BUILD_TREE}`, `$(ESY_EJECT__STORE)/${(_buildConfig || _load_buildConfig()).STORE_INSTALL_TREE}`, `$(ESY_EJECT__STORE)/${(_buildConfig || _load_buildConfig()).STORE_STAGE_TREE}`, `$(ESY_EJECT__SANDBOX)/node_modules/.cache/_esy/store/${(_buildConfig || _load_buildConfig()).STORE_BUILD_TREE}`, `$(ESY_EJECT__SANDBOX)/node_modules/.cache/_esy/store/${(_buildConfig || _load_buildConfig()).STORE_INSTALL_TREE}`, `$(ESY_EJECT__SANDBOX)/node_modules/.cache/_esy/store/${(_buildConfig || _load_buildConfig()).STORE_STAGE_TREE}`].join(' '),
    command: '@mkdir -p $(@)'
  }, {
    type: 'rule',
    target: 'esy-root',
    phony: true,
    dependencies: ['$(ESY_EJECT__ROOT)/bin/realpath', '$(ESY_EJECT__ROOT)/bin/fastreplacestring.exe']
  }, {
    type: 'rule',
    target: 'esy-store',
    phony: true,
    dependencies: [`$(ESY_EJECT__STORE)/${(_buildConfig || _load_buildConfig()).STORE_BUILD_TREE}`, `$(ESY_EJECT__STORE)/${(_buildConfig || _load_buildConfig()).STORE_INSTALL_TREE}`, `$(ESY_EJECT__STORE)/${(_buildConfig || _load_buildConfig()).STORE_STAGE_TREE}`, `$(ESY_EJECT__SANDBOX)/node_modules/.cache/_esy/store/${(_buildConfig || _load_buildConfig()).STORE_BUILD_TREE}`, `$(ESY_EJECT__SANDBOX)/node_modules/.cache/_esy/store/${(_buildConfig || _load_buildConfig()).STORE_INSTALL_TREE}`, `$(ESY_EJECT__SANDBOX)/node_modules/.cache/_esy/store/${(_buildConfig || _load_buildConfig()).STORE_STAGE_TREE}`, '$(ESY_EJECT__ROOT)/final-install-path-set.txt']
  }, {
    type: 'rule',
    target: '$(ESY_EJECT__ROOT)/bin/realpath',
    dependencies: ['$(ESY_EJECT__ROOT)/bin/realpath.c'],
    shell: '/bin/bash',
    command: '@gcc -o $(@) -x c $(<) 2> /dev/null'
  }, {
    type: 'rule',
    target: '$(ESY_EJECT__ROOT)/bin/fastreplacestring.exe',
    dependencies: ['$(ESY_EJECT__ROOT)/bin/fastreplacestring.cpp'],
    shell: '/bin/bash',
    command: '@g++ -Ofast -o $(@) $(<) 2> /dev/null'
  }, {
    type: 'rule',
    target: '$(ESY_EJECT__ROOT)/final-install-path-set.txt',
    dependencies: ['$(ESY_EJECT__ROOT)/final-install-path-set.txt.in', 'esy-root'],
    shell: '/bin/bash',
    command: '@$(shell_env_sandbox) $(ESY_EJECT__ROOT)/bin/render-env $(<) $(@)'
  }];

  function createBuildRuleName(build, target) {
    return `${build.id}.${target}`;
  }

  function createBuildRule(build, rule) {
    var command = [];
    if (rule.withBuildEnv) {
      command.push((_outdent || _load_outdent()).default`
        @$(shell_env_for__${(0, (_util || _load_util()).normalizePackageName)(build.id)}) source $(ESY_EJECT__ROOT)/bin/runtime.sh
        cd $esy_build__source_root
      `);
    }
    command.push(rule.command);
    return {
      type: 'rule',
      target: createBuildRuleName(build, rule.target),
      dependencies: ['esy-store', 'esy-root'].concat((0, (_toConsumableArray2 || _load_toConsumableArray()).default)(Array.from(build.dependencies.values()).map(function (dep) {
        return createBuildRuleName(dep, 'build');
      }))),
      phony: true,
      command
    };
  }

  function visitTask(task) {
    log(`visit ${task.spec.id}`);

    var packagePath = task.spec.sourcePath.split((_path || _load_path()).sep).filter(Boolean);
    var finalInstallPath = buildConfig.getFinalInstallPath(task.spec);
    finalInstallPathSet.push(finalInstallPath);

    function emitBuildFile(_ref) {
      var filename = _ref.filename,
          contents = _ref.contents;

      emitFile(outputPath, { filename: packagePath.concat(filename), contents });
    }

    // Emit env
    emitBuildFile({
      filename: 'eject-env',
      contents: (0, (_util2 || _load_util2()).renderEnv)(task.env)
    });

    // Generate macOS sandbox configuration (sandbox-exec command)
    emitBuildFile({
      filename: 'sandbox.sb.in',
      contents: (0, (_util2 || _load_util2()).renderSandboxSbConfig)(task.spec, buildConfig, {
        allowFileWrite: ['$TMPDIR', '$TMPDIR_GLOBAL']
      })
    });

    ruleSet.push({
      type: 'define',
      name: `shell_env_for__${(0, (_util || _load_util()).normalizePackageName)(task.spec.id)}`,
      value: [{
        CI: process.env.CI ? process.env.CI : null,
        TMPDIR: '$(TMPDIR)',
        ESY_EJECT__STORE: '$(ESY_EJECT__STORE)',
        ESY_EJECT__SANDBOX: '$(ESY_EJECT__SANDBOX)',
        ESY_EJECT__ROOT: '$(ESY_EJECT__ROOT)'
      }, `source $(ESY_EJECT__ROOT)/${packagePath.join('/')}/eject-env`, {
        esy_build__eject: `$(ESY_EJECT__ROOT)/${packagePath.join('/')}`,
        esy_build__type: task.spec.mutatesSourcePath ? 'in-source' : 'out-of-source',
        esy_build__source_type: task.spec.sourceType,
        esy_build__key: task.id,
        esy_build__command: renderBuildTaskCommand(task) || 'true',
        esy_build__source_root: (_path || _load_path()).join(buildConfig.sandboxPath, task.spec.sourcePath),
        esy_build__install: finalInstallPath
      }]
    });

    ruleSet.push(createBuildRule(task.spec, {
      target: 'build',
      command: 'esy-build',
      withBuildEnv: true
    }));
    ruleSet.push(createBuildRule(task.spec, {
      target: 'shell',
      command: 'esy-shell',
      withBuildEnv: true
    }));
    ruleSet.push(createBuildRule(task.spec, {
      target: 'clean',
      command: 'esy-clean'
    }));
  }

  // Emit build artefacts for packages
  log('process dependency graph');
  var rootTask = (_buildTask || _load_buildTask()).fromBuildSandbox(sandbox, buildConfig);
  (_graph || _load_graph()).traverse(rootTask, visitTask);

  // Emit command-env
  // TODO: we construct two task trees for build and for command-env, this is
  // wasteful, so let's think how we can do that in a single pass.
  var rootTaskForCommand = (_buildTask || _load_buildTask()).fromBuildSandbox(sandbox, buildConfig, {
    exposeOwnPath: true
  });
  rootTaskForCommand.env.delete('SHELL');
  emitFile(outputPath, {
    filename: ['command-env'],
    contents: (_outdent || _load_outdent()).default`
      # Set the default value for ESY_EJECT__STORE if it's not defined.
      if [ -z \${ESY_EJECT__STORE+x} ]; then
        export ESY_EJECT__STORE="$HOME/.esy/${(_buildConfig || _load_buildConfig()).ESY_STORE_VERSION}"
      fi

      ${(_environment || _load_environment()).printEnvironment(rootTaskForCommand.env)}
    `
  });

  // Now emit all build-wise artefacts
  log('build environment');

  emitFile(outputPath, {
    filename: ['bin/render-env'],
    executable: true,
    contents: (_outdent || _load_outdent()).default`
      #!/bin/bash

      set -e
      set -o pipefail

      _TMPDIR_GLOBAL=$($ESY_EJECT__ROOT/bin/realpath "/tmp")

      if [ -d "$TMPDIR" ]; then
        _TMPDIR=$($ESY_EJECT__ROOT/bin/realpath "$TMPDIR")
      else
        _TMPDIR="/does/not/exist"
      fi

      sed \\
        -e "s|\\$ESY_EJECT__STORE|$ESY_EJECT__STORE|g"          \\
        -e "s|\\$ESY_EJECT__SANDBOX|$ESY_EJECT__SANDBOX|g"      \\
        -e "s|\\$ESY_EJECT__ROOT|$ESY_EJECT__ROOT|g"      \\
        -e "s|\\$TMPDIR_GLOBAL|$_TMPDIR_GLOBAL|g"   \\
        -e "s|\\$TMPDIR|$_TMPDIR|g"                 \\
        $1 > $2
    `
  });

  emitFile(outputPath, {
    filename: ['bin', 'fastreplacestring.cpp'],
    contents: fastReplaceStringSrc
  });

  emitFile(outputPath, {
    filename: ['bin', 'realpath.c'],
    contents: (_outdent || _load_outdent()).default`
      #include<stdlib.h>

      main(int cc, char**vargs) {
        puts(realpath(vargs[1], 0));
        exit(0);
      }
    `
  });

  emitFile(outputPath, {
    filename: ['bin', 'runtime.sh'],
    contents: RUNTIME
  });

  emitFile(outputPath, {
    filename: ['Makefile'],
    contents: (_Makefile || _load_Makefile()).renderMakefile(ruleSet)
  });

  emitFile(outputPath, {
    filename: ['final-install-path-set.txt.in'],
    contents: finalInstallPathSet.join('\n') + '\n'
  });
}

function emitFile(outputPath, file) {
  var filename = (_path || _load_path()).join.apply(_path || _load_path(), [outputPath].concat((0, (_toConsumableArray2 || _load_toConsumableArray()).default)(file.filename)));
  log(`emit <ejectRootDir>/${file.filename.join('/')}`);
  (0, (_mkdirp || _load_mkdirp()).sync)((_path || _load_path()).dirname(filename));
  (_fs || _load_fs()).writeFileSync(filename, file.contents);
  if (file.executable) {
    // fs.constants only became supported in node 6.7 or so.
    var mode = (_fs || _load_fs()).constants && (_fs || _load_fs()).constants.S_IRWXU ? (_fs || _load_fs()).constants.S_IRWXU : 448;
    (_fs || _load_fs()).chmodSync(filename, mode);
  }
}

function renderBuildTaskCommand(task) {
  if (task.command == null) {
    return null;
  }
  var command = task.command.map(function (c) {
    return c.renderedCommand;
  }).join(' && ');
  command = command.replace(/"/g, '\\"');
  return command;
}