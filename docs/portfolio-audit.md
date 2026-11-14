# Portfolio audit

> Historical baseline audit, retained for traceability. Its initial Dataset/PDF availability statements are not current: original Dataset evidence and the user's current CV were later supplied. See [refinement-evidence.md](refinement-evidence.md) for the updated evidence and provenance boundaries.

Audited 14 November 2026. Source baseline: `cd909b3` (`main`).

## Actual repository and deployment

The repository contains ten HTML routes under `src/`, one stylesheet, one script, four SVG project diagrams, a favicon and an existing résumé PDF. There are no framework dependencies. `scripts/build.js` copies `src/` to `dist/`. `.github/workflows/pages.yml` installs with scripts disabled, builds, checks, and publishes `dist/` on pushes to `main`. Baseline `npm.cmd install --ignore-scripts`, `npm.cmd run build` and `npm.cmd run check` passed. All original routes will remain.

## Specific problems

- The first screen repeats broad technology categories while hiding project evidence below a tall terminal-like panel. Navy, cyan glow, gradient type, numbered navigation and equal rectangular cards obscure the individual work.
- Ten pages duplicate navigation, footer, identity and educational information. Four source pages repeat June 2027. The old PDF repeats June/Jun 2027 too.
- Strobe's 229 tests are used as a site-wide profile metric, without a date or a clear separation from deployment status. A fresh public-source audit reproduced all 229 locally on 14 November 2026; this is useful case-study evidence, not a production guarantee.
- Experience presents a named family-business employer, dates and duties without newly supplied verified evidence. The public PDF repeats the same material; repetition is not independent verification. Exclude it until confirmed.
- CRDC is a QUT team capstone with an industry partner. The existing page discloses corpus counts and years without evidence of public-release approval. Retain the generic technical approach and individual scope; remove corpus/results specifics.
- Dataset Health Analyzer has no original documentation or screenshots in this repository. The user's brief supplies its architecture and controlled-test observation. A bounded case study can attribute that evidence explicitly; do not present it as independently reproduced or production usage.
- Existing diagrams are source-authored schematics, not product screenshots. Replace their styling and label their status visibly. No project screenshots are available in the checkout.
- Existing checks cover HTML links and basic metadata but omit CSS/JS assets, fragment targets, stale dates and uniqueness of the main heading.
- Navigation gives six destinations equal emphasis, while About and Experience repeat the home pitch. Simplify the main navigation to Work, About and Contact, with a separate résumé action. Retain Experience as a supporting educational record.

## What remains

Keep the static architecture, lightweight JS, semantic landmarks, direct email, public profiles, existing URL paths and GitHub Pages workflow. Keep technical depth in Strobe, credit scoring and graph optimisation. Preserve careful confidentiality boundaries around CRDC.

## Reference principles

Common Ground is an interactive mobile application, not a portfolio template. Its cream/espresso/forest palette, consistent label hierarchy, material borders and stable action language are useful principles. Translate them into editorial typography, broad ruled rows and original engineering diagrams. Do not reuse its playful fonts, phone framing, coffee branding, screens, icons, assets or code.

## Evidence and editorial decisions

- Graduation: July 2027, per the user's supplied brief, centralized in `content/site.js`.
- Education/minor and 2024 Executive Dean's Commendation: supplied by user; use exact bounded wording.
- Strobe: public repository tests reproduced by a separate audit; details and commit recorded in `docs/project-evidence.md`.
- Credit scoring: 30,000 records and three named model families verified against public README/code. No fairness, banking suitability, production or automated-coverage claim.
- Graph: public implementation and technical report, within an assignment-provided harness; no invented performance measurement.
- Dataset: explicitly user-described architecture and controlled burst; original logs/screenshots remain an evidence question.
- Omit protein/PH²/GLMM secondary pages: no original artefacts in this checkout and enough stronger cases already exist.
- Withhold the old PDF from publication. Retain its Git history; use a consistent printable HTML résumé until the redesigned PDF is supplied. No dead download links.

Baseline screenshots were captured at desktop and mobile sizes in the task outputs. Browser verification and final limitations are recorded in `docs/delivery.md`.
