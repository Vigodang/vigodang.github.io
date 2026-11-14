# Portfolio rebuild — delivery record

> Historical record of the first rebuild. The final refinement, current CV and real PDF supersede this status. See [refinement-report.md](refinement-report.md) and [refinement-evidence.md](refinement-evidence.md).

Completed 14 November 2026, Australia/Brisbane. Baseline `cd909b3`; local branch `codex/editorial-portfolio`. The live GitHub Pages site has not been changed.

## Before and after

The navy/neon landing page, terminal-style profile, numbered navigation and repeated card grid have become an ivory editorial folio: serif display type, forest actions, measured rules, generous space and different compositions for home, project index, biography and case studies. Original editable architecture diagrams distinguish each project. No reference app assets/code, stock photography, simulated UI screenshots or fabricated charts are used.

Shared templates and a single content source now produce eleven routes. Build tooling remains Node-only, with no new application dependencies. The existing GitHub Pages deployment workflow and `dist/` output are retained.

## Routes

Rebuilt, with existing paths preserved:

- `/` and `/index.html`
- `/work.html`
- `/about.html`
- `/experience.html`
- `/resume.html`
- `/contact.html`
- `/projects/strobe-ai.html`
- `/projects/predictive-risk.html`
- `/projects/graph-optimisation.html`
- `/projects/crdc-capstone.html`

Added: `/projects/dataset-health.html`, `/sitemap.xml`, `/robots.txt`.

Primary navigation is Work / About / Contact, plus Résumé. Experience remains accessible from About. Every case study has role/type, overview, architecture, three engineering decisions, evidence, limitations and public resources when available.

## Content corrections and boundaries

- Expected graduation is July 2027 everywhere in published content, from `content/site.js`.
- Exact supplied degree, minor and academic-recognition wording is included.
- Family-business employment, dates and duties are withheld because no newly supplied verified evidence establishes them. No barista employer, work-rights claim, Flight Centre affiliation or invented employment was added.
- CRDC is explicitly a QUT student team capstone, not an internship or paid role. Private corpus counts/years/results and partner data are absent.
- Strobe's 229 tests were reproduced locally, dated and confined to that project. Configured demo identity and documented stopped deployment are explicit limitations.
- Credit scoring is a student application; 30,000 rows and model families are source-supported. No freshly reproduced accuracy, fairness clearance, banking suitability or production use is claimed. Expanded-history provenance is identified as unverified.
- Dataset Health Analyzer is an attributed architecture note from the supplied brief. The controlled 40/40 and 1→4→1 observation is labelled user-reported and not independently reproduced. Original artefacts and contribution split are still needed before featuring it as a flagship.
- No redesigned CV PDF was supplied. The old PDF was removed from publication because it conflicts with the corrected content. There is a current HTML résumé with print/save-as-PDF action, and no dead download button. The old binary remains recoverable in Git history.
- Project dates and exact team allocations remain partially undocumented; the case studies do not invent them.
- Public repository licensing is incomplete; only links and original schematic artwork are published, not copied project code or private assets.

## Validation actually performed

On this Windows host `npm.cmd` was used because PowerShell blocks the unsigned `npm.ps1` shim. Equivalent CI commands are unchanged.

| Command / check | Result |
| --- | --- |
| `npm.cmd install --ignore-scripts` | Passed; no project dependencies or vulnerabilities |
| `npm.cmd run build` | Passed; 11 pages generated, copied to `dist/` |
| `npm.cmd run check` | Passed; 11 pages, 234 local references, 38 fragments |
| `node --check scripts/render.js` | Passed |
| `node --check content/site.js` | Passed |
| `node --check src/script.js` | Passed |
| `git diff --check` | Passed |
| Clean-checkout patch validation | Patch applied to a fresh baseline checkout; build/check passed and retired PDF absent from `dist/` |
| Checker fixture tests | Valid fixture passed; missing fragment, root escape, javascript URL, duplicate H1 and missing CSS asset detected |
| Published stale-date check | No June/Jun 2027 in `src/` or `dist/` |
| Route/browser matrix | All 11 routes at 1440, 1024, 768 and 390 CSS px: no horizontal overflow, broken loaded images or duplicate/missing H1 |
| Narrow-phone edge check | All 11 routes at 320px: no horizontal overflow |
| Keyboard | Mobile menu expands/closes, Escape returns focus, Tab skips closed links; project anchor navigation works |
| Primary contrast | Ink/paper 13.79:1; muted/paper 5.52:1; forest/paper 7.15:1; button 7.66:1; muted/sage 4.84:1 |
| SVGs | XML parsing and font-metric label bounds checked; 20px minimum labels in 900×560 source; full-size links on case pages |
| SEO | Unique title/description/canonical, OG PNG, English language, viewport, semantic landmarks, sitemap and robots |
| External links | Seven GitHub URLs returned HTTP 200; LinkedIn returned 999 (automated access blocked) |
| Print | Print CSS visually checked in a temporary screen rendition: no overflow, navigation/actions hidden, readable résumé layout |
| Reduced motion | CSS removes smooth scrolling and transitions under the preference; no scroll-dependent content or animation |

Strobe tests were run separately in the public project checkout at commit `5d3a43fa8103e663daadeca62e72f8dea98a3df0`: fresh `npm.cmd ci --ignore-scripts` and `npm.cmd test` in backend, ACP and MCP. Results: 145 + 67 + 17 = 229 passed; no failures/skips. This is local unit/integration-style evidence, not an AWS deployment test. See `project-evidence.md` for source links and exact scope.

The final static site is approximately 191 KB in total, with about 36 KB CSS and 1.3 KB JS, no remote fonts and no application dependencies. No Lighthouse score, screen-reader certification, cloud load test, mail delivery test or production uptime claim is made.

## Verification limits and remaining issues

- LinkedIn needs a normal human visit; the automated block does not establish a broken URL.
- Original screenshots and Dataset controlled-test artefacts were not available. Every visual is labelled schematic rather than presented as a screenshot.
- The redesigned CV is still needed for a direct PDF download. Old externally bookmarked PDF URLs will no longer resolve after deployment; current navigation links to the HTML résumé.
- Native paginated printing/PDF output and OS-level reduced-motion switching were not exercised. Print CSS was rendered in a temporary screen rendition, and the reduced-motion rule was source-checked. Full-page capture is unsupported in this browser, so screenshots are viewport captures and long pages were inspected in sections.
- Small cover diagrams are summaries on phones; each case provides alt text, a caption, prose and an open-full-size diagram link.
- No known broken internal links/assets or common-width overflow remains. Production canonical/social URLs will show the new content only after a deployment.

## Preview screenshots

The delivery outputs include `before-desktop.jpg`, `before-mobile.jpg`, `after-desktop.jpg`, `after-selected-desktop.jpg`, `after-laptop.jpg`, `after-tablet.jpg`, `after-mobile.jpg`, `after-mobile-work.jpg`, `case-study-desktop.jpg`, `case-study-diagram-desktop.jpg`, `case-study-mobile.jpg`, `case-study-evidence-mobile.jpg`, `about-tablet.jpg`, `contact-mobile.jpg` and `resume-print-style.jpg`. `responsive-checks.json`, `contrast-checks.json` and `external-links.json` record machine-readable observations.

## Deploy with the existing GitHub Pages workflow

1. Review the source or apply the supplied binary patch to a clean checkout at `cd909b3`: run `git apply --check portfolio-rebuild.patch`, then `git apply portfolio-rebuild.patch`.
2. Run `npm install --ignore-scripts`, `npm run build`, `npm run check`. Preview with `npm run serve`.
3. Commit the reviewed source changes to a branch. Merge through the normal repository process into `main`. Pushing `main` triggers the existing Pages workflow. No site-hosting migration is required.
4. In GitHub Actions, verify both build and deploy jobs finish successfully and the uploaded artifact is `dist/`. Ensure repository Pages is configured for GitHub Actions.
5. Visit `https://vigodang.github.io/` and each preserved route on desktop and phone. Confirm the July date, project diagrams, source/profile links, mailto, mobile menu and résumé. Check `/sitemap.xml`, `/robots.txt` and `/assets/og-image.png`. Confirm old cached CSS is refreshed.
6. If an approved PDF is later supplied, use the stable path and content switch documented in README, rebuild/check and redeploy.

## Rollback

Record the deployed commit SHA. If needed, use `git revert <rebuild-commit>` (or a reviewed revert PR) and push/merge that revert to `main`; the unchanged Pages workflow republishes the earlier source. For a multi-commit rollout, revert the reviewed range in a branch first. Avoid force-pushing or resetting shared history. Baseline `cd909b3` is the known original version; the retired PDF can be restored from its Git history if explicitly needed, but it contains the old facts.

## Exact file changes

See `changed-files.txt` alongside this report. It lists every added, modified and deleted source file against `cd909b3`; `dist/` is generated and Git-ignored. `.github/workflows/pages.yml` and `package.json` are unchanged.
