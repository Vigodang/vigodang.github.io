# Pages release checks — After Dark correction

Current correction: 17 November 2026, Australia/Brisbane. [Pull request #1](https://github.com/Vigodang/vigodang.github.io/pull/1) contains the earlier Pages hardening branch merged with the approved After Dark main release. Its release validator still described the older cream portfolio, causing [run 44068117284](https://github.com/Vigodang/vigodang.github.io/actions/runs/44068117284) to fail. Local results for the correction are recorded below; the historical results do not establish current CI or deployment status.

## Confirmed cause and bounded change

The failing `Built HTML routes differ from the complete approved page set` check expects only 22 editorial pages. The correct build also includes `play/index.html`, for **23 HTML routes**. Removing that route or reverting the professional site would regress the approved application.

The same stale guard lists only three editorial stylesheets and forces a light/cream theme. The approved portfolio loads five ordered stylesheets: base, layout refinement, case refinement, `portfolio-brand.css`, then `portfolio-pages.css`. It uses navy/mint and Inter on screen. The game loads its own five stylesheets under `play/`: `styles.css`, `briefing.css`, `missions.css`, `evidence.css`, `after-dark.css`. White print styles remain valid. Legacy base tokens coexist with the final dark overrides, so the validator must respect the screen cascade rather than require every token declaration to equal an old color.

The earlier repair branch already contained the latest approved application source. Its diff against that main release changed release tooling/workflow/docs and deleted the older résumé PDF. This correction preserves the dark design, all game files and project evidence, restores that PDF path and keeps the primary redesigned PDF unchanged. It also retains all **16 existing game unit tests** in `npm run check`; release checks are additive.

The manifest expands from the old nine-asset subset to **all 54 non-HTML files under `src/`**, including both PDFs, original evidence, portfolio CSS, Inter/license, game modules and artwork. The generated manifest records source/build hashes and Actions commit provenance. Its exact route guard must explain missing and unexpected paths while continuing to reject unintended extra HTML. Required-file and stylesheet-order checks must still fail on real regressions.

The workflow retains PR build/check/upload, a main-only non-PR deployment job, deployment-scoped Pages/OIDC write permissions and per-ref concurrency. Only the checked `dist/` artifact is published. No application redesign, evidence rewrite or alternate publishing path belongs to this fix.

## Validation status

Clean `npm.cmd install --ignore-scripts`, `npm.cmd run build` and `npm.cmd run check` pass. The checks cover 23 HTML pages, 684 local references, 75 fragments, current-PDF provenance, all 54 manifest assets and **57 passing tests**: the existing 16 game/audio/physics/presentation tests plus 41 release-guard regressions. The latter use isolated temporary fixtures and include valid dark/white-print controls, missing/extra HTML, editorial/game CSS order and paths, screen palette/cascade overrides, missing/empty/wrong-case runtime assets or either PDF, source/build or manifest drift, Actions SHA provenance and unsafe workflow changes. Whitespace checks pass.

All **77 approved application files match the previously deployed release byte for byte**. The sole additional build file is `release-manifest.json`; neither design nor game behavior is changed by this correction. Both résumé files match the approved source.

Use the actual [PR checks](https://github.com/Vigodang/vigodang.github.io/pull/1/checks) and subsequent [Pages runs](https://github.com/Vigodang/vigodang.github.io/actions/workflows/pages.yml) to establish CI and deployment status for the corrected commit. Merge/deploy through the existing authorized workflow only after the corrected PR succeeds, then verify public manifest provenance and bytes. [Deployment instructions](deployment.md) use repository-relative commands. This local tooling correction does not claim a fresh physical-device, Safari/Firefox, auditory or full accessibility audit.

## Historical audit — 14 November 2026, superseded

The previous audit used cream/Georgia release `ad4e92c58c500400dc99c2a94c7a15fcfdd7a619` and `portfolio-final-local.zip`. At that time it observed live cream styling and three CSS files matching that release, and reported all 86 common source files byte-identical. The [observed successful run](https://github.com/Vigodang/vigodang.github.io/actions/runs/43566133125) belongs to that earlier release. Its cache/appearance discussion and its conclusion that navy was unexpected apply only to that dated design.

That audit reported 22 pages, 521 local references and 65 fragments; 110 Chromium route/viewport checks; nine external-link checks; and 29 rejected fault fixtures with two valid controls. Those results tested the older release, not the current 23-route dark portfolio. The earlier light-screen mutation expectations must not be reused as current acceptance criteria.

It also removed the 119,895-byte `resume-truong-lieu-dong-vigo-dang.pdf` because the then-authoritative ZIP omitted it. The current preservation requirement supersedes that deletion. Both PDF paths are retained by this correction. [The old inventory](inventory.json) remains unchanged as historical evidence; its 81 KEEP / 11 UPDATE / 1 REMOVE counts, 52 protected-file subset and old ZIP hashes are not a current deletion list or complete application inventory. [Cleanup notes](cleanup.md) describe the current preservation boundary.
