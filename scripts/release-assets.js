import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { profile } from '../content/site.js';

export const stylesheets = ['styles.css', 'layout-refinement.css', 'case-refinement.css'];
export const releaseAssets = [...stylesheets, 'script.js',
  'assets/vigo-portrait-400.webp', 'assets/vigo-portrait-640.webp',
  'assets/vigo-portrait-960.webp', 'assets/vigo-portrait-640.jpg', profile.pdf];

export async function assetHashes(directory) {
  const result = {};
  const files = new Set((await readdir(directory, {recursive:true})).map(file => file.split(path.sep).join('/')));
  for (const asset of releaseAssets) {
    if (!files.has(asset)) throw new Error(`Missing release asset with exact filename case: ${asset}`);
    const bytes = await readFile(path.join(directory, asset));
    if (!bytes.length) throw new Error(`Empty release asset: ${asset}`);
    result[asset] = createHash('sha256').update(bytes).digest('hex');
  }
  return result;
}
