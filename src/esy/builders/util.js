/**
 * @flow
 */

import type {BuildSpec, BuildConfig, BuildEnvironment} from '../types';

import outdent from 'outdent';
import * as Graph from '../graph';

export function renderFindlibConf(build: BuildSpec, config: BuildConfig): string {
  const allDependencies = Graph.collectTransitiveDependencies(build);
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

export function renderEnv(env: BuildEnvironment): string {
  return Array.from(env.values())
    .map(env => `export ${env.name}="${env.value}";`)
    .join('\n');
}
