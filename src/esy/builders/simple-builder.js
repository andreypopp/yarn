/**
 * @flow
 */

import createLogger from 'debug';
import outdent from 'outdent';
import * as path from 'path';
import rimraf from 'rimraf';
import {promisify} from '../../util/promise';
import * as fs from '../../util/fs';
import * as child from '../../util/child';
import * as Env from '../environment';
import * as BuildRepr from '../build-repr';
import {renderEnv} from './makefile-builder';

const INSTALL_DIRS = ['lib', 'bin', 'sbin', 'man', 'doc', 'share', 'stublibs', 'etc'];
const BUILD_DIRS = ['_esy'];

export const build: BuildRepr.Builder = async (sandbox, config) => {
  let buildInProgress = Promise.resolve();

  await initStore(config.storePath);
  await initStore(path.join(config.sandboxPath, '_esy', 'store'));

  // TODO: this shold be done in parallel
  BuildRepr.traverseDeepFirst(sandbox.root, build => {
    buildInProgress = buildInProgress.then(() => performBuild(build, config, sandbox));
  });
  await buildInProgress;
};

async function performBuild(
  build: BuildRepr.Build,
  config: BuildRepr.BuildConfig,
  sandbox: BuildRepr.BuildSandbox,
): Promise<void> {
  const rootPath = config.getRootPath(build);
  const buildPath = config.getBuildPath(build);

  const log = createLogger(`esy:simple-builder:${build.name}`);

  if (build.shouldBePersisted && (await fs.exists(config.getFinalInstallPath(build)))) {
    // that means build already cached in store
    return;
  }

  log('starting build');

  await Promise.all([
    rmtree(config.getFinalInstallPath(build)),
    rmtree(config.getInstallPath(build)),
    rmtree(config.getBuildPath(build)),
  ]);

  await Promise.all([
    ...BUILD_DIRS.map(p => fs.mkdirp(config.getBuildPath(build, p))),
    ...INSTALL_DIRS.map(p => fs.mkdirp(config.getInstallPath(build, p))),
  ]);

  if (build.mutatesSourcePath) {
    log('build mutates source directory, rsyncing sources to $cur__target_dir');
    await rsync({
      from: path.join(config.sandboxPath, build.sourcePath),
      to: config.getBuildPath(build),
    });
  }

  const env = Env.calculateEnvironment(config, build, sandbox.env);

  log('placing _esy/env');
  const envPath = path.join(buildPath, '_esy', 'env');
  await fs.writeFile(envPath, renderEnv(env), 'utf8');

  log('placing _esy/findlib.conf');
  await fs.writeFile(
    path.join(buildPath, '_esy', 'findlib.conf'),
    renderFindlibConf(build, config),
    'utf8',
  );

  if (build.command != null) {
    for (let i = 0; i < build.command.length; i++) {
      log(`executing: ${build.command[i]}`);
      // TODO: add sandboxing
      // TODO: use exec without shell so we can build without /bin/bash present.
      // That requires we do var expansion and not rely on shell.
      const command = outdent`
        source ${envPath};
        ${build.command[i]}
      `;
      await child.exec(command, {
        cwd: rootPath,
        env,
        shell: '/bin/bash',
        maxBuffer: Infinity,
      });
    }

    log('rewriting build artefacts');
    const files = await fs.walk(config.getInstallPath(build));
    const origPath = config.getInstallPath(build);
    const destPath = config.getFinalInstallPath(build);
    // TODO: this should be parallel but I feel like w/ unlimited concurrency it blows up on
    // some files for some reason
    let rewriteInProgress = Promise.resolve();
    files
      .map(file => {
        return async () => {
          log(`checking ${file.relative}`);
          if (!(await fs.stat(file.absolute)).isFile()) {
            return;
          }
          const content = await fs.readFileBuffer(file.absolute);
          const offset = content.indexOf(origPath);
          if (offset > -1) {
            log(`rewrite ${file.relative}`);
            content.write(destPath, offset);
            fs.writeFile(file.absolute, content);
          }
        };
      })
      .forEach(task => {
        rewriteInProgress = rewriteInProgress.then(() => task());
      });
  }

  log('finalizing build');
  await fs.rename(config.getInstallPath(build), config.getFinalInstallPath(build));

  return;
}

const rmtree = promisify(rimraf);

async function rsync(params: {from: string, to: string, exclude?: string[]}) {
  let from = params.from;
  if (from[from.length - 1] != '/') {
    from += '/';
  }
  const args = ['--archive', from, params.to];
  if (params.exclude) {
    params.exclude.forEach(pattern => {
      args.push('--exclude', pattern);
    });
  }
  await child.spawn('rsync', args);
}

async function initStore(storePath) {
  await Promise.all(
    ['_build', '_install', '_insttmp'].map(p => fs.mkdirp(path.join(storePath, p))),
  );
}

function renderFindlibConf(build: BuildRepr.Build, config: BuildRepr.BuildConfig) {
  const allDependencies = BuildRepr.collectTransitiveDependencies(build);
  const findLibDestination = config.getInstallPath(build, 'lib');
  // Note that some packages can query themselves via ocamlfind during its
  // own build, this is why we include `findLibDestination` in the path too.
  const findLibPath = allDependencies
    .map(dep => config.getFinalInstallPath(dep, 'lib'))
    .concat(findLibDestination)
    .join(':');
  return outdent`
    path = "${findLibPath}"
    destdir = "${findLibDestination}"
    ldconf = "ignore"
    ocamlc = "ocamlc.opt"
    ocamldep = "ocamldep.opt"
    ocamldoc = "ocamldoc.opt"
    ocamllex = "ocamllex.opt"
    ocamlopt = "ocamlopt.opt"
  `;
}
