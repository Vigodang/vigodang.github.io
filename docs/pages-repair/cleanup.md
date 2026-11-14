# Repair inventory and cleanup

Final-ZIP authority: `portfolio-final-local.zip`, SHA-256 `0d9a2d0add821b541f9b3785626b127b1279472dfd15409f246b16209a5418a3`. Only its `portfolio/` source tree is authoritative; generated `dist/` is excluded from this source inventory.

## What was removed

Only `src/assets/resume-truong-lieu-dong-vigo-dang.pdf` was removed. It was a **119,895-byte legacy CV**, absent from the authoritative ZIP and unreferenced by runtime source. The sole tracked-text reference is the historical deletion entry in `docs/changed-files.txt:42`; that historical evidence is retained.

The updated **7,184-byte** `src/assets/Vigo_Dang_Resume_2026_Redesigned.pdf` remains byte-identical to the authoritative ZIP. Current HTML résumé navigation and the direct PDF actions remain intact.

## Limited release changes

| Path | Purpose |
| --- | --- |
| `.github/workflows/pages.yml` | Build and check main pushes and pull requests; upload only checked dist. Deploy main only outside pull requests, with Pages/OIDC write permissions scoped to the deploy job and concurrency isolated per ref. |
| `.gitignore` | Keep generated dist, node_modules and Python cache/bytecode out of source control. |
| `README.md` | Document the single src-to-dist release path and link the current repair/deployment guidance. |
| `package.json` | Add release-integrity checks to npm run check without changing the dependency-free build. |
| `scripts/build.js` | Generate a dist release manifest containing required asset hashes and optional full Actions commit SHA. |
| `scripts/check-release.js` | New guard for all approved routes, stylesheet order, theme, portraits, source/build hashes, manifest and Pages workflow. |
| `scripts/release-assets.js` | New shared list and SHA-256 hashing of the required stylesheets, client script, portraits and current PDF. |

New documentation is grouped under `docs/pages-repair/`: this cleanup note and `inventory.json`; `report.md` and `deployment.md` provide the final findings, verification and rollback procedure. Existing documentation, historical reports and technical evidence are preserved.

## What remains exact

- All **52 protected source files** match the final ZIP byte-for-byte: **22 HTML pages, 3 stylesheets, the client JavaScript, 20 current assets**, public content/CV data, CV TeX and the rendering template.
- All diagram, measured-chart, screenshot, portrait, CSV and current PDF bytes are preserved. The CV TeX source is also byte-exact.
- There is no CSS redesign or text-normalization change. The pre-edit audit found every common file already identical in the checkout and Git-index blob; all three CSS files were already correct.
- The pipeline now checks the approved source-to-dist artifact and produces release provenance; a generated `dist/release-manifest.json` is intentionally outside the source ZIP comparison.

## Categorization

**KEEP: 81**, **UPDATE: 11**, **REMOVE: 1**, **INVESTIGATE: 0**. `inventory.json` records every baseline path, current added path and the single removal. New repair documentation is categorized as UPDATE, not as a source-design change.

Final build, HTTP and browser results are recorded in `report.md`; release and rollback instructions are in `deployment.md`. This inventory makes no claim that a new deployment has occurred. No push or deployment is authorized by this documentation.
