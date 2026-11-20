# Vigo Dang — Vigo After Dark portfolio

A professional portfolio with an interactive 3D ID badge and diagonal cloth lanyard in the homepage hero. Node 22 renders semantic static pages for GitHub Pages. The portfolio uses forest green, warm cream, orange accents and bold self-hosted Inter. The existing cutout portrait remains the hero fallback when graphics are unavailable. Header links lead directly to the native hero; the separate After Dark experience at `/play/` remains available from the footer and returns to the main portfolio.

Current release-check findings are in [the repair report](docs/pages-repair/report.md); [deployment and verification](docs/pages-repair/deployment.md) describes the single publishing path. The cream/Georgia audit and inventory dated 14 November 2026 are historical, superseded records, not the visual or file-deletion authority for this release.

## Build and preview

Run from the repository root:

```sh
npm install --ignore-scripts
npm run build
npm run check
npm run serve
```

On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`. Preview the portfolio at `http://localhost:4173/` and the badge experience at `http://localhost:4173/play/`. Python is needed only for this local server; the build and checks use Node. Stop source edits before running the release mutation suite, which copies matching source/build fixtures.

## Source ownership

- `content/site.js` owns public profile facts, project copy and evidence boundaries. `content/current-cv.tex` preserves the supplied CV; `content/resume.js` supplies résumé content with the documented Dataset stack correction.
- `scripts/render.js` owns shared navigation, footer, editorial pages and case-study templates. It generates 22 editorial HTML pages, sitemap and robots into `src/`; build then copies `src/` into a fresh `dist/`. Edit templates/content rather than generated editorial HTML.
- `src/hero-badge.js` loads only on the homepage and mounts the native badge canvas, controls and a dialog for five chapters. It reuses the local scene factory and chapter content under `play/`; the hero variant leaves the separate Play entry available. Project, demo, résumé and contact destinations remain accessible without manipulating the 3D card.
- Editorial styles load in this order: `styles.css`, `layout-refinement.css`, `case-refinement.css`, `portfolio-brand.css`, `portfolio-pages.css`. The last two translate the After Dark identity into a professional reading surface. Legacy base tokens remain part of the cascade; screen appearance is determined by the complete ordered stylesheet set.
- `scripts/render-orbit.js` generates `src/play/index.html` from `src/play/orbit-content.js`, including complete static chapter content. Its only stylesheet is `play/orbit.css`, with `play/orbit.js` as the module entry. The controller dynamically loads `orbit-scene.js`; pinned Three 0.187.0 modules and their MIT license are self-hosted in `play/vendor/`.
- The new scene uses the existing photograph on a double-sided portfolio ID card with a slotted body, orange edge, silver/graphite clip and two printed textile ribbons. The camera stays fixed while the card rotates through 360 degrees. Drag, arrow keys and Turn card rotate it; tapping the card flips it. The reverse contains five physical chapter rows: Work, Demos, Skills, About and Contact. The same chapters remain immediately available from ordinary HTML navigation. It is a personal portfolio design, not an employment credential or a reconstructed human scan. The older `portrait-shape.js` source is retained but no longer imported.
- Pause, reduced motion and complete ID-card/static chapter fallbacks remain available. The replacement entry has no orbital ornaments, gold materials, missions, scores, unlock gates or audio.
- The 23 earlier game files other than the replaced HTML entry remain unchanged and dormant, including all artwork, audio modules and mission source. The prior entry is recoverable from commit `3e66a712c408dbc385193dfd51cb533ae724426f`. The new page does not import that runtime.
- `src/assets/` retains genuine project evidence, portraits, both résumé PDFs and the local Inter font/license. Runtime WebP artwork and fonts are required source assets. `dist/`, dependencies and caches are generated output and remain untracked.

There are **23 built HTML routes: 22 editorial pages plus `play/index.html`**. The release manifest hashes **68 non-HTML files from `src/`**, including the homepage badge module, eight explorer assets, all preserved legacy assets and both PDFs. `dist/release-manifest.json` adds those hashes and the Actions `GITHUB_SHA` (null locally); the generated manifest is not committed as application source.

## Checks and résumé

`npm run check` includes local-link/metadata checks, actual current-PDF provenance checks, the 16 retained game/audio/physics/presentation tests and release/link mutation tests. The legacy tests cover preserved modules; browser checks validate the badge experiences. The release guard checks the exact route set, separate editorial/explorer stylesheets, approved portfolio palette and portrait fallback markup, homepage-only badge module and canvas/dialog hooks, required self-hosted vendor files, source/build asset identity, manifest provenance and the checked `dist/` workflow. Entry fixtures reject missing, duplicated or malformed modules, a hero runtime on another editorial page and accidental legacy runtime loading. Route failures distinguish missing and unexpected HTML paths.

The primary selectable-text résumé is `src/assets/Vigo_Dang_Resume_2026_Redesigned.pdf`; the existing `src/assets/resume-truong-lieu-dong-vigo-dang.pdf` URL is also preserved. The header opens the HTML résumé, and direct current-PDF downloads remain available without playing. To regenerate the current PDF after a CV edit, follow [résumé provenance](docs/resume-provenance.md), inspect every rendered page and extracted text, then rebuild and check. CI uses the committed PDF and needs no PDF-generation dependency.

## Hiring focus and live demos

The portfolio leads with Data and Cloud Engineering internship/graduate opportunities. About introduces Vigo’s self-described listening, feedback and learning habits and his Biên Hòa/Brisbane context. The 20 November editorial design replaces the earlier pale-mint portfolio while preserving project evidence, original portraits, résumé and the separate game.

Three deployed interfaces are linked from the homepage, project index and case studies:

- [Dataset Health Analyzer](https://vigodang.github.io/dataset-health-analyzer-demo/) computes real CSV analysis locally in the browser, with synthetic examples, eight report views and JSON exports. It does not run the original AWS services or reproduce the archived load experiment.
- [Strobe AI](https://vigodang.github.io/strobe-ai-demo/#/login) is an interactive browser-only social/assistant demo. Sign-in, assistant replies and tool activity are simulated; no AWS or live AI model is connected. Original cloud engineering evidence remains separate.
- [CRDC Research Assistant](https://crdc-research-assistant.jazzyactor4.chatgpt.site/) demonstrates citations and exports using hand-authored reports and synthetic sources. It does not run AI.

The homepage introduces Vigo through the hanging portfolio badge, with five short chapters linking to the same six project stories, three public demos, résumé and contact. After Dark retains its separate `/play/` experience. Both express Vigo’s self-described listening and learning habits without scoring personality or claiming live AI. See [the portfolio art direction and demo boundaries](docs/portfolio-editorial-direction.md). Earlier game and photographic-relief notes describe the preserved, superseded versions.

## Evidence and deployment

Project evidence and its limits remain in the case studies and [evidence notes](docs/refinement-evidence.md). Older rebuild, portrait, release and design reports describe their dated states; their cream palette, three-stylesheet counts and historical PDF-removal decision are superseded by the approved After Dark release.

`.github/workflows/pages.yml` is the only publishing workflow. Main pushes and pull requests install, build, check and upload `dist/`; pull requests validate without publishing. Only `main` may deploy, on push or manual dispatch, with Pages/OIDC write permissions scoped to deployment. Settings → Pages → Build and deployment → Source uses **GitHub Actions**. [Pull request #1](https://github.com/Vigodang/vigodang.github.io/pull/1) carries the repair; its corrected CI and any subsequent deployment must be verified from their actual run results. No successful corrected run is asserted by these instructions.
