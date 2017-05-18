/* @flow */

const path = require('path');

import type {Manifest} from '../../types.js';
import type Config from '../../config';
import type PackageRequest from '../../package-request.js';
import ExoticResolver from './exotic-resolver.js';
import * as fs from '../../util/fs.js';
import * as child from '../../util/child.js';

const REMOTE_OPAM_REPOSITORY = 'https://github.com/ocaml/opam-repository.git';

export type OpamManifestCollection = {
  versions: {
    [name: string]: OpamManifest,
  },
};

type File = {
  name: string,
  content: string,
};

export type OpamManifest = Manifest & {
  opam: {
    // URL for tarball with sources
    url: string,
    // Optional set of files which should be added to sources
    files?: Array<File>,
    // Optional md5 checksum
    checksum?: string,
    // Optional patch which should be applied on top of sources
    patch?: string,
  },
};

const OPAM_SCOPE = 'opam-alpha';

export default class OpamResolver extends ExoticResolver {
  constructor(request: PackageRequest, fragment: string) {
    super(request, fragment);

    const {name, version} = parseOpamResolution(fragment);
    this.name = name;
    this.version = version;
  }

  name: string;
  version: string;

  static isVersion(pattern: string): boolean {
    if (pattern.startsWith(`@${OPAM_SCOPE}`)) {
      return true;
    }

    return false;
  }

  static getPatternVersion(pattern: string, pkg: Manifest): string {
    return pkg.version;
  }

  async resolve(): Promise<Manifest> {
    const shrunk = this.request.getLocked('opam');
    if (shrunk) {
      return shrunk;
    }

    const repo = await getCurrentRepository(this.config);
    const manifest = await getPackageManifest(this.config, repo, this.name, this.version);
    const reference = `${manifest.name}@${manifest.version}`;

    manifest._remote = {
      type: 'opam',
      registry: 'npm',
      hash: manifest.opam.checksum,
      reference,
      resolved: reference,
    };

    return manifest;
  }
}

export function parseOpamResolution(fragment: string): {name: string, version: string} {
  fragment = fragment.slice(`@${OPAM_SCOPE}/`.length);
  const [name, version = '*'] = fragment.split('@');
  return {
    name,
    version,
  };
}

type OpamRepository = {
  id: string,
  // Path to original opam repo
  sourcePath: string,
  // Path to opam repo with converted to esy format packages
  outputPath: string,
};

/**
 * Get package metadata by package name.
 */
async function getPackageCollection(repo: OpamRepository, name: string) {
  const packageFilename = path.join(repo.outputPath, `${name}.json`);
  if (await fs.exists(packageFilename)) {
    return JSON.parse(await fs.readFile(packageFilename));
  }

  const packageCollection = await convertPackage(repo, name);
  await fs.mkdirp(path.dirname(packageFilename));
  await fs.writeJson(packageFilename, packageCollection);
  return packageCollection;
}

const CONVERTER = require.resolve(
  '../../../opam-packages-conversion/bin/convert-package.py',
);

async function convertPackage(repo: OpamRepository, name: string) {
  const sourcePath = path.join(repo.sourcePath, 'packages', name);

  // Convert each found version

  const versions = await fs.readdir(sourcePath);
  const conversions = [];
  for (const line of versions) {
    const [name, ...versionParts] = line.split('.');
    const version = versionParts.join('.');
    conversions.push(
      child
        .spawn('python', [CONVERTER, name, version, path.join(sourcePath, line)], {
          cwd: path.dirname(CONVERTER),
        })
        // suppress conversion error
        // TODO: make sure we log it somewhere
        .then(undefined, _err => null),
    );
  }

  // Parse output and construct package collection

  const manifest = {versions: {}};
  const packages = await Promise.all(conversions);
  for (const p of packages) {
    if (p == null) {
      continue;
    }
    const meta = JSON.parse(p);
    manifest.versions[meta.version] = meta;
  }

  return manifest;
}

/**
 * Update opam repository and return a cache key.
 */
export function getCurrentRepository(config: Config): Promise<OpamRepository> {
  if (getCurrentRepositoryCached == null) {
    getCurrentRepositoryCached = getCurrentRepositoryImpl(config);
  }
  return getCurrentRepositoryCached;
}

let getCurrentRepositoryCached: ?Promise<OpamRepository> = null;

async function getCurrentRepositoryImpl(config: Config): Promise<OpamRepository> {
  const sourcePath = path.join(config.cacheFolder, 'opam-repository');
  // check if we need "git clone"
  if (!await fs.exists(sourcePath)) {
    await child.spawn('git', ['clone', REMOTE_OPAM_REPOSITORY, sourcePath]);
    const id = await gitReadMaster(sourcePath);
    const outputPath = path.join(config.cacheFolder, 'opam-repository-output', id);
    return {id, sourcePath, outputPath};
  }
  // check if we need "git pull"
  const localCommit = await gitReadMaster(sourcePath);
  const remoteCommit = await gitReadMaster(REMOTE_OPAM_REPOSITORY);
  if (localCommit !== remoteCommit) {
    await child.spawn('git', ['pull', REMOTE_OPAM_REPOSITORY, 'master'], {
      cwd: sourcePath,
    });
  }
  const outputPath = path.join(
    config.cacheFolder,
    'opam-repository-output',
    remoteCommit,
  );
  return {id: remoteCommit, sourcePath, outputPath};
}

export async function getPackageManifest(
  config: Config,
  repo: OpamRepository,
  name: string,
  versionRange: string,
): Promise<OpamManifest> {
  const packageCollection = await getPackageCollection(repo, name);
  const versions = Object.keys(packageCollection.versions);
  if (versionRange == null || versionRange === 'latest') {
    versionRange = '*';
  }
  const version = await config.resolveConstraints(versions, versionRange);
  if (version == null) {
    throw new Error(`No compatible version found: ${name}@${versionRange}`);
  }
  const packageJson = packageCollection.versions[version];
  packageJson._uid = packageJson.opam.checksum || packageJson.version;
  return packageJson;
}

async function gitReadMaster(repo: string) {
  const data = await child.spawn('git', ['ls-remote', repo, '-r', 'heads/master']);
  const [commitId] = data.split('\t');
  return commitId.trim();
}
