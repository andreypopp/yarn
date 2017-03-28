/**
 * @flow
 */

import * as path from 'path';
import * as BuildRepr from './build-repr';

export function createConfig(
  params: {
    storePath: string,
    sandboxPath: string,
  },
): BuildRepr.BuildConfig {
  const {storePath, sandboxPath} = params;
  const sandboxLocalStorePath = path.join(
    sandboxPath,
    'node_modules',
    '.cache',
    '_esy',
    'store',
  );
  const genPath = (build: BuildRepr.Build, tree: string, segments: string[]) => {
    if (build.shouldBePersisted) {
      return path.join(storePath, tree, build.id, ...segments);
    } else {
      return path.join(sandboxLocalStorePath, tree, build.id, ...segments);
    }
  };

  const buildConfig: BuildRepr.BuildConfig = {
    storePath,
    sandboxPath,
    getSourcePath: (build: BuildRepr.Build, ...segments) => {
      return path.join(buildConfig.sandboxPath, build.sourcePath, ...segments);
    },
    getRootPath: (build: BuildRepr.Build, ...segments) => {
      if (build.mutatesSourcePath) {
        return genPath(build, '_build', segments);
      } else {
        return path.join(buildConfig.sandboxPath, build.sourcePath, ...segments);
      }
    },
    getBuildPath: (build: BuildRepr.Build, ...segments) =>
      genPath(build, '_build', segments),
    getInstallPath: (build: BuildRepr.Build, ...segments) =>
      genPath(build, '_insttmp', segments),
    getFinalInstallPath: (build: BuildRepr.Build, ...segments) =>
      genPath(build, '_install', segments),
  };
  return buildConfig;
}
