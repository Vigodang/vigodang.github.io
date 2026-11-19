# Vigo Dang — Vigo After Dark portfolio

A dependency-free professional portfolio with a separate interactive night-market experience at `/play/`. Node 22 renders semantic static pages for GitHub Pages. The approved professional surface uses a cool mist canvas, navy text, teal/mint accents and self-hosted Inter. The Play page has a light shell around the original night artwork and game runtime.

Current release-check findings are in [the repair report](docs/pages-repair/report.md); [deployment and verification](docs/pages-repair/deployment.md) describes the single publishing path. The cream/Georgia audit and inventory dated 14 November 2026 are historical, superseded records, not the visual or file-deletion authority for this release.

## Build and preview

Run from the repository root:

```sh
npm install --ignore-scripts
npm run build
npm run check
npm run serve
```

On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`. Preview the portfolio at `http://localhost:4173/` and the game at `http://localhost:4173/play/`. Python is needed only for this local server; the build and checks use Node.

## Source ownership

- `content/site.js` owns public profile facts, project copy and evidence boundaries. `content/current-cv.tex` preserves the supplied CV; `content/resume.js` supplies résumé content with the documented Dataset stack correction.
- `scripts/render.js` owns shared navigation, footer, editorial pages and case-study templates. It generates 22 editorial HTML pages, sitemap and robots into `src/`; build then copies `src/` into a fresh `dist/`. Edit templates/content rather than generated editorial HTML.
- Editorial styles load in this order: `styles.css`, `layout-refinement.css`, `case-refinement.css`, `portfolio-brand.css`, `portfolio-pages.css`. The last two translate the After Dark identity into a professional reading surface. Legacy base tokens remain part of the cascade; screen appearance is determined by the complete ordered stylesheet set.
- `src/play/index.html` is the separate game source. Its ordered styles are `play/styles.css`, `play/briefing.css`, `play/missions.css`, `play/evidence.css`, `play/after-dark.css`. `play/game.js` imports the approved `after-dark-game.js`; shared physics, robot drawing, project content and briefing modules remain required dependencies.
- `src/assets/` retains genuine project evidence, portraits, both résumé PDFs and the local Inter font/license. Runtime WebP artwork and fonts are required source assets. `dist/`, dependencies and caches are generated output and remain untracked.

There are **23 built HTML routes: 22 editorial pages plus `play/index.html`**. The release manifest hashes **56 non-HTML files from `src/`**, covering both portfolio and game, including both PDFs. `dist/release-manifest.json` adds those hashes and the Actions `GITHUB_SHA` (null locally); the generated manifest is not committed as application source.

## Checks and résumé

`npm run check` includes local-link/metadata checks, actual current-PDF provenance checks, all **16 existing game unit tests** and release-integrity checks. The full check currently includes 65 tests (16 game/audio/physics/presentation tests and 49 release/link tests). The release guard checks the exact route set, separate editorial/game stylesheet order, approved light screen styling, portrait markup, required source/build asset identity, manifest provenance and the checked `dist/` workflow. Route failures distinguish missing and unexpected HTML paths; restore the canonical route list rather than deleting the game to satisfy an obsolete count.

The primary selectable-text résumé is `src/assets/Vigo_Dang_Resume_2026_Redesigned.pdf`; the existing `src/assets/resume-truong-lieu-dong-vigo-dang.pdf` URL is also preserved. The header opens the HTML résumé, and direct current-PDF downloads remain available without playing. To regenerate the current PDF after a CV edit, follow [résumé provenance](docs/resume-provenance.md), inspect every rendered page and extracted text, then rebuild and check. CI uses the committed PDF and needs no PDF-generation dependency.

## Hiring focus and live demos

The portfolio leads with Data and Cloud Engineering internship/graduate opportunities. About introduces Vigo’s self-described listening, feedback and learning habits and his Biên Hòa/Brisbane context. The existing light palette, portrait and Asian night-market artwork remain.

Two deployed interfaces are linked from the homepage, their cases and the game:

- [Dataset Health Analyzer](https://vigodang.github.io/dataset-health-analyzer-demo/) computes real CSV analysis locally in the browser, with synthetic examples, eight report views and JSON exports. It does not run the original AWS services or reproduce the archived load experiment.
- [CRDC Research Assistant](https://crdc-research-assistant.jazzyactor4.chatgpt.site/) demonstrates citations and exports using hand-authored reports and synthetic sources. It does not run AI.

After Dark offers an optional Cloud Kitchen → AI Alley introduction, with a contact invitation after those stops. All six missions and project evidence remain available independently. Reflections express Vigo’s choices and improvement goals; gameplay does not certify personal traits or professional competence. See [the 19 November refinement notes](docs/identity-cloud-demo.md).

## Evidence and deployment

Project evidence and its limits remain in the case studies and [evidence notes](docs/refinement-evidence.md). Older rebuild, portrait, release and design reports describe their dated states; their cream palette, three-stylesheet counts and historical PDF-removal decision are superseded by the approved After Dark release.

`.github/workflows/pages.yml` is the only publishing workflow. Main pushes and pull requests install, build, check and upload `dist/`; pull requests validate without publishing. Only `main` may deploy, on push or manual dispatch, with Pages/OIDC write permissions scoped to deployment. Settings → Pages → Build and deployment → Source uses **GitHub Actions**. [Pull request #1](https://github.com/Vigodang/vigodang.github.io/pull/1) carries the repair; its corrected CI and any subsequent deployment must be verified from their actual run results. No successful corrected run is asserted by these instructions.
