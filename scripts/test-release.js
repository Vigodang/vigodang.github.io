import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { access, cp, mkdtemp, readFile, rename, rm, unlink, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkRelease, checkTheme, checkWorkflow } from './check-release.js';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const editorialStyles = ['styles.css', 'layout-refinement.css', 'case-refinement.css', 'portfolio-brand.css', 'portfolio-pages.css'];
const gameStyles = ['styles.css', 'briefing.css', 'missions.css', 'evidence.css', 'after-dark.css'];
const manifestFile = 'dist/release-manifest.json';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
let temporaryRoot;
let approvedCSS;

before(async () => {
  await access(path.join(repo, manifestFile)); // npm run build must precede these integration checks.
  temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'vigo-release-guard-'));
  approvedCSS = (await Promise.all(editorialStyles.map(file => readFile(path.join(repo, 'dist', file), 'utf8')))).join('\n');
});

function isWithin(parent, child) {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

after(async () => {
  if (!temporaryRoot) return;
  // Delete only the random directory this test run created directly under the OS temp directory.
  assert.equal(path.dirname(path.resolve(temporaryRoot)), path.resolve(os.tmpdir()));
  assert(path.basename(temporaryRoot).startsWith('vigo-release-guard-'));
  await rm(temporaryRoot, { recursive: true, force: true });
});

async function fixture(t) {
  const directory = await mkdtemp(path.join(temporaryRoot, 'case-'));
  assert(isWithin(temporaryRoot, directory));
  t.after(async () => {
    assert(isWithin(temporaryRoot, directory));
    await rm(directory, { recursive: true, force: true });
  });
  await Promise.all(['src', 'dist', '.github', 'content'].map(name => cp(path.join(repo, name), path.join(directory, name), { recursive: true })));
  await Promise.all(['.gitignore', 'package.json'].map(name => cp(path.join(repo, name), path.join(directory, name))));
  return directory;
}

async function edit(directory, file, transform) {
  const location = path.join(directory, file);
  const previous = await readFile(location, 'utf8');
  const next = transform(previous);
  assert.notEqual(next, previous, `Fixture mutation did not change ${file}`);
  await writeFile(location, next);
}

function replaceOnce(source, previous, next) {
  assert(source.includes(previous), `Fixture does not contain ${previous}`);
  return source.replace(previous, next);
}

async function updateManifest(directory, change) {
  const location = path.join(directory, manifestFile);
  const manifest = JSON.parse(await readFile(location, 'utf8'));
  change(manifest);
  manifest.assetSHA256 = Object.fromEntries(Object.entries(manifest.assetSHA256).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  await writeFile(location, JSON.stringify(manifest, null, 2) + '\n');
}

// Rebase both source/build bytes and the manifest so semantic tests cannot pass
// merely because a preliminary source/build or hash comparison rejected them.
async function changeShippedAsset(directory, file, transform) {
  const bytes = await readFile(path.join(directory, 'src', file));
  const next = transform(bytes);
  assert.notDeepEqual(next, bytes);
  await Promise.all(['src', 'dist'].map(tree => writeFile(path.join(directory, tree, file), next)));
  await updateManifest(directory, manifest => { manifest.assetSHA256[file] = hash(next); });
}

async function removeShippedAsset(directory, file) {
  await Promise.all(['src', 'dist'].map(tree => unlink(path.join(directory, tree, file))));
  await updateManifest(directory, manifest => { delete manifest.assetSHA256[file]; });
}

async function renameShippedAsset(directory, previous, next) {
  for (const tree of ['src', 'dist']) {
    const from = path.join(directory, tree, previous);
    const intermediate = `${from}.case-test-temporary`;
    // Two steps make a case-only rename reliable on Windows as well as Linux.
    await rename(from, intermediate);
    await rename(intermediate, path.join(directory, tree, next));
  }
  await updateManifest(directory, manifest => {
    manifest.assetSHA256[next] = manifest.assetSHA256[previous];
    delete manifest.assetSHA256[previous];
  });
}

function links(html) {
  return [...html.matchAll(/<link\b(?=[^>]*\brel="stylesheet")[^>]*\bhref="([^"]+)"[^>]*>/gi)];
}

function swapStyles(html, a, b) {
  const matches = links(html);
  assert(matches[a] && matches[b]);
  return html.replace(matches[a][0], '__FIRST_STYLESHEET__').replace(matches[b][0], matches[a][0]).replace('__FIRST_STYLESHEET__', matches[b][0]);
}

async function withGithubSHA(value, callback) {
  const previous = process.env.GITHUB_SHA;
  if (value === undefined) delete process.env.GITHUB_SHA;
  else process.env.GITHUB_SHA = value;
  try { return await callback(); }
  finally {
    if (previous === undefined) delete process.env.GITHUB_SHA;
    else process.env.GITHUB_SHA = previous;
  }
}

test('Approved dark portfolio and intact game release passes with 23 pages and 54 protected assets', async t => {
  const directory = await fixture(t);
  assert.deepEqual(links(await readFile(path.join(directory, 'dist/index.html'), 'utf8')).map(match => match[1]), editorialStyles);
  assert.deepEqual(links(await readFile(path.join(directory, 'dist/play/index.html'), 'utf8')).map(match => match[1]), gameStyles);
  assert.deepEqual(await checkRelease(directory), { pages: 23, releaseAssets: 54 });
});

test('Legacy cream foundation followed by approved dark styling permits white print overrides', async t => {
  const directory = await fixture(t);
  const print = '\n@media print { :root { color-scheme: light; --bg: #fff; --paper: #fff; --ink: #000; --green: #31584b; } body.portfolio { background-color: #fff !important; } }\n';
  assert.doesNotThrow(() => checkTheme(approvedCSS + print));
  await changeShippedAsset(directory, 'portfolio-pages.css', bytes => Buffer.from(bytes.toString() + print));
  await checkRelease(directory);
});

test('A later plain-body rule does not override the more specific approved portfolio background', async t => {
  const directory = await fixture(t);
  await changeShippedAsset(directory, 'portfolio-pages.css', bytes => Buffer.from(bytes.toString() + '\nbody { background: #fff; }\n'));
  await checkRelease(directory);
});

test('Missing game entry cannot be released as an editorial-only build', async t => {
  const directory = await fixture(t);
  await unlink(path.join(directory, 'dist/play/index.html'));
  await assert.rejects(checkRelease(directory), /HTML routes.*play\/index\.html/);
});

for (const extra of ['stale.html', 'play/debug.HTML']) {
  test(`Unexpected HTML route ${extra} is rejected`, async t => {
    const directory = await fixture(t);
    await writeFile(path.join(directory, 'dist', extra), '<!doctype html><title>Unexpected page</title>');
    await assert.rejects(checkRelease(directory), /HTML routes.*unexpected:/);
  });
}

test('Editorial release rejects a missing fifth stylesheet', async t => {
  const directory = await fixture(t);
  await edit(directory, 'dist/index.html', html => html.replace(links(html)[4][0], ''));
  await assert.rejects(checkRelease(directory), /index\.html: expected portfolio stylesheets/);
});

test('Nested case-study pages enforce all five editorial stylesheets in the approved order', async t => {
  const directory = await fixture(t);
  await edit(directory, 'dist/projects/dataset-health.html', html => swapStyles(html, 3, 4));
  await assert.rejects(checkRelease(directory), /dataset-health\.html: expected portfolio stylesheets/);
});

test('The game rejects a missing fifth stylesheet', async t => {
  const directory = await fixture(t);
  await edit(directory, 'dist/play/index.html', html => html.replace(links(html)[4][0], ''));
  await assert.rejects(checkRelease(directory), /play\/index\.html: expected game stylesheets/);
});

test('The game enforces its own five-stylesheet order', async t => {
  const directory = await fixture(t);
  await edit(directory, 'dist/play/index.html', html => swapStyles(html, 3, 4));
  await assert.rejects(checkRelease(directory), /play\/index\.html: expected game stylesheets/);
});

test('The game cannot inherit editorial parent-relative stylesheet paths', async t => {
  const directory = await fixture(t);
  await edit(directory, 'dist/play/index.html', html => replaceOnce(html, 'href="after-dark.css"', 'href="../after-dark.css"'));
  await assert.rejects(checkRelease(directory), /play\/index\.html: expected game stylesheets/);
});

test('Editorial markup must retain the portfolio theme class', async t => {
  const directory = await fixture(t);
  await edit(directory, 'dist/about.html', html => replaceOnce(html, 'class="portfolio ', 'class="'));
  await assert.rejects(checkRelease(directory), /missing portfolio theme class/);
});

for (const [name, previous, next] of [
  ['midnight base', '--bg:#091521', '--bg:#f5f2eb'],
  ['off-white ink', '--ink:#f1f7f5', '--ink:#202622'],
  ['mint accent', '--green:#87f5c2', '--green:#31584b'],
  ['dark color scheme', 'color-scheme:dark', 'color-scheme:light'],
]) {
  test(`Approved ${name} cannot drift even with rebuilt matching assets and manifest`, async t => {
    const directory = await fixture(t);
    await changeShippedAsset(directory, 'portfolio-brand.css', bytes => Buffer.from(replaceOnce(bytes.toString(), previous, next)));
    await assert.rejects(checkRelease(directory), /Approved dark|Screen color scheme/);
  });
}

for (const [name, override] of [
  ['later cream root', ':root { --bg: #f5f2eb; }'],
  ['later portfolio background-color', 'body.portfolio { background-color: #fff; }'],
  ['important plain-body background', 'body { background-color: #fff !important; }'],
  ['important root retained over a later normal declaration', ':root { --bg: #fff !important; } :root { --bg: #091521; }'],
  ['portfolio-local palette override', 'body.portfolio { --bg: #fff; }'],
  ['portfolio-local light color scheme', 'body.portfolio { color-scheme: light; }'],
]) {
  test(`Screen styling rejects ${name} while assets remain internally consistent`, async t => {
    const directory = await fixture(t);
    await changeShippedAsset(directory, 'portfolio-pages.css', bytes => Buffer.from(bytes.toString() + '\n' + override + '\n'));
    await assert.rejects(checkRelease(directory), /Approved dark|Screen (?:portfolio background|color scheme)/);
  });
}

for (const [name, file] of [
  ['self-hosted font', 'assets/fonts/InterVariable.woff2'],
  ['original city artwork', 'play/assets/after-dark/city-panorama.webp'],
  ['mission runtime module', 'play/missions.js'],
  ['current redesigned résumé PDF', 'assets/Vigo_Dang_Resume_2026_Redesigned.pdf'],
  ['retained legacy résumé PDF', 'assets/resume-truong-lieu-dong-vigo-dang.pdf'],
]) {
  test(`Required ${name} cannot disappear from both source and build with a rebased manifest`, async t => {
    const directory = await fixture(t);
    await removeShippedAsset(directory, file);
    await assert.rejects(checkRelease(directory), /Missing release asset with exact filename case/);
  });
}

for (const [name, previous, next] of [
  ['font', 'assets/fonts/InterVariable.woff2', 'assets/fonts/intervariable.woff2'],
  ['district artwork', 'play/assets/after-dark/district-atlas.webp', 'play/assets/after-dark/District-atlas.webp'],
]) {
  test(`Required ${name} filename case must match even on Windows`, async t => {
    const directory = await fixture(t);
    await renameShippedAsset(directory, previous, next);
    await assert.rejects(checkRelease(directory), /Missing release asset with exact filename case/);
  });
}

test('Empty game artwork is rejected even after both copies and manifest are updated', async t => {
  const directory = await fixture(t);
  await changeShippedAsset(directory, 'play/assets/after-dark/city-panorama.webp', () => Buffer.alloc(0));
  await assert.rejects(checkRelease(directory), /Empty release asset/);
});

for (const [tree, file] of [['src', 'play/missions.js'], ['dist', 'assets/dataset-health-scaling.csv']]) {
  test(`${tree}-only asset byte drift is rejected before release`, async t => {
    const directory = await fixture(t);
    await edit(directory, `${tree}/${file}`, source => source + '\n');
    await assert.rejects(checkRelease(directory), /Source and built release assets differ/);
  });
}

test('A tampered game asset SHA in the release manifest is rejected', async t => {
  const directory = await fixture(t);
  await updateManifest(directory, manifest => { manifest.assetSHA256['play/missions.js'] = '0'.repeat(64); });
  await assert.rejects(checkRelease(directory), /Release manifest hashes do not match/);
});

test('A valid Actions SHA matching the manifest provenance passes', async t => {
  const directory = await fixture(t);
  const commit = 'a'.repeat(40);
  await updateManifest(directory, manifest => { manifest.sourceCommit = commit; });
  await withGithubSHA(commit, () => checkRelease(directory));
});

test('Stale Actions provenance is rejected even when every asset hash matches', async t => {
  const directory = await fixture(t);
  await updateManifest(directory, manifest => { manifest.sourceCommit = 'a'.repeat(40); });
  await withGithubSHA('b'.repeat(40), () => assert.rejects(checkRelease(directory), /does not identify this Actions commit/));
});

test('Malformed release manifest provenance is rejected without an Actions environment', async t => {
  const directory = await fixture(t);
  await updateManifest(directory, manifest => { manifest.sourceCommit = 'not-a-git-commit'; });
  await withGithubSHA(undefined, () => assert.rejects(checkRelease(directory), /Invalid release manifest provenance/));
});

for (const [name, previous, next, expected] of [
  ['wrong upload artifact', '          path: dist', '          path: src', /upload artifact path must be dist/],
  ['unguarded PR deployment', "    if: github.ref == 'refs/heads/main' && github.event_name != 'pull_request'", '    if: always()', /restricted to main and exclude pull requests/],
  ['skipped release checks', '      - run: npm run check', '      - run: npm run build', /install, build and check in order/],
  ['ignored build failures', '      - run: npm run check', '      - run: npm run check\n        continue-on-error: true', /failures must block publication/],
]) {
  test(`Pages workflow rejects ${name}`, async t => {
    const directory = await fixture(t);
    await edit(directory, '.github/workflows/pages.yml', source => replaceOnce(source, previous, next));
    const workflow = await readFile(path.join(directory, '.github/workflows/pages.yml'), 'utf8');
    assert.throws(() => checkWorkflow(workflow), expected);
    await assert.rejects(checkRelease(directory), expected);
  });
}

test('A second Pages publisher cannot bypass the checked release workflow', async t => {
  const directory = await fixture(t);
  await writeFile(path.join(directory, '.github/workflows/second-publisher.yml'), 'name: Unapproved publisher\njobs:\n  publish:\n    steps:\n      - uses: actions/deploy-pages@v4\n');
  await assert.rejects(checkRelease(directory), /Conflicting Pages publishing workflow/);
});
