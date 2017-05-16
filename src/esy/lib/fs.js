/**
 * @flow
 */

import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from '../../util/fs';
import walkDir from 'walkdir';

export async function calculateMtimeChecksum(
  dirname: string,
  options?: {ignore?: (string) => boolean} = {},
): Promise<string> {
  const ignore = options.ignore ? options.ignore : filename => false;
  const mtimes = new Map();

  return new Promise((resolve, reject) => {
    const w = walkDir(dirname);
    w.on('path', (name, stat) => {
      if (ignore(name)) {
        w.ignore(name);
      }
      if (stat.isFile()) {
        mtimes.set(name, String(stat.mtime.getTime()));
      }
    });
    w.on('end', () => {
      const filenames = Array.from(mtimes.keys());
      filenames.sort();
      const hasher = crypto.createHash('sha1');
      for (const filename of filenames) {
        hasher.update(mtimes.get(filename) || '');
      }
      resolve(hasher.digest('hex'));
    });
  });
}
