import test, { before, after } from 'node:test';
import { spawnSync } from 'node:child_process';
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
const explorerStyles = ['orbit.css'];
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

function replaceCSSValue(source, property, previous, next) {
  const escaped = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const declaration = new RegExp(`(${escaped(property)}\\s*:\\s*)${escaped(previous)}(?=\\s*(?:!important\\s*)?[;}])`, 'i');
  assert(declaration.test(source), `Fixture does not contain ${property}: ${previous}`);
  return source.replace(declaration, (_, prefix) => prefix + next);
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

function explorerModule(html) {
  const entry = html.match(/<script\b(?=[^>]*\ssrc="orbit\.js")[^>]*>[\s\S]*?<\/script\s*>/i)?.[0];
  assert(entry, 'Fixture is missing its orbit module entry');
  return entry;
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

test('Approved portfolio photo story and orbit explorer retain legacy source with 23 pages and 76 protected assets', async t => {
  const directory = await fixture(t);
  assert.deepEqual(links(await readFile(path.join(directory, 'dist/index.html'), 'utf8')).map(match => match[1]), editorialStyles);
  assert.deepEqual(links(await readFile(path.join(directory, 'dist/play/index.html'), 'utf8')).map(match => match[1]), explorerStyles);
  await Promise.all(['src', 'dist'].flatMap(tree => gameStyles.map(file => access(path.join(directory, tree, 'play', file)))));
  assert.deepEqual(await checkRelease(directory), { pages: 23, releaseAssets: 76 });
});

for (const [name, transform] of [
  ['missing module', html => html.replace(/<script\b(?=[^>]*\ssrc="hero-badge\.js")[^>]*>[\s\S]*?<\/script\s*>/i, '')],
  ['parent-relative module', html => replaceOnce(html, 'src="hero-badge.js"', 'src="../hero-badge.js"')],
  ['classic script', html => {
    const entry = html.match(/<script\b(?=[^>]*\ssrc="hero-badge\.js")[^>]*>[\s\S]*?<\/script\s*>/i)?.[0];
    assert(entry, 'Fixture is missing its homepage badge module');
    return replaceOnce(html, entry, replaceOnce(entry, 'type="module"', 'type="text/javascript"'));
  }],
  ['duplicate module', html => replaceOnce(html, '</head>', '<script type="module" src="hero-badge.js"></script></head>')],
]) {
  test(`Homepage badge rejects ${name}`, async t => {
    const directory = await fixture(t);
    await edit(directory, 'dist/index.html', transform);
    await assert.rejects(checkRelease(directory), /expected only the hero-badge\.js module/);
  });
}

for (const id of ['hero-badge-canvas', 'hero-badge-stage', 'hero-badge-dialog']) {
  test(`Homepage badge retains its ${id} element`, async t => {
    const directory = await fixture(t);
    await edit(directory, 'dist/index.html', html => replaceOnce(html, `id="${id}"`, `id="missing-${id}"`));
    await assert.rejects(checkRelease(directory), new RegExp(`missing or duplicate ${id}`));
  });
}

test('Homepage badge runtime cannot leak into another editorial page', async t => {
  const directory = await fixture(t);
  await edit(directory, 'dist/about.html', html => replaceOnce(html, '</head>', '<script type="module" src="hero-badge.js"></script></head>'));
  await assert.rejects(checkRelease(directory), /about\.html: the badge hero must remain homepage-only/);
});

test('Retained foundation followed by approved forest/cream styling permits white print overrides', async t => {
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

test('Missing explorer entry cannot be released as an editorial-only build', async t => {
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

test('The explorer rejects a missing orbit stylesheet', async t => {
  const directory = await fixture(t);
  await edit(directory, 'dist/play/index.html', html => html.replace(links(html)[0][0], ''));
  await assert.rejects(checkRelease(directory), /play\/index\.html: expected explorer stylesheets/);
});

test('The explorer cannot inherit a dormant game stylesheet', async t => {
  const directory = await fixture(t);
  await edit(directory, 'dist/play/index.html', html => replaceOnce(html, '</head>', '<link rel="stylesheet" href="after-dark.css"></head>'));
  await assert.rejects(checkRelease(directory), /play\/index\.html: expected explorer stylesheets/);
});

test('The explorer enforces its exact local stylesheet path', async t => {
  const directory = await fixture(t);
  await edit(directory, 'dist/play/index.html', html => replaceOnce(html, 'href="orbit.css"', 'href="../orbit.css"'));
  await assert.rejects(checkRelease(directory), /play\/index\.html: expected explorer stylesheets/);
});

for (const [name, transform] of [
  ['missing module', html => replaceOnce(html, explorerModule(html), '')],
  ['parent-relative module', html => replaceOnce(html, 'src="orbit.js"', 'src="../orbit.js"')],
  ['wrong module entry', html => replaceOnce(html, 'src="orbit.js"', 'src="orbit-scene.js"')],
  ['classic script', html => {
    const entry = explorerModule(html);
    return replaceOnce(html, entry, replaceOnce(entry, 'type="module"', 'type="text/javascript"'));
  }],
  ['duplicate module', html => replaceOnce(html, explorerModule(html), explorerModule(html).repeat(2))],
  ['inline script injection', html => replaceOnce(html, '</body>', '<script>window.unapproved = true;</script></body>')],
  ['unclosed script injection', html => replaceOnce(html, '</body>', '<script src="orbit-scene.js"></body>')],
]) {
  test(`The explorer rejects ${name}`, async t => {
    const directory = await fixture(t);
    await edit(directory, 'dist/play/index.html', transform);
    await assert.rejects(checkRelease(directory), /expected only the orbit\.js module entry/);
  });
}

for (const engine of ['game.js', 'after-dark-game.js']) {
  test(`The explorer cannot reactivate the legacy ${engine} entry`, async t => {
    const directory = await fixture(t);
    await edit(directory, 'dist/play/index.html', html => replaceOnce(html, '</body>', `<script type="module" src="${engine}"></script></body>`));
    await assert.rejects(checkRelease(directory), /legacy game engine must remain dormant/);
  });
}

for (const [id, message] of [['orbit-canvas', /missing orbit canvas/], ['orbit-stage', /missing orbit stage/], ['chapter-dialog', /missing chapter dialog/]]) {
  test(`The explorer retains its ${id} element`, async t => {
    const directory = await fixture(t);
    await edit(directory, 'dist/play/index.html', html => replaceOnce(html, `id="${id}"`, `id="missing-${id}"`));
    await assert.rejects(checkRelease(directory), message);
  });
}

test('The explorer retains five chapter navigation anchors', async t => {
  const directory = await fixture(t);
  await edit(directory, 'dist/play/index.html', html => {
    const chapter = html.match(/<a\b(?=[^>]*\sdata-chapter(?:\s|=|>))[^>]*>/i)?.[0];
    assert(chapter, 'Fixture is missing its chapter navigation');
    return replaceOnce(html, chapter, chapter.replace(/\sdata-chapter(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/i, ''));
  });
  await assert.rejects(checkRelease(directory), /expected five chapter navigation anchors/);
});

for (const id of ['game', 'start-game']) {
  test(`The explorer cannot restore the legacy #${id} gameplay control`, async t => {
    const directory = await fixture(t);
    await edit(directory, 'dist/play/index.html', html => replaceOnce(html, '</main>', `<button id="${id}">Legacy control</button></main>`));
    await assert.rejects(checkRelease(directory), /legacy gameplay controls must remain dormant/);
  });
}

test('Editorial markup must retain the portfolio theme class', async t => {
  const directory = await fixture(t);
  await edit(directory, 'dist/about.html', html => replaceOnce(html, 'class="portfolio ', 'class="'));
  await assert.rejects(checkRelease(directory), /missing portfolio theme class/);
});

for (const route of ['index.html', 'about.html']) {
  test(`${route} must use the approved cutout portrait rather than the old photograph`, async t => {
    const directory = await fixture(t);
    await edit(directory, `dist/${route}`, html => replaceOnce(html, 'src="assets/vigo-portrait-cutout.png"', 'src="assets/vigo-portrait-640.jpg"'));
    await assert.rejects(checkRelease(directory), /cutout portrait markup or intrinsic dimensions missing/);
  });
  test(`${route} cutout portrait retains its picture class`, async t => {
    const directory = await fixture(t);
    await edit(directory, `dist/${route}`, html => {
      const picture = html.match(/<picture\b(?=[^>]*\bclass="[^"]*\bportrait-picture\b)[^>]*>/i)?.[0];
      assert(picture, 'Fixture is missing its approved cutout picture');
      return replaceOnce(html, picture, replaceOnce(picture, 'portrait-picture', 'previous-portrait'));
    });
    await assert.rejects(checkRelease(directory), /cutout portrait markup or intrinsic dimensions missing/);
  });
  for (const [dimension, previous, next] of [['width', '1122', '1121'], ['height', '1402', '1401']]) {
    test(`${route} cutout portrait retains its intrinsic ${dimension}`, async t => {
      const directory = await fixture(t);
      await edit(directory, `dist/${route}`, html => {
        const image = html.match(/<img\b(?=[^>]*\ssrc="assets\/vigo-portrait-cutout\.png")[^>]*>/i)?.[0];
        assert(image, 'Fixture is missing its approved cutout portrait');
        return replaceOnce(html, image, replaceOnce(image, `${dimension}="${previous}"`, `${dimension}="${next}"`));
      });
      await assert.rejects(checkRelease(directory), /cutout portrait markup or intrinsic dimensions missing/);
    });
  }
}

for (const [name, property, previous, next] of [
  ['warm-cream base', '--bg', '#f3ebdd', '#eff7f6'],
  ['forest ink', '--ink', '#013230', '#14303e'],
  ['forest green', '--green', '#013230', '#006e62'],
  ['orange accent', '--orange', '#ff6a1f', '#87f5c2'],
  ['paper alias', '--paper', 'var(--bg)', '#f3ebdd'],
  ['previous night ink', '--ink', '#013230', '#f1f7f5'],
  ['previous night accent', '--green', '#013230', '#87f5c2'],
  ['light color scheme', 'color-scheme', 'light', 'dark'],
]) {
  test(`Approved ${name} cannot drift even with rebuilt matching assets and manifest`, async t => {
    const directory = await fixture(t);
    await changeShippedAsset(directory, 'portfolio-brand.css', bytes => Buffer.from(replaceCSSValue(bytes.toString(), property, previous, next)));
    await assert.rejects(checkRelease(directory), /Approved forest\/cream portfolio|Screen portfolio color scheme/);
  });
}

for (const [name, override] of [
  ['superseded cream root', ':root { --bg: #f5f2eb; }'],
  ['previous pale-mint root', ':root { --bg: #eff7f6; }'],
  ['previous dark root', ':root { --bg: #091521; }'],
  ['later portfolio background-color', 'body.portfolio { background-color: #fff; }'],
  ['important plain-body background', 'body { background-color: #fff !important; }'],
  ['important root retained over a later normal declaration', ':root { --bg: #fff !important; } :root { --bg: #f3ebdd; }'],
  ['portfolio-local palette override', 'body.portfolio { --bg: #fff; }'],
  ['portfolio-local orange override', 'body.portfolio { --orange: #7655a7; }'],
  ['portfolio-local dark color scheme', 'body.portfolio { color-scheme: dark; }'],
]) {
  test(`Screen styling rejects ${name} while assets remain internally consistent`, async t => {
    const directory = await fixture(t);
    await changeShippedAsset(directory, 'portfolio-pages.css', bytes => Buffer.from(bytes.toString() + '\n' + override + '\n'));
    await assert.rejects(checkRelease(directory), /Approved forest\/cream portfolio|Screen portfolio (?:background|color scheme)/);
  });
}

for (const [name, file] of [
  ['homepage badge module', 'hero-badge.js'],
  ['self-hosted font', 'assets/fonts/InterVariable.woff2'],
  ['captured CRDC interface demo', 'assets/crdc-research-demo.jpg'],
  ['captured Dataset interface demo', 'assets/dataset-health-demo.jpg'],
  ['captured Strobe interface demo', 'assets/strobe-ai-demo.jpg'],
  ['cutout portrait', 'assets/vigo-portrait-cutout.png'],
  ['WebP cutout portrait', 'assets/vigo-portrait-cutout.webp'],
  ['orbit stylesheet', 'play/orbit.css'],
  ['orbit entry module', 'play/orbit.js'],
  ['orbit scene module', 'play/orbit-scene.js'],
  ['orbit chapter content', 'play/orbit-content.js'],
  ['portrait shape module', 'play/portrait-shape.js'],
  ['vendored Three renderer module', 'play/vendor/three.module.js'],
  ['vendored Three core module', 'play/vendor/three.core.js'],
  ['vendored Three license', 'play/vendor/THREE-LICENSE.txt'],
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
  ['homepage badge module', 'hero-badge.js', 'Hero-Badge.js'],
  ['font', 'assets/fonts/InterVariable.woff2', 'assets/fonts/intervariable.woff2'],
  ['CRDC demo screenshot', 'assets/crdc-research-demo.jpg', 'assets/CRDC-Research-Demo.jpg'],
  ['Dataset demo screenshot', 'assets/dataset-health-demo.jpg', 'assets/Dataset-Health-Demo.jpg'],
  ['Strobe demo screenshot', 'assets/strobe-ai-demo.jpg', 'assets/Strobe-AI-Demo.jpg'],
  ['cutout portrait', 'assets/vigo-portrait-cutout.png', 'assets/Vigo-Portrait-Cutout.png'],
  ['WebP cutout portrait', 'assets/vigo-portrait-cutout.webp', 'assets/Vigo-Portrait-Cutout.webp'],
  ['orbit stylesheet', 'play/orbit.css', 'play/Orbit.css'],
  ['orbit entry module', 'play/orbit.js', 'play/Orbit.js'],
  ['orbit scene module', 'play/orbit-scene.js', 'play/Orbit-Scene.js'],
  ['orbit chapter content', 'play/orbit-content.js', 'play/Orbit-Content.js'],
  ['portrait shape module', 'play/portrait-shape.js', 'play/Portrait-Shape.js'],
  ['Three renderer module', 'play/vendor/three.module.js', 'play/vendor/Three.module.js'],
  ['Three core module', 'play/vendor/three.core.js', 'play/vendor/Three.core.js'],
  ['Three license', 'play/vendor/THREE-LICENSE.txt', 'play/vendor/three-license.txt'],
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

for (const [tree, file] of [['src', 'play/missions.js'], ['dist', 'assets/dataset-health-scaling.csv'], ['dist', 'play/vendor/three.core.js']]) {
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

// A separately deployed GitHub project site is a navigation destination, not a
// reason to stop checking missing portfolio pages or required local assets.
function runLinkCheck(directory) {
  return spawnSync(process.execPath, [path.join(repo, 'scripts/check.js')], {cwd:directory, encoding:'utf8'});
}
for (const [name, url, unknownPath] of [
  ['Dataset', 'https://vigodang.github.io/dataset-health-analyzer-demo/', 'https://vigodang.github.io/dataset-health-analyzer-demo/missing.html'],
  ['Strobe', 'https://vigodang.github.io/strobe-ai-demo/#/login', 'https://vigodang.github.io/strobe-ai-demo/missing.html#/login'],
]) {
  // Inject one reference instead of depending on a particular homepage layout.
  const inject = (directory, markup) => edit(directory, 'dist/index.html', html => replaceOnce(html, '</main>', markup + '</main>'));
  test(`Exact separately deployed ${name} anchor URL passes the local link check`, async t => {
    const directory = await fixture(t);
    await inject(directory, `<a href="${url}">${name} demo</a>`);
    const result = runLinkCheck(directory);
    assert.equal(result.status, 0, result.stderr);
  });
  test(`An unknown path inside the ${name} deployment still fails local validation`, async t => {
    const directory = await fixture(t);
    await inject(directory, `<a href="${unknownPath}">${name} demo</a>`);
    const result = runLinkCheck(directory);
    assert.equal(result.status, 1);
    assert(result.stderr.includes(`missing href ${unknownPath}`), result.stderr);
  });
  test(`${name} navigation exemption cannot hide a missing image asset`, async t => {
    const directory = await fixture(t);
    await inject(directory, `<img src="${url}" alt="Demo reference test" width="1" height="1">`);
    const result = runLinkCheck(directory);
    assert.equal(result.status, 1);
    assert(result.stderr.includes(`missing src ${url}`), result.stderr);
  });
  test(`${name} navigation exemption cannot hide a stylesheet asset`, async t => {
    const directory = await fixture(t);
    await edit(directory, 'dist/index.html', html => replaceOnce(html, '</head>', `<link rel="stylesheet" href="${url}"></head>`));
    const result = runLinkCheck(directory);
    assert.equal(result.status, 1);
    assert(result.stderr.includes(`missing href ${url}`), result.stderr);
  });
}
test('An unapproved Strobe hash route cannot use the exact login navigation exemption', async t => {
  const directory = await fixture(t);
  const url = 'https://vigodang.github.io/strobe-ai-demo/#/missing';
  await edit(directory, 'dist/index.html', html => replaceOnce(html, '</main>', `<a href="${url}">Demo route test</a></main>`));
  const result = runLinkCheck(directory);
  assert.equal(result.status, 1);
  assert(result.stderr.includes(`missing href ${url}`), result.stderr);
});
