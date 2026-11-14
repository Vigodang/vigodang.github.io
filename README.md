# Vigo Dang — Measured work

A small, dependency-free editorial portfolio. Node 22 builds semantic static HTML for the existing GitHub Pages workflow.

The current repository/deployment audit is in `docs/pages-repair/report.md`; the single release procedure, verification and rollback commands are in `docs/pages-repair/deployment.md`. The earlier final release and portrait passes are documented in `docs/final-release-report.md` and `docs/portrait-layout-report.md`. Corrected portrait history is in `docs/portrait-provenance.md`. Earlier reports preserve the state and evidence at the time of those passes.

## Build and preview

```sh
npm install --ignore-scripts
npm run build
npm run check
npm run serve
```

On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`. Preview at `http://localhost:4173`. The serve command needs Python; the build and checker use Node only.

## Edit the site

- `content/site.js` is the source of public profile facts, homepage positioning, project copy and evidence boundaries.
- `content/current-cv.tex` preserves the current CV supplied by Vigo. `content/resume.js` parses its content for both the HTML résumé and PDF, with the documented Dataset project-stack correction.
- `scripts/render.js` contains shared navigation, footer, page and case-study templates.
- `src/styles.css` retains the approved base design. `src/layout-refinement.css` groups the portrait, home/About, résumé and contact layouts; `src/case-refinement.css` scopes the case/viewer refinements. `src/script.js` and `src/assets/` contain the progressive enhancements and local imagery.
- `npm run build` renders the HTML into `src/`, regenerates sitemap/robots, then copies `src/` to `dist/`. Do not hand-edit generated HTML; edit the templates/content and rebuild.
- `scripts/check.js` validates routes, internal references/fragments, metadata, local assets, headings, encoding and public-content hygiene. `scripts/check-resume.js` verifies that the committed PDF matches its exact content-source fingerprint.
- `scripts/check-release.js` requires all three stylesheets in order, approved theme tokens, the complete page set, portrait/PDF assets, matching source/build hashes and the checked `dist/` Pages artifact. The generated `dist/release-manifest.json` records required asset hashes and the Actions commit SHA (null for a local build).

`src/index.html` is the sole repository homepage path; it is generated from `content/site.js` and `scripts/render.js`, then copied to `dist/index.html`. Do not maintain a separate root or nested `portfolio/index.html`, or copy the ZIP's `dist/` back into source. All original HTML URLs remain. Dedicated `visuals/` pages display diagrams, charts and real screenshots at original size, with accessible zoom controls and native keyboard/touch scrolling. No framework or remote font dependency was introduced.

## Résumé

The selectable-text PDF is `src/assets/Vigo_Dang_Resume_2026_Redesigned.pdf`. A single header Résumé link opens the HTML résumé; direct PDF downloads remain on the résumé, About, Contact and footer. QUT education and expected July 2027 graduation appear on PDF page 1. The PDF preserves the current supplied CV's four-project content, Deep Learning/PyTorch/TensorFlow skills, analytical work and phone number. The Dataset project stack corrects Python to JavaScript/Node.js to match the inspected implementation.

To regenerate after a CV edit, install ReportLab in a Python environment, set `PORTFOLIO_PYTHON` if needed, then run `npm run resume:build`. Inspect every rendered page and extracted text, then run `npm run build` and `npm run check`. The deployed site and CI need only Node: Python generates the committed asset, and the check rejects a stale PDF. See `docs/resume-provenance.md` for the exact workflow and limitations.

## Evidence and deployment

Read `docs/refinement-report.md` and `docs/refinement-evidence.md` for the final change log, current evidence, verification and deployment readiness. The original `docs/portfolio-audit.md`, `docs/project-evidence.md` and `docs/delivery.md` preserve the initial rebuild's history; later refinement findings supersede their earlier Dataset/PDF gaps. `docs/design-system.md` remains the approved visual direction.

`.github/workflows/pages.yml` is the only publishing workflow. It installs, builds, checks and uploads `dist/`. Pull requests validate without publishing; only `main` can deploy, on a push or explicit manual dispatch. Repository Settings → Pages → Build and deployment → Source must be **GitHub Actions**. Current remote `main` at `ad4e92c` was published before this repair audit. This repair branch remains local and has not been pushed or deployed. See the current deployment guide before publishing.
