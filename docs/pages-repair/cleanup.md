# Release source preservation and historical inventory

Current boundary: the approved After Dark portfolio and separate game are preserved. The older cream-release inventory dated 14 November 2026 is retained for provenance and is superseded as a source of current cleanup instructions.

## Preserve the approved application

- Keep all 23 HTML routes: 22 editorial routes generated from the shared renderer/content and the separate `src/play/index.html` source.
- Keep the five editorial stylesheets and the game's separate five-stylesheet cascade. Keep all game entry/runtime/shared modules, mission/evidence/audio files and original WebP art. A short `game.js` import is the current entry point; its shared robot, physics, content and briefing dependencies are still required.
- Keep project screenshots, diagrams, measured CSVs, portraits, source content/CV data and Inter with its OFL license. Runtime artwork and fonts are application assets, even though their authoring involved generation or conversion.
- Preserve both `src/assets/Vigo_Dang_Resume_2026_Redesigned.pdf` and `src/assets/resume-truong-lieu-dong-vigo-dang.pdf`. The older branch deletion of the latter is reversed; no replacement or shortening of either file is part of the release-check correction.

The corrected manifest covers all **54 non-HTML source files**. This is broader than the historical nine-asset manifest and protects both the professional pages and `/play/`. Source/build byte equality, expected required paths and exact stylesheet order remain useful guards. The manifest itself is generated only in `dist/` with optional full Actions SHA provenance.

## Bounded repair paths

| Path | Purpose |
| --- | --- |
| `.github/workflows/pages.yml` | Validate PRs and main, upload checked dist, deploy main only outside PR events with scoped permissions. |
| `.gitignore` | Exclude dist, dependencies and cache/bytecode. |
| `package.json` | Add release/guard checks while retaining the 16 existing game unit tests. |
| `scripts/build.js` | Preserve render/copy behavior and produce the release manifest. |
| `scripts/check-release.js` | Validate 23 routes, dark professional screen styles, separate CSS cascades, required assets, source/build hashes, provenance and workflow. |
| `scripts/release-assets.js` | Define the complete non-HTML application asset inventory and hashing. |
| `src/assets/resume-truong-lieu-dong-vigo-dang.pdf` | Restore the existing URL with the original main-release bytes. |
| README and active pages-repair documents | Explain the approved release and mark older cream/deletion claims as historical. |

The correction changes release validation and documentation rather than application design. Generated editorial HTML, build output, captures, temporary archives, dependencies and caches do not belong in the repair source commit. Required runtime art/fonts, genuine project evidence and both PDF files do belong in source.

## Historical inventory — do not apply as a current whitelist

[`inventory.json`](inventory.json) remains the unmodified 14 November audit of `portfolio-final-local.zip`, SHA-256 `0d9a2d0add821b541f9b3785626b127b1279472dfd15409f246b16209a5418a3`, against the older cream release. It recorded 81 KEEP, 11 UPDATE, 1 REMOVE and 0 INVESTIGATE, with a 52-file protected subset and 22 HTML / three stylesheet assumptions. These are dated results, not checks newly run for the After Dark release.

Its single REMOVE entry names the legacy résumé PDF. That action is superseded by the current requirement to preserve both URLs. Newer game files, fonts and portfolio CSS are absent from the old inventory because they were added later; their absence does not authorize deletion. Current validation results belong in [the repair report](report.md), and the current publishing/verification procedure is in [deployment instructions](deployment.md).
