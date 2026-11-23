import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { profile } from './site.js';

const sourceCVPath = 'content/current-cv.tex';
const sourceCVText = readFileSync(new URL('./current-cv.tex', import.meta.url), 'utf8');
const sha256 = value => createHash('sha256').update(value, 'utf8').digest('hex');
const required = (value, field) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Resume source requires ${field}`);
  return value.trim();
};

// This small reader handles the supplied CV's text macros, not arbitrary TeX.
// Read balanced groups so nested emphasis and PH superscripts cannot truncate
// project bullets. Owner-approved contact updates belong in the source .tex.
function group(text, offset) {
  while (/\s/.test(text[offset] || '') && offset < text.length) offset++;
  if (text[offset] !== '{') throw new Error(`Expected CV text group at ${offset}`);
  const start = ++offset;
  let depth = 1;
  while (offset < text.length) {
    if (text[offset] === '\\') { offset += 2; continue; }
    if (text[offset] === '{') depth++;
    if (text[offset] === '}' && --depth === 0) return { value: text.slice(start, offset), end: offset + 1 };
    offset++;
  }
  throw new Error('Unclosed group in current-cv.tex');
}

function calls(text, macro, count) {
  const matches = [];
  const pattern = new RegExp(`\\\\${macro}\\b`, 'g');
  for (const match of text.matchAll(pattern)) {
    let end = match.index + match[0].length;
    const args = [];
    for (let index = 0; index < count; index++) {
      const parsed = group(text, end);
      args.push(parsed.value);
      end = parsed.end;
    }
    matches.push({ start: match.index, end, args });
  }
  return matches;
}

function plain(tex) {
  let result = '';
  for (let index = 0; index < tex.length;) {
    const char = tex[index];
    if (char === '{') { const parsed = group(tex, index); result += plain(parsed.value); index = parsed.end; continue; }
    if (char === '}' || char === '$') { index++; continue; }
    if (char !== '\\') { result += char === '~' ? ' ' : char; index++; continue; }
    index++;
    if (tex[index] === '\\') {
      result += ' '; index++;
      if (tex[index] === '[') { const end = tex.indexOf(']', index); index = end < 0 ? tex.length : end + 1; }
      continue;
    }
    if (/[&#%_${} ]/.test(tex[index] || '')) { result += tex[index++]; continue; }
    const command = tex.slice(index).match(/^[A-Za-z]+/)?.[0];
    if (!command) { index++; continue; }
    index += command.length;
    if (tex[index] === '*') index++;
    const literal = { textbar: ' | ', textbullet: ' | ', rightarrow: ' -> ', times: 'x' }[command];
    if (literal) { result += literal; continue; }
    if (['textbf', 'textit', 'textrm', 'textsuperscript'].includes(command)) {
      const parsed = group(tex, index);
      const value = plain(parsed.value);
      result += command === 'textsuperscript' && value === '2' ? '\u00b2' : value;
      index = parsed.end; continue;
    }
    if (['href', 'textcolor', 'fontsize'].includes(command)) {
      const first = group(tex, index), second = group(tex, first.end);
      if (command !== 'fontsize') result += plain(second.value);
      index = second.end; continue;
    }
    if (['hspace', 'vspace', 'color', 'addfontfeatures'].includes(command)) { index = group(tex, index).end; continue; }
    // Font/paragraph controls have no textual representation.
  }
  return result.replace(/--+/g, '-').replace(/\s+/g, ' ').trim();
}

const body = sourceCVText.slice(sourceCVText.indexOf('\\begin{document}') + '\\begin{document}'.length, sourceCVText.lastIndexOf('\\end{document}'));
const sections = calls(body, 'ressection', 1).map((call, index, all) => ({
  title: plain(call.args[0]),
  text: body.slice(call.end, all[index + 1]?.start ?? body.length),
}));
const section = title => required(sections.find(value => value.title === title)?.text, `CV section ${title}`);
const summary = plain(section('PROFILE'));
const skills = section('TECHNICAL CAPABILITIES').split(/\\\\(?:\[[^\]]*\])?/).filter(value => /\\textbf\b/.test(value)).map(value => {
  const label = calls(value, 'textbf', 1)[0];
  return { label: plain(label.args[0]), items: plain(value.slice(label.end)) };
});

// Fail clearly if shared website facts drift from the current CV's exact text.
if (required(profile.summary, 'profile.summary') !== summary) throw new Error('profile.summary must match current-cv.tex');
const comparableSkills = values => values.map(value => ({ label: value.label.toLowerCase(), items: value.items }));
if (JSON.stringify(comparableSkills(profile.skills || [])) !== JSON.stringify(comparableSkills(skills))) throw new Error('profile.skills must match current-cv.tex');

const projectSource = section('SELECTED ENGINEERING & DATA PROJECTS');
const headings = calls(projectSource, 'projectheading', 3);
if (headings.length !== 4) throw new Error(`Expected the supplied CV's four projects, found ${headings.length}`);
const slugs = {
  'Dataset Health Analyzer': 'dataset-health',
  'AI-Assisted Research Synthesis': 'crdc-capstone',
  'Predictive Credit Scoring': 'predictive-risk',
  'Parallel Protein Signature Generation': 'parallel-protein',
};
const projects = headings.map((heading, index) => {
  const [title, subtitle = ''] = plain(heading.args[0]).split(' | ');
  const [period, ...context] = plain(heading.args[1]).split(' | ');
  const role = context.join(' | ');
  if (!slugs[title]) throw new Error(`Unmapped current-CV project: ${title}`);
  const technologies = plain(heading.args[2]);
  const bullets = calls(projectSource.slice(heading.end, headings[index + 1]?.start ?? projectSource.length), 'bitem', 1).map(call => plain(call.args[0]));
  if (!bullets.length) throw new Error(`No CV bullets for ${title}`);
  return { slug: slugs[title], title, subtitle, type: role, period, role, technologies: slugs[title] === 'dataset-health' ? technologies.replace(/\bPython\b/, 'JavaScript/Node.js') : technologies, bullets };
});

const additional = section('ADDITIONAL ANALYTICAL WORK').split(/\\\\(?:\[[^\]]*\])?/).filter(value => /\\textbf\b/.test(value)).map(value => {
  const title = calls(value, 'textbf', 1)[0];
  return { title: plain(title.args[0]).replace(/:$/, ''), text: plain(value.slice(title.end)) };
});
if (additional.length !== 2) throw new Error('Expected the supplied CV\'s two additional analytical-work entries');
const educationSource = section('EDUCATION & RECOGNITION');
const educationLabels = calls(educationSource, 'textbf', 1);
const universityLine = educationSource.match(/\\fontsize\{10\}\{12\}([\s\S]*?)\s*&/)?.[1];
const degreeLine = plain(required(educationSource.match(/\\fontsize\{9\.25\}\{12\}([\s\S]*?)\s*&/)?.[1], 'CV degree line')).split(' | ');
const graduation = required(educationSource.match(/Expected\s+([A-Za-z]+\s+\d{4})/)?.[1], 'CV graduation');
const degree = required(degreeLine[0], 'CV degree');
const minor = required(degreeLine[1], 'CV minor').replace(/\s+minor$/, '');
for (const [field, value] of [['degree', degree], ['minor', minor], ['graduation', graduation]]) {
  if (profile[field] !== value) throw new Error(`profile.${field} must match current-cv.tex`);
}
const nameLine = body.match(/\\fontsize\{20\.8\}\{23\}([\s\S]*?)\s*&/)?.[1];
const name = plain(required(nameLine, 'CV name heading'));
if (name !== required(profile.fullName, 'profile.fullName')) throw new Error('profile.fullName must match current-cv.tex');
const phone = required(profile.phone, 'profile.phone');
if (!sourceCVText.includes(phone)) throw new Error('profile.phone must match current-cv.tex');
const location = required(profile.locationShort, 'profile.locationShort');
if (!sourceCVText.includes(location)) throw new Error('profile.locationShort must match current-cv.tex');
const pdf = required(profile.pdf, 'profile.pdf');
if (!/^assets\/[A-Za-z0-9_.-]+\.pdf$/.test(pdf)) throw new Error('profile.pdf must be a PDF filename directly under assets/');

export const resumeData = {
  schemaVersion: 3,
  sourceCV: {
    path: sourceCVPath,
    sha256: sha256(sourceCVText),
    corrections: [{ field: 'projects.dataset-health.technologies', original: 'Python', corrected: 'JavaScript/Node.js', reason: 'Retained backend and worker source use JavaScript/Node.js. Python remains in general capabilities.' }],
  },
  layout: {
    version: 3,
    educationPlacement: 'page-one-before-technical-capabilities',
    pageOneRequiredBlocks: ['education-and-recognition', 'deep-learning-capabilities'],
  },
  pdf, name,
  displayName: required(profile.name, 'profile.name'),
  headline: plain(required(body.match(/DATA SCIENCE UNDERGRADUATE[\s\S]*?APPLIED AI/)?.[0], 'CV positioning headline')),
  location, phone,
  email: required(profile.email, 'profile.email'),
  website: 'https://vigodang.github.io/',
  github: required(profile.github, 'profile.github'),
  linkedin: 'https://linkedin.com/in/vigodang',
  reviewed: required(profile.reviewed, 'profile.reviewed'),
  summary, skills, projects, additional,
  education: {
    university: plain(required(universityLine, 'CV university heading')),
    degree, minor, graduation,
    location: required(profile.location, 'profile.location'),
    award: plain(educationSource.slice(educationLabels[0].end)),
  },
};

// The exact supplied TeX source hash is part of this data, so even a source-only
// edit invalidates stale PDF metadata and requires a deliberate regeneration.
export const resumeFingerprint = sha256(JSON.stringify(resumeData));
