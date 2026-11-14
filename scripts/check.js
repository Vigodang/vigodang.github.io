import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("dist");
const siteOrigin = "https://vigodang.github.io";
const errors = [];
const files = [];
const pages = new Map();
let checkedReferences = 0;
let checkedFragments = 0;

function label(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function decodeHTML(value) {
  return value.replace(/&(?:amp|quot|apos|lt|gt|nbsp|#\d+|#x[\da-f]+);/gi, (entity) => {
    const named = { "&amp;": "&", "&quot;": '"', "&apos;": "'", "&lt;": "<", "&gt;": ">", "&nbsp;": " " };
    if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
    const code = entity[2].toLowerCase() === "x" ? parseInt(entity.slice(3, -1), 16) : parseInt(entity.slice(2, -1), 10);
    return code <= 0x10ffff ? String.fromCodePoint(code) : entity;
  });
}

function attrs(tag) {
  const result = {};
  for (const match of tag.matchAll(/([^\s=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    result[match[1].toLowerCase()] = decodeHTML(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return result;
}

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (entry.isFile()) files.push(file);
  }
}

async function fileTarget(target) {
  try {
    const info = await stat(target);
    if (info.isFile()) return target;
    if (info.isDirectory()) {
      const index = path.join(target, "index.html");
      if ((await stat(index)).isFile()) return index;
    }
  } catch { /* The caller reports missing targets with their source location. */ }
  return null;
}

// Resolve site-root and page-relative references without permitting a path to
// leave dist. Same-origin absolute URLs receive the same local validation.
function resolveReference(value, from) {
  let ref = decodeHTML(value).trim();
  if (/^javascript\s*:/i.test(ref)) throw new Error("javascript URL is forbidden");
  if (/^(?:data|blob|mailto|tel):/i.test(ref)) return null;
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(ref)) {
    let url;
    try { url = new URL(ref, siteOrigin); } catch { throw new Error("invalid URL"); }
    if (url.origin !== siteOrigin) return null;
    ref = `${url.pathname}${url.search}${url.hash}`;
  }
  const hashAt = ref.indexOf("#");
  const fragment = hashAt < 0 ? "" : ref.slice(hashAt + 1);
  const pathname = (hashAt < 0 ? ref : ref.slice(0, hashAt)).split("?")[0];
  let decodedPath;
  let decodedFragment;
  try {
    decodedPath = decodeURIComponent(pathname);
    decodedFragment = decodeURIComponent(fragment);
  } catch { throw new Error("invalid URL encoding"); }
  if (/[\0\\]/.test(decodedPath)) throw new Error("invalid local path");
  const target = !decodedPath ? from : path.resolve(decodedPath.startsWith("/") ? root : path.dirname(from), decodedPath.replace(/^\/+/, ""));
  const relative = path.relative(root, target);
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error("path escapes dist");
  return { target, fragment: decodedFragment };
}

async function checkReference(value, from, kind, { fragment = true } = {}) {
  try {
    const resolved = resolveReference(value, from);
    if (!resolved) return null;
    checkedReferences++;
    const target = await fileTarget(resolved.target);
    if (!target) {
      errors.push(`${label(from)}: missing ${kind} ${value}`);
      return null;
    }
    if (fragment && resolved.fragment && target.endsWith(".html")) {
      checkedFragments++;
      if (!pages.get(target)?.ids.has(resolved.fragment)) errors.push(`${label(from)}: missing fragment #${resolved.fragment} in ${label(target)}`);
    }
    return target;
  } catch (error) {
    errors.push(`${label(from)}: ${kind} ${value}: ${error.message}`);
    return null;
  }
}

try {
  if (!(await stat(root)).isDirectory()) throw new Error("dist is not a directory");
  await walk(root);
} catch (error) {
  console.error(`Cannot check site: ${error.message}. Run npm run build first.`);
  process.exit(1);
}

for (const file of files.filter((name) => name.endsWith(".html"))) {
  const html = await readFile(file, "utf8");
  const markup = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "");
  const tags = [...markup.matchAll(/<[a-z][^>]*>/gi)].map(([tag]) => ({ tag, name: tag.match(/^<([^\s/>]+)/)[1].toLowerCase(), a: attrs(tag) }));
  const ids = new Set();
  for (const { a } of tags) {
    if (a.id) {
      if (ids.has(a.id)) errors.push(`${label(file)}: duplicate id ${a.id}`);
      ids.add(a.id);
    }
  }
  // Include external script attributes separately from visible page content.
  const scripts = [...html.matchAll(/<script\b[^>]*>/gi)].map(([tag]) => ({ tag, name: "script", a: attrs(tag) }));
  pages.set(file, { html, markup, tags: [...tags, ...scripts], ids });
}

if (!pages.size) errors.push("dist contains no HTML pages");
for (const route of ["index.html", "work.html", "experience.html", "about.html", "resume.html", "contact.html", "projects/strobe-ai.html", "projects/crdc-capstone.html", "projects/predictive-risk.html", "projects/graph-optimisation.html", "projects/dataset-health.html", "projects/parallel-protein.html"]) {
  if (!pages.has(path.join(root, route))) errors.push(`Missing required route: ${route}`);
}

for (const [file, { html, markup, tags }] of pages) {
  const rel = label(file);
  const meta = (key, attr = "name") => tags.find(({ name, a }) => name === "meta" && a[attr]?.toLowerCase() === key)?.a.content?.trim();
  if (!/<title\b[^>]*>\s*[^<\s][^<]*<\/title>/i.test(markup)) errors.push(`${rel}: missing title`);
  if (!meta("description")) errors.push(`${rel}: missing meta description`);
  if (!tags.find(({ name, a }) => name === "html" && /^[a-z]{2,3}(?:-[a-z\d]+)*$/i.test(a.lang))) errors.push(`${rel}: missing or invalid html lang`);
  const viewport = meta("viewport");
  if (!viewport || !/width\s*=\s*device-width/i.test(viewport) || !/initial-scale\s*=\s*1(?:\.0)?(?:\s|,|$)/i.test(viewport)) errors.push(`${rel}: missing responsive viewport`);
  if (!tags.some(({ name }) => name === "main")) errors.push(`${rel}: missing main landmark`);
  const h1Count = tags.filter(({ name }) => name === "h1").length;
  if (h1Count !== 1) errors.push(`${rel}: expected exactly one h1, found ${h1Count}`);
  if (!tags.some(({ name, a }) => name === "a" && a.class?.split(/\s+/).includes("skip-link") && a.href?.startsWith("#"))) errors.push(`${rel}: missing skip link`);

  const canonical = tags.filter(({ name, a }) => name === "link" && a.rel?.split(/\s+/).includes("canonical"));
  if (canonical.length !== 1 || !canonical[0].a.href?.startsWith(`${siteOrigin}/`)) errors.push(`${rel}: missing or unexpected canonical URL`);
  else {
    const canonicalTarget = await checkReference(canonical[0].a.href, file, "canonical URL");
    if (canonicalTarget && canonicalTarget !== file) errors.push(`${rel}: canonical points to another page`);
    if (/[?#]/.test(canonical[0].a.href)) errors.push(`${rel}: canonical must not contain a query or fragment`);
  }
  for (const property of ["og:title", "og:description"]) {
    if (!meta(property, "property")) errors.push(`${rel}: missing ${property}`);
  }
  const ogImage = meta("og:image", "property");
  if (!ogImage || !ogImage.startsWith(`${siteOrigin}/`)) errors.push(`${rel}: missing or unexpected Open Graph image URL`);
  else {
    const imageTarget = await checkReference(ogImage, file, "Open Graph image", { fragment: false });
    if (imageTarget && !/\.(?:png|jpe?g|gif|webp|avif|svg)$/i.test(imageTarget)) errors.push(`${rel}: Open Graph image does not point to an image asset`);
  }
  const ogURL = meta("og:url", "property");
  if (ogURL && canonical.length === 1 && ogURL !== canonical[0].a.href) errors.push(`${rel}: og:url differs from canonical`);

  const visibleText = decodeHTML(markup.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ");
  const publicTextChecks = [
    [/\bplaceholder\b/i, "visible placeholder wording"],
    [/\b(?:content|asset|image|screenshot|evidence|approval|review)\s+pending\b|\bpending\s+(?:content|asset|image|screenshot|evidence|approval|review)\b/i, "visible pending publication wording"],
    [/needs cleanup|future screenshot|not ready/i, "visible unfinished wording"],
    [/\brubric\b|submission evidence/i, "assessment wording"],
    [/\bstudent (?:number|id)\b/i, "student-identifier wording"],
    [/\bJune\s+2027\b/i, "incorrect June 2027 graduation date"],
    [/Ã[\u0080-\u00bf]|â[€†‡]|Â[· ]/u, "UTF-8 text encoding corruption"],
  ];
  for (const [pattern, description] of publicTextChecks) if (pattern.test(visibleText)) errors.push(`${rel}: ${description}`);
  const sourceSafetyChecks = [
    [/C:\\Users\\/i, "local Windows path"],
    [/\blocalhost\b|127\.0\.0\.1/i, "localhost reference"],
    [/(?:AKIA|ASIA)[0-9A-Z]{16}/, "possible AWS access key"],
    [/arn:aws:/i, "AWS ARN"],
    [/\b\d{12}\b/, "possible AWS account ID"],
    [/\b(?:password|access[_ -]?key|secret[_ -]?key)\s*[=:]\s*["']?[^\s<>"']{4,}/i, "possible embedded credential"],
  ];
  for (const [pattern, description] of sourceSafetyChecks) if (pattern.test(html)) errors.push(`${rel}: ${description}`);

  for (const { name, a, tag } of tags) {
    if (name === "img" && !("alt" in a)) errors.push(`${rel}: image missing alt text: ${tag}`);
    if (("href" in a && !a.href.trim()) || ("src" in a && !a.src.trim())) errors.push(`${rel}: empty ${"href" in a ? "href" : "src"} on ${name}`);
    if ("href" in a) await checkReference(a.href, file, "href");
    if ("src" in a) await checkReference(a.src, file, "src");
    if ("poster" in a) await checkReference(a.poster, file, "poster");
    if (a.srcset && !a.srcset.trim().startsWith("data:")) {
      for (const candidate of a.srcset.split(",")) await checkReference(candidate.trim().split(/\s+/)[0], file, "srcset");
    }
  }
}

for (const file of files.filter((name) => /\.(?:css|js|mjs)$/.test(name))) {
  const source = await readFile(file, "utf8");
  if (file.endsWith(".css")) {
    const css = source.replace(/\/\*[\s\S]*?\*\//g, "");
    for (const match of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]*))\s*\)/gi)) {
      await checkReference(match[1] ?? match[2] ?? match[3], file, "CSS asset", { fragment: false });
    }
    for (const match of css.matchAll(/@import\s+["']([^"']+)["']/gi)) await checkReference(match[1], file, "CSS import");
  } else {
    for (const match of source.matchAll(/(?:\b(?:import|export)\s+(?:[^;\n]*?\s+from\s*)?|\bimport\s*\(\s*|\bnew\s+URL\s*\(\s*)["']((?:\.{1,2}\/|\/|https?:\/\/)[^"']+)["']/g)) {
      await checkReference(match[1], file, "JavaScript asset", { fragment: false });
    }
  }
}

if (errors.length) {
  console.error([...new Set(errors)].join("\n"));
  console.error(`Site check failed: ${new Set(errors).size} issue(s) across ${pages.size} HTML pages.`);
  process.exit(1);
}

console.log(`Checked ${pages.size} HTML pages, ${checkedReferences} local references, and ${checkedFragments} fragments: metadata, one h1, language/viewport, canonical/OG assets, links, CSS/JS assets, and public-content safety OK.`);
