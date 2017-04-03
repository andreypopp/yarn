/**
 * @flow
 */

import * as path from 'path';
import * as fs from 'fs';
import os from 'os';
import pathIsInside from 'path-is-inside';
import outdent from 'outdent';
import {substituteVariables} from 'var-expansion';

import type {BuildSpec, BuildConfig} from './build-repr';
import {normalizePackageName, mergeIntoMap} from './util';
import * as BuildRepr from './build-repr';

export type EnvironmentVar = {
  name: string,
  value: ?string,
  automaticDefault?: boolean,
};

export type EnvironmentGroup = {
  packageName: string,
  packageVersion: string,
  packageJsonPath: string,
  envVars: Array<EnvironmentVar>,
  errors: Array<string>,
};

export type Environment = Array<EnvironmentGroup>;

type EnvironmentConfigState = {
  seenVars: {
    [name: string]: {
      packageJsonPath: string,
      config: BuildRepr.EnvironmentVarExport,
    },
  },
  errors: Array<string>,
  normalizedEnvVars: Array<EnvironmentVar>,
};

// X platform newline
const EOL = os.EOL;

let globalGroups = [];
let globalSeenVars = {};

/**
 * Ejects a path for the sake of printing to a shell script/Makefile to be
 * executed on a different host. We therefore print it relative to an abstract
 * and not-yet-assigned $ESY__SANDBOX.
 *
 * This is the use case:
 *
 * 0. Run npm install.
 * 1. Don't build.
 * 3. Generate shell script/makefile.
 * 4. tar the entire directory with the --dereference flag.
 * 5. scp it to a host where node isn't even installed.
 * 6. untar it with the -h flag.
 *
 * All internal symlinks will be preserved. I *believe* --dereference will copy
 * contents if symlink points out of the root location (I hope).
 *
 * So our goal is to ensure that the locations we record point to the realpath
 * if a location is actually a symlink to somewhere in the sandbox, but encode
 * the path (including symlinks) if it points outside the sandbox.  I believe
 * that will work with tar --dereference.
 */
function relativeToSandbox(realFromPath, toPath) {
  /**
   * This sucks. If there's a symlink pointing outside of the sandbox, the
   * script can't include those, so it gives it from perspective of symlink.
   * This will work with tar, but there could be issues if multiple symlink
   * links all point to the same location, but appear to be different.  We
   * should execute a warning here instead. This problem is far from solved.
   * What would tar even do in that situation if it's following symlinks
   * outside of the tar directory? Would it copy it multiple times or copy it
   * once somehow?
   */
  const realToPath = fs.realpathSync(toPath);
  const toPathToUse = pathIsInside(realFromPath, realToPath) ? realToPath : toPath;
  const ret = path.relative(realFromPath, toPathToUse);
  return ret == '0' ? '$esy__sandbox' : `$esy__sandbox/${ret}`;
}

function getScopes(config) {
  if (!config.scope) {
    return {};
  }
  const scopes = (config.scope || '').split('|');
  const scopeObj = {};
  for (let i = 0; i < scopes.length; i++) {
    scopeObj[scopes[i]] = true;
  }
  return scopeObj;
}

/**
 * Validates env vars that were configured in package.json as opposed to
 * automatically created.
 */
function validatePackageJsonExportedEnvVar(
  build: BuildSpec,
  envVar,
  config,
): Array<string> {
  const envVarConfigPrefix = normalizePackageName(build.name);
  const beginsWithPackagePrefix = envVar.indexOf(envVarConfigPrefix) === 0;
  const ret = [];
  if (config.scopes !== undefined) {
    ret.push(
      outdent`
        ${envVar} has a field 'scopes' (plural). You probably meant 'scope'.
        The owner of ${build.name} likely made a mistake.
      `,
    );
  }
  const scopeObj = getScopes(config);
  if (!scopeObj.global) {
    if (!beginsWithPackagePrefix) {
      if (envVar.toUpperCase().indexOf(envVarConfigPrefix) === 0) {
        /* eslint-disable max-len */
        ret.push(
          outdent`
            It looks like ${envVar} is trying to be configured as a package scoped variable, but it has the wrong capitalization. It should begin with ${envVarConfigPrefix}.  The owner of ${build.name} likely made a mistake.
          `,
        );
        /* eslint-enable max-len */
      } else {
        /* eslint-disable max-len */
        ret.push(
          outdent`
            Environment variable ${envVar}  doesn't begin with ${envVarConfigPrefix} but it is not marked as 'global'. You should either prefix variables with ${envVarConfigPrefix} or make them global.
            The author of ${build.name} likely made a mistake
          `,
        );
        /* eslint-enable max-len */
      }
    }
  } else {
    // Else, it's global, but better not be trying to step on another package!
    if (!beginsWithPackagePrefix && envVar.indexOf('__') !== -1) {
      /* eslint-disable max-len */
      ret.push(
        outdent`
          ${envVar} looks like it's trying to step on another package because it has a double underscore - which is how we express namespaced env vars. The package owner for ${build.name} likely made a mistake
        `,
      );
      /* eslint-enable max-len */
    }
  }
  return ret;
}

function builtInsPerPackage(
  config: BuildConfig,
  build: BuildSpec,
  currentlyBuilding: boolean,
) {
  const prefix = currentlyBuilding ? 'cur' : normalizePackageName(build.name);
  function builtIn(val) {
    return {
      __BUILT_IN_DO_NOT_USE_OR_YOU_WILL_BE_PIPd: true,
      global: false,
      exclusive: true,
      val,
    };
  }
  return {
    [`${prefix}__name`]: builtIn(build.name),
    [`${prefix}__version`]: builtIn(build.version || null),
    [`${prefix}__root`]: builtIn(
      currentlyBuilding && build.mutatesSourcePath
        ? config.getBuildPath(build)
        : config.getRootPath(build),
    ),
    [`${prefix}__depends`]: builtIn(build.dependencies.map(dep => dep.name).join(' ')),
    [`${prefix}__target_dir`]: builtIn(config.getBuildPath(build)),
    [`${prefix}__install`]: builtIn(
      currentlyBuilding
        ? config.getInstallPath(build)
        : config.getFinalInstallPath(build),
    ),
    [`${prefix}__bin`]: builtIn(`$${prefix}__install/bin`),
    [`${prefix}__sbin`]: builtIn(`$${prefix}__install/sbin`),
    [`${prefix}__lib`]: builtIn(`$${prefix}__install/lib`),
    [`${prefix}__man`]: builtIn(`$${prefix}__install/man`),
    [`${prefix}__doc`]: builtIn(`$${prefix}__install/doc`),
    [`${prefix}__stublibs`]: builtIn(`$${prefix}__install/stublibs`),
    [`${prefix}__toplevel`]: builtIn(`$${prefix}__install/toplevel`),
    [`${prefix}__share`]: builtIn(`$${prefix}__install/share`),
    [`${prefix}__etc`]: builtIn(`$${prefix}__install/etc`),
  };
}

function addEnvConfigForPackage(
  {seenVars, errors, normalizedEnvVars}: EnvironmentConfigState,
  realPathSandboxRootOnEjectingHost,
  packageName,
  packageJsonFilePath,
  exportedEnv,
) {
  const nextSeenVars = {};
  const nextErrors = [];
  const nextNormalizedEnvVars = [];
  for (const envVar in exportedEnv) {
    const config = exportedEnv[envVar];
    nextNormalizedEnvVars.push({
      name: envVar,
      value: config.val,
      automaticDefault: !!config.__BUILT_IN_DO_NOT_USE_OR_YOU_WILL_BE_PIPd,
    });
    // The seenVars will only cover the cases when another package declares the
    // variable, not when it's loaded from your bashrc etc.
    if (seenVars[envVar] && seenVars[envVar].config.exclusive) {
      nextErrors.push(
        (seenVars[envVar].config.__BUILT_IN_DO_NOT_USE_OR_YOU_WILL_BE_PIPd
          ? 'Built-in variable '
          : '') +
          envVar +
          ' has already been set by ' +
          relativeToSandbox(
            realPathSandboxRootOnEjectingHost,
            seenVars[envVar].packageJsonPath,
          ) +
          ' ' +
          'which configured it with exclusive:true. That means it wants to be the only one to set it. Yet ' +
          packageName +
          ' is trying to override it.',
      );
    }
    if (seenVars[envVar] && config.exclusive) {
      nextErrors.push(
        envVar +
          ' has already been set by ' +
          relativeToSandbox(
            realPathSandboxRootOnEjectingHost,
            seenVars[envVar].packageJsonPath,
          ) +
          ' ' +
          'and ' +
          packageName +
          ' has configured it with exclusive:true. ' +
          'Sometimes you can reduce the likehood of conflicts by marking some packages as buildTimeOnlyDependencies.',
      );
    }
    nextSeenVars[envVar] = {
      packageJsonPath: packageJsonFilePath || 'unknownPackage',
      config,
    };
  }
  return {
    errors: errors.concat(nextErrors),
    seenVars: {...seenVars, ...nextSeenVars},
    normalizedEnvVars: normalizedEnvVars.concat(nextNormalizedEnvVars),
  };
}

function computeEnvVarsForPackage(config: BuildConfig, build: BuildSpec) {
  const errors = [];
  const autoExportedEnvVarsForPackage = builtInsPerPackage(config, build, false);

  const envConfig = addEnvConfigForPackage(
    {seenVars: globalSeenVars, errors, normalizedEnvVars: []},
    config.sandboxPath,
    build.name,
    build.sourcePath,
    autoExportedEnvVarsForPackage,
  );

  let {errors: nextErrors} = envConfig;
  const {seenVars, normalizedEnvVars} = envConfig;

  for (const envVar in build.exportedEnv) {
    nextErrors = nextErrors.concat(
      validatePackageJsonExportedEnvVar(build, envVar, build.exportedEnv[envVar]),
    );
  }

  const {
    seenVars: nextSeenVars,
    errors: nextNextErrors,
    normalizedEnvVars: nextNormalizedEnvVars,
  } = addEnvConfigForPackage(
    {seenVars, errors: nextErrors, normalizedEnvVars},
    config.sandboxPath,
    build.name,
    path.join(build.sourcePath, 'package.json'),
    build.exportedEnv,
  );

  /**
   * Update the global. Yes, we tried to be as functional as possible aside
   * from this.
   */
  globalSeenVars = nextSeenVars;
  globalGroups.push({
    packageName: build.name,
    packageVersion: build.version,
    root: relativeToSandbox(config.sandboxPath, build.sourcePath),
    packageJsonPath: relativeToSandbox(
      config.sandboxPath,
      path.join(build.sourcePath, 'package.json'),
    ),
    envVars: nextNormalizedEnvVars,
    errors: nextNextErrors,
  });
}

/**
 * For a given package name within the package database, compute the environment
 * variable setup in terms of a hypothetical root.
 */
export function calculateEnvironment(
  config: BuildConfig,
  build: BuildSpec,
  globalEnv: BuildRepr.Environment,
): Environment {
  /**
   * The root package.json path on the "ejecting host" - that is, the host where
   * the universal build script is being computed. Everything else should be
   * relative to this.
   */
  const curRootPackageJsonOnEjectingHost = config.sandboxPath;
  globalSeenVars = {};

  function setUpBuiltinVariables(envConfigState: EnvironmentConfigState) {
    let sandboxExportedEnvVars: {
      [name: string]: BuildRepr.EnvironmentVarExport,
    } = {
      esy__sandbox: {
        val: config.sandboxPath,
        exclusive: true,
        __BUILT_IN_DO_NOT_USE_OR_YOU_WILL_BE_PIPd: true,
      },
      esy__store: {
        val: config.storePath,
        exclusive: true,
        __BUILT_IN_DO_NOT_USE_OR_YOU_WILL_BE_PIPd: true,
      },
      esy__install_tree: {
        val: '$esy__sandbox/_install',
        exclusive: true,
        __BUILT_IN_DO_NOT_USE_OR_YOU_WILL_BE_PIPd: true,
      },
      esy__build_tree: {
        val: '$esy__sandbox/_build',
        exclusive: true,
        __BUILT_IN_DO_NOT_USE_OR_YOU_WILL_BE_PIPd: true,
      },
      ...builtInsPerPackage(config, build, true),
      OCAMLFIND_CONF: {
        val: '$cur__target_dir/_esy/findlib.conf',
        exclusive: false,
      },
    };

    const dependencies = BuildRepr.collectTransitiveDependencies(build);
    if (dependencies.length > 0) {
      const depPath = dependencies
        .map(dep => config.getFinalInstallPath(dep, 'bin'))
        .join(':');
      const depManPath = dependencies
        .map(dep => config.getFinalInstallPath(dep, 'man'))
        .join(':');
      sandboxExportedEnvVars = Object.assign(sandboxExportedEnvVars, {
        PATH: {
          val: `${depPath}:$PATH`,
          exclusive: false,
        },
        MAN_PATH: {
          val: `${depManPath}:$MAN_PATH`,
          exclusive: false,
        },
      });
    }

    const exportGlobalEnv = {};
    for (let i = 0; i < globalEnv.length; i++) {
      const v = globalEnv[i];
      exportGlobalEnv[v.name] = {
        val: v.value,
        exclusive: false,
        __BUILT_IN_DO_NOT_USE_OR_YOU_WILL_BE_PIPd: false,
      };
    }

    envConfigState = addEnvConfigForPackage(
      envConfigState,
      config.sandboxPath,
      'EsySandBox',
      curRootPackageJsonOnEjectingHost,
      exportGlobalEnv,
    );
    envConfigState = addEnvConfigForPackage(
      envConfigState,
      config.sandboxPath,
      'EsySandBox',
      curRootPackageJsonOnEjectingHost,
      sandboxExportedEnvVars,
    );
    envConfigState = addEnvConfigForPackage(
      envConfigState,
      config.sandboxPath,
      'EsySandBox',
      curRootPackageJsonOnEjectingHost,
      {},
    );

    return envConfigState;
  }

  try {
    const {
      seenVars,
      errors,
      normalizedEnvVars,
    } = setUpBuiltinVariables({
      seenVars: globalSeenVars,
      errors: [],
      normalizedEnvVars: [],
    });

    /**
     * Update the global. Sadly, haven't thread it through the
     * traversePackageTree.
     */
    globalSeenVars = seenVars;
    globalGroups = [
      {
        packageName: '',
        packageVersion: '',
        packageJsonPath: '',
        envVars: normalizedEnvVars,
        errors,
      },
    ];
    BuildRepr.traverse(build, computeEnvVarsForPackage.bind(null, config));
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('Fail to find package.json!: ' + err.message);
    } else {
      throw err;
    }
  }

  const ret = globalGroups;

  globalGroups = [];
  globalSeenVars = {};

  return ret;
}

export function printEnvironment(env: Env) {
  const groupsByBuild = new Map();

  for (const item of env.values()) {
    const key = item.build != null ? item.build.id : 'Esy Sandbox';
    const header = item.build != null
      ? `${item.build.name}@${item.build.version} ${item.build.sourcePath}`
      : 'Esy Sandbox';
    let group = groupsByBuild.get(key);
    if (group == null) {
      group = {header, env: []};
      groupsByBuild.set(key, group);
    }
    group.env.push(item);
  }

  return Array.from(groupsByBuild.values())
    .map(group => {
      const headerLines = [`# ${group.header}`];
      // TODO: add error rendering here
      // const errorLines = group.errors.map(err => {
      //   return '# [ERROR] ' + err;
      // });
      const envVarLines = group.env.map(item => {
        // TODO: escape " in values
        const exportLine = `export ${item.name}="${item.value}"`;
        return exportLine;
      });
      return headerLines.concat(envVarLines).join(EOL);
    })
    .join(EOL);
}

export type ScopeItem = {
  name: string,
  value: string,
  exported: boolean,
  builtIn: boolean,
  exclusive: boolean,
  build?: BuildSpec,
};

export type Scope = Map<string, ScopeItem>;
export type Env = Scope;
export type BuildEnv = {env: Env, scope: Scope};

export function calculate(
  config: BuildConfig,
  rootBuild: BuildSpec,
  initialEnv?: Array<{name: string, value: string}> = [],
): BuildEnv {
  function builtInEntry(
    {
      name,
      value,
      build,
      exclusive = true,
      exported = false,
    }: {
      name: string,
      value: string,
      build?: BuildSpec,
      exclusive?: boolean,
      exported?: boolean,
    },
  ) {
    return [name, {name, value, build, builtIn: true, exclusive, exported}];
  }
  function builtInEntries(...values) {
    return new Map(values.map(builtInEntry));
  }
  function getBuiltInScope(build: BuildSpec, currentlyBuilding?: boolean): Env {
    const prefix = currentlyBuilding ? 'cur' : normalizePackageName(build.name);
    const getInstallPath = currentlyBuilding
      ? config.getInstallPath
      : config.getFinalInstallPath;
    return builtInEntries(
      {
        name: `${prefix}__name`,
        value: build.name,
        build,
      },
      {
        name: `${prefix}__version`,
        value: build.version,
        build,
      },
      {
        name: `${prefix}__root`,
        value: currentlyBuilding && build.mutatesSourcePath
          ? config.getBuildPath(build)
          : config.getRootPath(build),
        build,
      },
      {
        name: `${prefix}__depends`,
        value: build.dependencies.map(dep => dep.name).join(' '),
        build,
      },
      {
        name: `${prefix}__target_dir`,
        value: config.getBuildPath(build),
        build,
      },
      {
        name: `${prefix}__install`,
        value: getInstallPath(build),
        build,
      },
      {
        name: `${prefix}__bin`,
        value: getInstallPath(build, 'bin'),
        build,
      },
      {
        name: `${prefix}__sbin`,
        value: getInstallPath(build, 'sbin'),
        build,
      },
      {
        name: `${prefix}__lib`,
        value: getInstallPath(build, 'lib'),
        build,
      },
      {
        name: `${prefix}__man`,
        value: getInstallPath(build, 'man'),
        build,
      },
      {
        name: `${prefix}__doc`,
        value: getInstallPath(build, 'doc'),
        build,
      },
      {
        name: `${prefix}__stublibs`,
        value: getInstallPath(build, 'stublibs'),
        build,
      },
      {
        name: `${prefix}__toplevel`,
        value: getInstallPath(build, 'toplevel'),
        build,
      },
      {
        name: `${prefix}__share`,
        value: getInstallPath(build, 'share'),
        build,
      },
      {
        name: `${prefix}__etc`,
        value: getInstallPath(build, 'etc'),
        build,
      },
    );
  }

  function getEvalScope(build, directDependencies): Env {
    const evalScope: Env = new Map();
    for (const dep of directDependencies) {
      mergeIntoMap(evalScope, getBuiltInScope(dep.build));
      mergeIntoMap(evalScope, dep.localScope);
    }
    mergeIntoMap(evalScope, getBuiltInScope(build));
    return evalScope;
  }

  const res = BuildRepr.topologicalFold(
    rootBuild,
    (directDependencies, allDependencies, build) => {
      // scope which is used to eval exported variables
      const evalScope: Env = getEvalScope(build, directDependencies);
      // global env vars exported from a build
      const globalScope: Env = new Map();
      // local env vars exported from a build
      const localScope: Env = new Map();
      for (const name in build.exportedEnv) {
        const envConfig = build.exportedEnv[name];
        const value = renderWithScope(envConfig.val, evalScope).rendered;
        const item = {
          name,
          value,
          build,
          builtIn: false,
          exported: true,
          exclusive: Boolean(envConfig.exclusive),
        };
        if (envConfig.scope === 'global') {
          globalScope.set(name, item);
        } else {
          localScope.set(name, item);
        }
      }
      return {
        localScope,
        globalScope,

        build,
        directDependencies,
        allDependencies,
      };
    },
  );

  function evalIntoEnv<V: {name: string, value: string}>(
    scope: Env,
    items: Array<V> | $Iterator<V, *, *>,
  ) {
    const update = new Map();
    for (const item of items) {
      const nextItem = {
        exported: true,
        exclusive: false,
        builtIn: false,
        ...item,
        value: renderWithScope(item.value, scope).rendered,
      };
      update.set(item.name, nextItem);
    }
    mergeIntoMap(scope, update);
  }

  function mergeScopes(scopes): Env {
    return scopes.reduce(
      (scope, currentScope) => {
        evalIntoEnv(scope, currentScope.values());
        return scope;
      },
      new Map(),
    );
  }

  const env = new Map();

  evalIntoEnv(env, initialEnv);

  evalIntoEnv(env, [
    {
      name: 'OCAMLFIND_CONF',
      value: config.getBuildPath(rootBuild, '_esy', 'findlib.conf'),
      exported: true,
    },
    {
      name: 'PATH',
      value: res.allDependencies
        .map(dep => config.getFinalInstallPath(dep.build, 'bin'))
        .concat('$PATH')
        .join(':'),
      exported: true,
    },
    {
      name: 'MAN_PATH',
      value: res.allDependencies
        .map(dep => config.getFinalInstallPath(dep.build, 'man'))
        .concat('$MAN_PATH')
        .join(':'),
      exported: true,
    },
  ]);

  // $cur__name, $cur__version and so on...
  mergeIntoMap(env, getBuiltInScope(rootBuild, true));

  // direct deps' local scopes
  for (const dep of res.directDependencies) {
    mergeIntoMap(env, dep.localScope);
  }
  // build's own local scope
  mergeIntoMap(env, res.localScope);
  // all deps' global scopes merged
  mergeIntoMap(
    env,
    mergeScopes(res.allDependencies.map(dep => dep.globalScope).concat(res.globalScope)),
  );

  const scope: Scope = new Map();
  mergeIntoMap(scope, getEvalScope(rootBuild, res.directDependencies));
  mergeIntoMap(scope, env);

  return {env, scope};
}

const FIND_VAR_RE = /\$([a-zA-Z0-9_]+)/g;

export function renderWithScope<T: {value: string}>(
  value: string,
  scope: Map<string, T>,
): {rendered: string} {
  const rendered = value.replace(FIND_VAR_RE, (_, name) => {
    const value = scope.get(name);
    if (value == null) {
      return `\$${name}`;
    } else {
      return value.value;
    }
  });
  return {rendered};
}

export function expandWithScope<T: {value: string}>(
  value: string,
  scope: Map<string, T>,
): {rendered: string} {
  const {value: rendered} = substituteVariables(value, {
    env: name => {
      const item = scope.get(name);
      return item != null ? item.value : undefined;
    },
  });
  return {rendered: rendered != null ? rendered : value};
}
