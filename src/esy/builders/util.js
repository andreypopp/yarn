/**
 * @flow
 */

import type {BuildSpec, BuildConfig, BuildEnvironment} from '../types';

import * as child from 'child_process';
import outdent from 'outdent';
import {copy} from 'fs-extra';
import rimraf from 'rimraf';
import {promisify} from '../../util/promise';
import * as fs from '../../util/fs';
import * as Graph from '../graph';

export function renderFindlibConf(
  build: BuildSpec,
  config: BuildConfig,
  options: {currentlyBuilding: boolean},
): string {
  const allDependencies = Graph.collectTransitiveDependencies(build);
  const findLibDestination = options.currentlyBuilding
    ? config.getInstallPath(build, 'lib')
    : config.getFinalInstallPath(build, 'lib');
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

type ConfigSpec = {
  allowFileWrite?: Array<?string>,
  denyFileWrite?: Array<?string>,
};

export function renderSandboxSbConfig(
  spec: BuildSpec,
  config: BuildConfig,
  sandboxSpec?: ConfigSpec = {},
): string {
  const subpathList = pathList =>
    pathList ? pathList.filter(Boolean).map(path => `(subpath "${path}")`).join(' ') : '';

  // TODO: Right now the only thing this sandbox configuration does is it
  // disallows writing into locations other than $cur__root,
  // $cur__target_dir and $cur__install. We should implement proper out of
  // source builds and also disallow $cur__root.
  // TODO: Try to use (deny default) and pick a set of rules for builds to
  // proceed (it chokes on xcodebuild for now if we disable reading "/" and
  // networking).
  return outdent`
    (version 1.0)
    (allow default)

    (deny file-write*
      (subpath "/"))

    (allow file-write*
      (literal "/dev/null")

      ; $cur__target_dir
      (subpath "${config.getBuildPath(spec)}")

      ; $cur__install
      (subpath "${config.getInstallPath(spec)}")

      ; config.allowFileWrite
      ${subpathList(sandboxSpec.allowFileWrite)}
    )

  `;
}

export function renderEnv(env: BuildEnvironment): string {
  return Array.from(env.values())
    .map(env => `export ${env.name}="${env.value}";`)
    .join('\n');
}

export async function rewritePathInFile(
  filename: string,
  origPath: string,
  destPath: string,
) {
  const stat = await fs.stat(filename);
  if (!stat.isFile()) {
    return;
  }
  const content = await fs.readFileBuffer(filename);
  let offset = content.indexOf(origPath);
  const needRewrite = offset > -1;
  while (offset > -1) {
    content.write(destPath, offset);
    offset = content.indexOf(origPath);
  }
  if (needRewrite) {
    await fs.writeFile(filename, content);
  }
}

export function exec(
  ...args: *
): {process: child.ChildProcess, exit: Promise<{code: number, signal: string}>} {
  const process = child.exec(...args);
  const exit = new Promise(resolve => {
    process.on('exit', (code, signal) => resolve({code, signal}));
  });
  return {process, exit};
}

export const rmTree = promisify(rimraf);

const _copyTree = promisify(copy);

export async function copyTree(
  params: {from: string, to: string, exclude?: string[]},
): Promise<void> {
  await _copyTree(params.from, params.to, {
    filter: filename => !(params.exclude && params.exclude.includes(filename)),
  });
}
