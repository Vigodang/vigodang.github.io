import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { profile } from '../content/site.js';

export const stylesheets = ['styles.css', 'layout-refinement.css', 'case-refinement.css', 'portfolio-brand.css', 'portfolio-pages.css'];
export const gameStylesheets = ['styles.css', 'briefing.css', 'missions.css', 'evidence.css', 'after-dark.css'];
const gameModules = ['game.js', 'after-dark-game.js', 'after-dark-world.js', 'audio-content.js', 'audio-engine.js',
  'briefing.js', 'content.js', 'evidence.js', 'icons.js', 'mission-ui.js', 'missions.js', 'physics.js', 'presentation.js', 'world-art.js'];
export const releaseAssets = [...stylesheets, 'script.js',
  'assets/vigo-portrait-400.webp', 'assets/vigo-portrait-640.webp',
  'assets/vigo-portrait-960.webp', 'assets/vigo-portrait-640.jpg', 'assets/crdc-research-demo.jpg', profile.pdf,
  'assets/resume-truong-lieu-dong-vigo-dang.pdf', 'assets/fonts/InterVariable.woff2', 'assets/fonts/Inter-OFL.txt',
  ...gameStylesheets.map(file => 'play/' + file), ...gameModules.map(file => 'play/' + file),
  'play/assets/favicon.svg', 'play/assets/vigo-portrait.webp',
  'play/assets/after-dark/city-panorama.webp', 'play/assets/after-dark/district-atlas.webp'];

async function staticFiles(directory, prefix = '') {
  const entries = await readdir(directory, {withFileTypes:true});
  const files = await Promise.all(entries.map(entry => entry.isDirectory()
    ? staticFiles(path.join(directory, entry.name), prefix + entry.name + '/')
    : [prefix + entry.name]));
  return files.flat();
}

export async function assetHashes(directory) {
  const result = {};
  const files = new Set(await staticFiles(directory));
  for (const asset of releaseAssets) {
    if (!files.has(asset)) throw new Error(`Missing release asset with exact filename case: ${asset}`);
  }
  // Cover every shipped non-HTML asset, including evidence and shared game modules.
  // HTML is verified separately; the generated manifest cannot hash itself.
  for (const asset of [...files].filter(file => !/\.html$/i.test(file) && file !== 'release-manifest.json').sort()) {
    const bytes = await readFile(path.join(directory, asset));
    if (!bytes.length) throw new Error(`Empty release asset: ${asset}`);
    result[asset] = createHash('sha256').update(bytes).digest('hex');
  }
  return result;
}
