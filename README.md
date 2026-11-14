# Vigo Dang — Measured work

A small, dependency-free editorial portfolio. Node 22 builds semantic static HTML for the existing GitHub Pages workflow.

The final local release fixes and verification are documented in `docs/final-release-report.md`. The earlier portrait/layout pass is in `docs/portrait-layout-report.md`, and the corrected portrait history is in `docs/portrait-provenance.md`. Earlier refinement reports preserve the prior evidence/CV work.

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

All original HTML URLs remain. New case studies include `projects/dataset-health.html` and `projects/parallel-protein.html`. Dedicated `visuals/` pages display diagrams, charts and real screenshots at original size, with accessible zoom controls and native keyboard/touch scrolling. No framework or remote font dependency was introduced.

## Résumé

The selectable-text PDF is `src/assets/Vigo_Dang_Resume_2026_Redesigned.pdf`. A single header Résumé link opens the HTML résumé; direct PDF downloads remain on the résumé, About, Contact and footer. QUT education and expected July 2027 graduation appear on PDF page 1. The PDF preserves the current supplied CV's four-project content, Deep Learning/PyTorch/TensorFlow skills, analytical work and phone number. The Dataset project stack corrects Python to JavaScript/Node.js to match the inspected implementation.

To regenerate after a CV edit, install ReportLab in a Python environment, set `PORTFOLIO_PYTHON` if needed, then run `npm run resume:build`. Inspect every rendered page and extracted text, then run `npm run build` and `npm run check`. The deployed site and CI need only Node: Python generates the committed asset, and the check rejects a stale PDF. See `docs/resume-provenance.md` for the exact workflow and limitations.

## Evidence and deployment

Read `docs/refinement-report.md` and `docs/refinement-evidence.md` for the final change log, current evidence, verification and deployment readiness. The original `docs/portfolio-audit.md`, `docs/project-evidence.md` and `docs/delivery.md` preserve the initial rebuild's history; later refinement findings supersede their earlier Dataset/PDF gaps. `docs/design-system.md` remains the approved visual direction.

`.github/workflows/pages.yml` is unchanged. It installs, builds, checks, uploads `dist/`, then deploys GitHub Pages on pushes to `main` or manual dispatch. Neither the rebuild nor this refinement has been pushed or deployed. User approval is required before either action.
