import { access, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("dist");
const htmlFiles = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(file);
  }
}

function attrs(tag) {
  const result = {};
  for (const match of tag.matchAll(/([a-zA-Z:-]+)\s*=\s*"([^"]*)"/g)) {
    result[match[1]] = match[2];
  }
  return result;
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function stripHash(href) {
  return href.split("#")[0];
}

await walk(root);

const errors = [];

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const rel = path.relative(root, file);
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${rel}: missing title`);
  if (!/<meta name="description" content="[^"]+">/.test(html)) {
    errors.push(`${rel}: missing meta description`);
  }
  if (!/<link rel="canonical" href="https:\/\/vigodang\.github\.io\/[^"]*">/.test(html)) {
    errors.push(`${rel}: missing or unexpected canonical URL`);
  }
  if (!/<meta property="og:title" content="[^"]+">/.test(html)) {
    errors.push(`${rel}: missing Open Graph title`);
  }
  if (!/<meta property="og:description" content="[^"]+">/.test(html)) {
    errors.push(`${rel}: missing Open Graph description`);
  }
  if (!/<main\b/.test(html)) errors.push(`${rel}: missing main landmark`);
  if (!/<h1\b/.test(html)) errors.push(`${rel}: missing h1`);
  if (!/class="skip-link"/.test(html)) errors.push(`${rel}: missing skip link`);

  const publicTextChecks = [
    [/placeholder/i, "visible placeholder wording"],
    [/pending/i, "visible pending wording"],
    [/needs cleanup/i, "visible cleanup wording"],
    [/future screenshot/i, "visible future screenshot wording"],
    [/not ready/i, "visible not-ready wording"],
    [/rubric/i, "assessment wording"],
    [/submission evidence/i, "assessment wording"],
    [/C:\\Users\\/i, "local Windows path"],
    [/localhost/i, "localhost reference"],
    [/127\.0\.0\.1/i, "localhost reference"],
    [/AKIA[0-9A-Z]{16}/, "possible AWS access key"],
    [/arn:aws:/i, "AWS ARN"],
    [/\b\d{12}\b/, "possible AWS account ID"],
    [/password/i, "password wording"],
    [/access key/i, "access-key wording"],
    [/student number/i, "student-number wording"],
    [/student id/i, "student-id wording"],
  ];

  for (const [pattern, label] of publicTextChecks) {
    if (pattern.test(html)) errors.push(`${rel}: ${label}`);
  }

  for (const tag of html.match(/<img\b[^>]*>/g) || []) {
    const a = attrs(tag);
    if (!("alt" in a)) errors.push(`${rel}: image missing alt text: ${tag}`);
    if (a.src && !a.src.startsWith("http")) {
      const target = path.resolve(path.dirname(file), stripHash(a.src));
      if (!(await exists(target))) errors.push(`${rel}: missing image ${a.src}`);
    }
  }

  for (const tag of html.match(/<a\b[^>]*>/g) || []) {
    const a = attrs(tag);
    const href = a.href || "";
    if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) continue;
    const clean = stripHash(href);
    const target = path.resolve(path.dirname(file), clean);
    const ok = await exists(target) || await exists(path.join(target, "index.html"));
    if (!ok) errors.push(`${rel}: broken internal link ${href}`);
  }
}

const distStat = await stat(root);
if (!distStat.isDirectory()) errors.push("dist is not a directory");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} HTML files: metadata, landmarks, image alt text, and internal links OK`);
