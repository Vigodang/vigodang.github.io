import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects } from '../content/site.js';
import { assetHashes, stylesheets, gameStylesheets } from './release-assets.js';

const here = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const normalize = value => value.replaceAll('\r\n', '\n');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

// This intentionally checks this repository's small, explicit workflow format.
// If its structure changes, review these assertions with the workflow.
export function checkWorkflow(source) {
  const yaml = normalize(source).split('\n').filter(line => !line.trimStart().startsWith('#')).join('\n');
  const build = yaml.match(/^  build:\n([\s\S]*?)(?=^  \w+:|$(?![\s\S]))/m)?.[1];
  const deploy = yaml.match(/^  deploy:\n([\s\S]*)/m)?.[1];
  assert(build && deploy, 'Pages workflow must contain build and deploy jobs');
  const commands = [...build.matchAll(/^      - run: (.+)$/gm)].map(match => match[1].trim());
  assert(JSON.stringify(commands) === JSON.stringify(['npm install --ignore-scripts', 'npm run build', 'npm run check']), 'Pages workflow must install, build and check in order');
  const upload = build.match(/^      - uses: actions\/upload-pages-artifact@[^\n]+\n        with:\n          path: ([^\n]+)$/m);
  assert(upload?.[1].trim() === 'dist', 'Pages upload artifact path must be dist');
  assert(build.indexOf('npm run check') < build.indexOf('actions/upload-pages-artifact@'), 'Pages upload must follow successful checks');
  assert(/^    needs: build$/m.test(deploy) && /actions\/deploy-pages@/.test(deploy), 'Pages deployment must use the checked build');
  assert(/^    if: github\.ref == 'refs\/heads\/main' && github\.event_name != 'pull_request'$/m.test(deploy), 'Pages deployment must be restricted to main and exclude pull requests');
  assert(/^  push:\n    branches: \[main\]$/m.test(yaml) && /^  pull_request:\n    branches: \[main\]$/m.test(yaml), 'Pages workflow must validate main pushes and pull requests');
  assert(!/continue-on-error:\s*true/i.test(build), 'Pages build/check failures must block publication');
  assert(!/peaceiris\/actions-gh-pages@|JamesIves\/github-pages-deploy-action@/i.test(yaml), 'Conflicting legacy publisher in Pages workflow');
  assert([...yaml.matchAll(/actions\/deploy-pages@/g)].length === 1 && [...yaml.matchAll(/actions\/upload-pages-artifact@/g)].length === 1, 'Pages workflow must have exactly one artifact upload and publisher');
}

export function checkTheme(source) {
  let css = normalize(source).replace(/\/\*[\s\S]*?\*\//g, '');
  // The approved print stylesheet uses white paper; screen checks exclude it.
  let print;
  while ((print = /@media\s+print\s*\{/i.exec(css))) {
    let end = print.index + print[0].length, depth = 1;
    for (; end < css.length && depth; end++) { if (css[end] === '{') depth++; if (css[end] === '}') depth--; }
    assert(depth === 0, 'Unclosed print stylesheet');
    css = css.slice(0, print.index) + css.slice(end);
  }
  // The retained foundation declares the old light palette before the approved
  // dark layer. Check the winning declarations, not every historical value.
  const rootRules = [...css.matchAll(/(?:^|[{}])\s*:root\s*\{([^{}]*)\}/g)].map(rule => rule[1]);
  const bodyRules = [...css.matchAll(/(?:^|[{}])\s*(body(?:\.portfolio)?)\s*\{([^{}]*)\}/g)];
  function winning(declarations) {
    return declarations.reduce((winner, declaration) => {
      const important = /!important\s*$/i.test(declaration.value);
      const candidate = {...declaration, important, value:declaration.value.replace(/\s*!important\s*$/i, '').trim().toLowerCase()};
      return !winner || Number(important) > Number(winner.important)
        || (important === winner.important && candidate.specificity >= winner.specificity) ? candidate : winner;
    }, null);
  }
  for (const [token, value] of [['bg', '#091521'], ['ink', '#f1f7f5'], ['green', '#87f5c2'], ['paper', 'var(--bg)']]) {
    const declarations = rootRules.flatMap(rule => [...rule.matchAll(new RegExp(`--${token}\\s*:\\s*([^;}]+)`, 'g'))].map(match => ({value:match[1],specificity:0})));
    const local = bodyRules.flatMap(rule => [...rule[2].matchAll(new RegExp(`--${token}\\s*:\\s*([^;}]+)`, 'g'))].map(match => ({value:match[1],specificity:rule[1] === 'body.portfolio' ? 1 : 0})));
    assert(winning(declarations)?.value === value && (!local.length || winning(local)?.value === value), `Approved dark ${token} theme token must be ${value}`);
  }
  const schemes = rootRules.flatMap(rule => [...rule.matchAll(/\bcolor-scheme\s*:\s*([^;}]+)/g)].map(match => ({value:match[1],specificity:0})));
  const localSchemes = bodyRules.flatMap(rule => [...rule[2].matchAll(/\bcolor-scheme\s*:\s*([^;}]+)/g)].map(match => ({value:match[1],specificity:rule[1] === 'body.portfolio' ? 1 : 0})));
  assert(winning(schemes)?.value === 'dark' && (!localSchemes.length || winning(localSchemes)?.value === 'dark'), 'Screen color scheme must remain dark');
  const backgrounds = bodyRules
    .flatMap(rule => [...rule[2].matchAll(/\bbackground(?:-color)?\s*:\s*([^;}]+)/g)].map(match => ({value:match[1],specificity:rule[1] === 'body.portfolio' ? 1 : 0})));
  assert(/var\(\s*--bg\s*\)\s*$/.test(winning(backgrounds)?.value || ''), 'Screen portfolio background must use the approved midnight token');
}

export async function checkRelease(repo = here) {
  const dist = path.join(repo, 'dist');
  const hashes = await assetHashes(dist);
  assert(JSON.stringify(hashes) === JSON.stringify(await assetHashes(path.join(repo, 'src'))), 'Source and built release assets differ; rebuild dist');
  checkTheme((await Promise.all(stylesheets.map(file => readFile(path.join(dist, file), 'utf8')))).join('\n'));
  const editorialRoutes = ['index.html', 'work.html', 'about.html', 'experience.html', 'resume.html', 'contact.html'];
  for (const project of projects) {
    editorialRoutes.push(`projects/${project.slug}.html`, `visuals/${project.slug}-overview.html`);
    if (project.architecture) editorialRoutes.push(`visuals/${project.slug}-architecture.html`);
    if (project.evidenceVisual) editorialRoutes.push(`visuals/${project.slug}-results.html`);
    (project.details || []).forEach((_, index) => editorialRoutes.push(`visuals/${project.slug}-detail-${index + 1}.html`));
  }
  const routes = [...editorialRoutes, 'play/index.html'];
  const files = (await readdir(dist, {recursive:true})).map(file => file.split(path.sep).join('/'));
  const htmlFiles = files.filter(file => /\.html$/i.test(file)).sort();
  const missing = routes.filter(route => !htmlFiles.includes(route));
  const unexpected = htmlFiles.filter(route => !routes.includes(route));
  assert(!missing.length && !unexpected.length, `Built HTML routes differ from the complete approved page set; missing: ${missing.join(', ') || '(none)'}; unexpected: ${unexpected.join(', ') || '(none)'}`);
  for (const route of routes) {
    const html = await readFile(path.join(dist, route), 'utf8');
    const linked = [...html.matchAll(/<link\b(?=[^>]*\brel="stylesheet")[^>]*\bhref="([^"]+)"[^>]*>/gi)].map(match => match[1]);
    const isGame = route === 'play/index.html';
    const prefix = !isGame && route.includes('/') ? '../' : '';
    const expected = (isGame ? gameStylesheets : stylesheets).map(file => prefix + file);
    assert(JSON.stringify(linked) === JSON.stringify(expected), `${route}: expected ${isGame ? 'game' : 'portfolio'} stylesheets in approved order with exact relative paths`);
    if (!isGame) assert(/<body\b[^>]*class="[^"]*\bportfolio\b/.test(html), `${route}: missing portfolio theme class`);
    if (route === 'index.html' || route === 'about.html') assert(html.includes('class="portrait-picture ') && html.includes('assets/vigo-portrait-640.jpg'), `${route}: portrait markup missing`);
  }
  const manifest = JSON.parse(await readFile(path.join(dist, 'release-manifest.json'), 'utf8'));
  assert(manifest.schemaVersion === 1 && (manifest.sourceCommit === null || /^[a-f0-9]{40}$/i.test(manifest.sourceCommit)), 'Invalid release manifest provenance');
  if (process.env.GITHUB_SHA) assert(manifest.sourceCommit === process.env.GITHUB_SHA, 'Release manifest does not identify this Actions commit');
  assert(JSON.stringify(manifest.assetSHA256) === JSON.stringify(hashes), 'Release manifest hashes do not match built assets');
  const workflows = (await readdir(path.join(repo, '.github/workflows'))).filter(file => /\.ya?ml$/.test(file));
  for (const file of workflows) {
    const workflow = await readFile(path.join(repo, '.github/workflows', file), 'utf8');
    if (file === 'pages.yml') checkWorkflow(workflow);
    else assert(!/actions\/(?:deploy-pages|upload-pages-artifact)@|peaceiris\/actions-gh-pages@|JamesIves\/github-pages-deploy-action@/i.test(workflow), `Conflicting Pages publishing workflow: ${file}`);
  }
  assert(workflows.includes('pages.yml'), 'Missing Pages workflow');
  const ignored = normalize(await readFile(path.join(repo, '.gitignore'), 'utf8')).split('\n');
  assert(ignored.includes('dist/') && ignored.includes('node_modules/'), 'Generated dist and node_modules must be ignored');
  return {pages: routes.length, releaseAssets: Object.keys(hashes).length};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  checkRelease().then(result => console.log(`Release checks OK: ${result.pages} pages, ${result.releaseAssets} protected assets, dark portfolio and game styles, source/build hashes and Pages workflow`)).catch(error => { console.error(error.message); process.exitCode = 1; });
}
