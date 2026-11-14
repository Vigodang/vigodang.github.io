import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { resumeData, resumeFingerprint } from '../content/resume.js';
import { checkResumeFile } from './check-resume.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const python = process.env.PORTFOLIO_PYTHON || 'python';
const result = spawnSync(python, [path.join(projectRoot, 'scripts', 'create_resume.py')], {
  cwd: projectRoot,
  input: JSON.stringify({ data: resumeData, fingerprint: resumeFingerprint }),
  encoding: 'utf8',
  maxBuffer: 1024 * 1024,
  env: { ...process.env, PYTHONUTF8: '1' },
});

if (result.error) throw new Error(`Cannot run ${python}: ${result.error.message}. Set PORTFOLIO_PYTHON to a Python executable with reportlab and pypdf.`);
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.status !== 0) process.exit(result.status || 1);

const target = path.join(projectRoot, 'src', resumeData.pdf);
await checkResumeFile(target);
console.log(`Resume source SHA-256: ${resumeFingerprint}`);
console.log('The PDF is committed as a static asset; ordinary site build/check requires Node.js only.');
