import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { inflateSync } from 'node:zlib';
import { resumeData, resumeFingerprint } from '../content/resume.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function decodeASCII85(value) {
  const input = value.replace(/\s+/g, '').replace(/^<~/, '').replace(/~>$/, '');
  const output = [];
  let digits = [];
  const flush = count => {
    while (digits.length < 5) digits.push(84);
    const number = digits.reduce((total, digit) => total * 85 + digit, 0);
    if (number > 0xffffffff) throw new Error('Invalid ASCII85 PDF stream');
    const bytes = [number >>> 24, (number >>> 16) & 255, (number >>> 8) & 255, number & 255];
    output.push(...bytes.slice(0, count));
    digits = [];
  };
  for (const char of input) {
    if (char === 'z' && !digits.length) { output.push(0, 0, 0, 0); continue; }
    const digit = char.charCodeAt(0) - 33;
    if (digit < 0 || digit > 84) throw new Error('Invalid ASCII85 PDF character');
    digits.push(digit);
    if (digits.length === 5) flush(4);
  }
  if (digits.length === 1) throw new Error('Truncated ASCII85 PDF stream');
  if (digits.length) flush(digits.length - 1);
  return Buffer.from(output);
}

function literalText(content) {
  const strings = [];
  for (let index = 0; index < content.length; index++) {
    if (content[index] !== '(') continue;
    let depth = 1;
    const bytes = [];
    for (index++; index < content.length && depth; index++) {
      let char = content[index];
      if (char === '\\') {
        char = content[++index];
        if (char === '\r' || char === '\n') { if (char === '\r' && content[index + 1] === '\n') index++; continue; }
        if (/[0-7]/.test(char || '')) {
          const octal = content.slice(index).match(/^[0-7]{1,3}/)[0];
          bytes.push(parseInt(octal, 8)); index += octal.length - 1; continue;
        }
        const escaped = { n: 10, r: 13, t: 9, b: 8, f: 12 }[char];
        bytes.push(escaped ?? char.charCodeAt(0)); continue;
      }
      if (char === '(') depth++;
      if (char === ')' && --depth === 0) break;
      bytes.push(char.charCodeAt(0));
    }
    strings.push(new TextDecoder('windows-1252').decode(Buffer.from(bytes)));
  }
  return strings.join(' ').replace(/\s+/g, ' ').trim();
}

// Parse only the controlled, unencrypted ReportLab/pypdf output used here.
// Actual first-page text is checked, rather than trusting an attestation in
// metadata; Node's built-in zlib keeps these CI checks independent of Python.
export function extractFirstPageText(source) {
  const objects = new Map([...source.matchAll(/(\d+)\s+0\s+obj\s*([\s\S]*?)\s*endobj/g)].map(match => [match[1], match[2]]));
  const catalog = [...objects.values()].find(value => /\/Type\s*\/Catalog\b/.test(value));
  const rootPages = catalog?.match(/\/Pages\s+(\d+)\s+0\s+R/)?.[1];
  const tree = objects.get(rootPages);
  const pageCount = Number(tree?.match(/\/Count\s+(\d+)/)?.[1]);
  if (!Number.isInteger(pageCount) || pageCount < 1 || pageCount > 2) throw new Error('Resume PDF must contain one or two pages');
  function firstPage(id) {
    const object = objects.get(id);
    if (!object) throw new Error('Missing PDF page object');
    if (/\/Type\s*\/Page\b/.test(object)) return object;
    const child = object.match(/\/Kids\s*\[\s*(\d+)\s+0\s+R/)?.[1];
    if (!child || child === id) throw new Error('Invalid resume PDF page tree');
    return firstPage(child);
  }
  const page = firstPage(rootPages);
  const contents = objects.get(page.match(/\/Contents\s+(\d+)\s+0\s+R/)?.[1]);
  const stream = contents?.match(/\bstream\r?\n([\s\S]*?)\r?\nendstream/);
  if (!stream) throw new Error('Missing first-page PDF content stream');
  let decoded = Buffer.from(stream[1], 'latin1');
  const filter = contents.match(/\/Filter\s*(?:\[([^\]]+)\]|\/(\w+))/);
  const filters = filter?.[1] ? [...filter[1].matchAll(/\/(\w+)/g)].map(match => match[1]) : filter?.[2] ? [filter[2]] : [];
  for (const name of filters) {
    if (name === 'ASCII85Decode') decoded = decodeASCII85(decoded.toString('ascii'));
    else if (name === 'FlateDecode') decoded = inflateSync(decoded);
    else throw new Error(`Unsupported resume PDF stream filter: ${name}`);
  }
  return literalText(decoded.toString('latin1'));
}

export function checkPageOneText(text) {
  const education = resumeData.education;
  const deepLearning = resumeData.skills.find(skill => /deep learning/i.test(skill.label));
  const required = [...['university', 'degree', 'minor', 'graduation', 'location', 'award'].map(key => education[key]), deepLearning?.label, 'PyTorch', 'TensorFlow'];
  for (const value of required) {
    if (!value || !text.includes(value.replace(/\s+/g, ' ').trim())) throw new Error(`Page one must contain the complete QUT education/date and deep-learning blocks; missing: ${value}`);
  }
}

export async function checkResumeFile(file) {
  const bytes = await readFile(file);
  if (bytes.length < 1024 || bytes.subarray(0, 5).toString('ascii') !== '%PDF-') throw new Error(`${file}: missing or invalid PDF asset`);
  const source = bytes.toString('latin1');
  if (!source.slice(-1024).includes('%%EOF')) throw new Error(`${file}: PDF is truncated (missing end marker)`);
  const hashes = [...source.matchAll(/\/SourceHash\s*\(([a-f0-9]{64})\)/g)].map(match => match[1]);
  if (hashes.length !== 1 || hashes[0] !== resumeFingerprint) {
    throw new Error(`${file}: PDF SourceHash does not match the shared resume source. Run npm run resume:build, inspect the result, then rebuild the site.`);
  }
  const cvHashes = [...source.matchAll(/\/SourceCVHash\s*\(([a-f0-9]{64})\)/g)].map(match => match[1]);
  if (cvHashes.length !== 1 || cvHashes[0] !== resumeData.sourceCV.sha256) throw new Error(`${file}: PDF does not identify the current supplied CV source hash`);
  const layoutVersion = source.match(/\/ResumeLayoutVersion\s*\((\d+)\)/)?.[1];
  if (layoutVersion !== String(resumeData.layout.version)) throw new Error(`${file}: PDF layout version is stale; regenerate the resume`);
  checkPageOneText(extractFirstPageText(source));
  console.log(`Resume PDF OK: ${path.relative(projectRoot, file)} (source/layout hashes and page-one education/deep learning verified)`);
}

async function main() {
  await checkResumeFile(path.join(projectRoot, 'src', resumeData.pdf));
  if (!process.argv.includes('--source-only')) {
    try {
      if ((await stat(path.join(projectRoot, 'dist'))).isDirectory()) await checkResumeFile(path.join(projectRoot, 'dist', resumeData.pdf));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      // A source checkout need not contain dist. If dist exists, its PDF is required.
      try {
        await stat(path.join(projectRoot, 'dist'));
        throw new Error('Built site is missing its resume PDF; run npm run build.');
      } catch (distError) {
        if (distError.code !== 'ENOENT') throw distError;
      }
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
