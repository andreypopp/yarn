/**
 * @flow
 */

export type EnvironmentVar = {
  name: string,
  value: string,
};
export type Environment = EnvironmentVar[];

export type EnvironmentVarExport = {
  val: string,
  scope?: string,
  exclusive?: boolean,
  __BUILT_IN_DO_NOT_USE_OR_YOU_WILL_BE_PIPd?: boolean,
};

/**
 * Describes build.
 */
export type BuildSpec = {
  /** Unique identifier */
  id: string,

  /** Build name */
  name: string,

  /** Build version */
  version: string,

  /** Command which is needed to execute build */
  command: ?(string[]),

  /** Environment exported by built. */
  exportedEnv: {[name: string]: EnvironmentVarExport},

  /**
   * Path tof the source tree relative to sandbox root.
   *
   * That's where sources are located but not necessary the location where the
   * build is executed as build process (or some other process) can relocate sources before the build.
   */
  sourcePath: string,

  /**
   * If build mutates its own sourcePath.
   *
   * Builder must handle that case somehow, probably by copying sourcePath into
   * some temp location and doing a build from there.
   */
  mutatesSourcePath: boolean,

  /**
   * If build should be persisted in store.
   *
   * Builds from released versions of packages should be persisted in store as
   * they don't change at all. On the other side builds from dev sources
   * shouldn't be persisted.
   */
  shouldBePersisted: boolean,

  /**
   * Set of dependencies which must be build/installed before this build can
   * happen
   */
  dependencies: BuildSpec[],

  /**
   * A list of errors found in build definitions.
   */
  errors: {message: string}[],
};

/**
 * Build configuration.
 */
export type BuildConfig = {
  /**
   * Path to the store used for a build.
   */
  storePath: string,

  /**
   * Path to a sandbox root.
   */
  sandboxPath: string,

  /**
   * Generate path where sources of the builds are located.
   */
  getSourcePath: (build: BuildSpec, ...segments: string[]) => string,

  /**
   * Generate path from where the build executes.
   */
  getRootPath: (build: BuildSpec, ...segments: string[]) => string,

  /**
   * Generate path where build artefacts should be placed.
   */
  getBuildPath: (build: BuildSpec, ...segments: string[]) => string,

  /**
   * Generate path where installation artefacts should be placed.
   */
  getInstallPath: (build: BuildSpec, ...segments: string[]) => string,

  /**
   * Generate path where finalized installation artefacts should be placed.
   *
   * Installation and final installation path are different because we want to
   * do atomic installs (possible by buiilding in one location and then mv'ing
   * to another, final location).
   */
  getFinalInstallPath: (build: BuildSpec, ...segments: string[]) => string,
};

/**
 * A build root together with a global env.
 *
 * Note that usually builds do not exist outside of build sandboxes as their own
 * identities a made dependent on a global env of the sandbox.
 */
export type BuildSandbox = {
  env: Environment,
  root: BuildSpec,
};

/**
 * Process which accepts build and a corresponding config and produces a build.
 */
export type Builder = (BuildSandbox, BuildConfig) => Promise<void>;

/**
 * BFS for build dep graph.
 */
export function traverse(build: BuildSpec, f: (BuildSpec) => void) {
  const seen = new Set();
  const queue = [build];
  while (queue.length > 0) {
    const cur = queue.shift();
    if (seen.has(cur.id)) {
      continue;
    }
    f(cur);
    seen.add(cur.id);
    queue.push(...cur.dependencies);
  }
}

export function traverseDeepFirst(build: BuildSpec, f: (BuildSpec) => void) {
  const seen = new Set();
  function traverse(build) {
    if (seen.has(build.id)) {
      return;
    }
    seen.add(build.id);
    for (const dep of build.dependencies) {
      traverse(dep);
    }
    f(build);
  }
  traverse(build);
}

/**
 * Collect all transitive dependendencies for a `build`.
 */
export function collectTransitiveDependencies(build: BuildSpec): BuildSpec[] {
  const dependencies = [];
  traverseDeepFirst(build, cur => {
    // Skip the root build
    if (cur !== build) {
      dependencies.push(cur);
    }
  });
  dependencies.reverse();
  return dependencies;
}

/**
 * Topological fold build dependency graph to a value `V`.
 *
 * The fold function is called with a list of values computed for dependencies
 * in topological order and a build itself.
 *
 * Note that value is computed only once per build (even if it happen to be
 * depended on if a few places) and then memoized.
 */
export function topologicalFold<V>(
  build: BuildSpec,
  f: (directDependencies: V[], allDependencies: V[], currentBuild: BuildSpec) => V,
): V {
  return topologicalFoldImpl(build, f, new Map(), value => value);
}

function topologicalFoldImpl<V>(
  build: BuildSpec,
  f: (V[], V[], BuildSpec) => V,
  memoized: Map<string, V>,
  onBuild: (V, BuildSpec) => *,
): V {
  const directDependencies = [];
  const allDependencies = [];
  const seen = new Set();
  const toVisit = new Set(build.dependencies.map(dep => dep.id));
  for (let i = 0; i < build.dependencies.length; i++) {
    const dep = build.dependencies[i];
    if (toVisit.delete(dep.id)) {
      let value = memoized.get(dep.id);
      if (value == null) {
        value = topologicalFoldImpl(dep, f, memoized, (value, dep) => {
          if (toVisit.delete(dep.id)) {
            directDependencies.push(value);
          }
          if (!seen.has(dep.id)) {
            allDependencies.push(value);
          }
          seen.add(dep.id);
          return onBuild(value, dep);
        });
        memoized.set(dep.id, value);
      }
      directDependencies.push(value);
    }
  }
  return onBuild(f(directDependencies, allDependencies, build), build);
}
