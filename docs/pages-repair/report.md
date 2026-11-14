# GitHub Pages repository and release repair

Audit date: 14 November 2026, Australia/Brisbane. Repair branch: `codex/repair-pages-release`. Baseline remote `main`: `ad4e92c58c500400dc99c2a94c7a15fcfdd7a619`. This repair is local, uncommitted and unpublished. The previous dirty working copy was left untouched; this checkout was cloned from the existing repository, retaining its history.

## Root cause: verified facts and limits

The reported navy, crowded layout **could not be reproduced** during this audit. At 16:37 Brisbane, live `/`, `/styles.css`, `/layout-refinement.css` and `/case-refinement.css` all returned HTTP 200 with correct HTML/CSS content types. Their decoded bytes exactly match current `main` and the authoritative final ZIP. The stylesheet order is base → layout → case refinement. The browser shows `--paper: #f5f2eb`, body background `rgb(245, 242, 235)`, charcoal text, Georgia headings, a portrait and separated navigation at 1440px.

The public Actions API reports the latest Pages workflow for `ad4e92c` succeeded at 16:24:15 Brisbane. The source workflow builds, checks and uploads `dist/`. There is one publishing workflow and the public branch list contains only `main`; no `gh-pages` branch was observed. The complete ZIP comparison found all **86 source files byte-identical**, including Git blob identity. No nested `portfolio/` directory, duplicate root homepage, conflicting stylesheets or missing approved source was found.

Responses advertise `Cache-Control: max-age=600`, with observed `Age: 0`. A stale browser cache, an earlier view before deployment finished, or a browser appearance override could explain a difference seen elsewhere, but none is established by these observations. There is no evidence here of current mixed-commit HTML/CSS or a wrong publishing artifact. **No speculative CSS override or cache-busting change was made.** A new release manifest makes future asset/commit mismatches directly testable; it does not claim to cure an unverified cache issue.

The unauthenticated repository Pages-settings API returned 404, so the administrative publishing-source setting was not directly verified. A successful workflow plus matching live files is evidence of working publication, not a substitute for inspecting that setting. Select **GitHub Actions** in Settings → Pages → Build and deployment → Source; see the deployment guide and [GitHub's source configuration documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

Evidence: `live-http.json`, `live-before-browser.json`, `public-pages-settings.json`, `authoritative-comparison.json` and the captured production screenshot in the review deliverables. The [observed successful run](https://github.com/Vigodang/vigodang.github.io/actions/runs/43566133125) belongs to the existing release, not this unpublished repair.

## Cleanup and source structure

The ZIP's `portfolio/` contents belong at repository root; they were already correctly placed. `src/index.html` is the only repository homepage path. Shared templates/content regenerate it and the other approved HTML files; the build copies `src/` into a fresh `dist/`. Editable content remains in `content/` and `scripts/render.js`, avoiding a second independently maintained homepage. `dist/` and `node_modules/` are ignored and untracked. Repeated base/refinement selectors belong to the approved cascade and were retained; unused-looking historical selectors were not deleted merely because the homepage does not use them.

The only removal is `src/assets/resume-truong-lieu-dong-vigo-dang.pdf` (119,895 bytes): absent from the authoritative final ZIP, superseded by the current PDF and unreferenced by runtime files. The removal was explained before execution; its prior Git version remains recoverable. All documentation, screenshots, diagrams, evidence CSVs, project pages, portrait variants and the 7,184-byte current résumé remain. See `cleanup.md` and the per-path KEEP / UPDATE / REMOVE / INVESTIGATE inventory.

## Git diff summary

- `.gitignore`: ignore Python bytecode in addition to generated output and dependencies.
- `package.json`: include release invariants in the normal `npm run check` command. The dependency list and lockfile are unchanged.
- `scripts/release-assets.js`: small shared list of nine required CSS/JS, portrait and résumé assets and their SHA-256 calculation.
- `scripts/build.js`: preserve the existing build and emit `dist/release-manifest.json`, containing required asset hashes and `GITHUB_SHA` in Actions (null locally). No timestamps, local paths or Git credentials are embedded.
- `scripts/check-release.js`: require the complete 22-page set, exact three-stylesheet order/paths, approved screen theme, portrait markup, source/build asset equality, fresh manifest hashes, ignored generated folders and the expected Pages workflow. Ordinary link and PDF provenance checks remain in place.
- `.github/workflows/pages.yml`: validate pull requests without deploying; restrict deployment and Pages/OIDC write permissions to the `main` deploy job. Configure Pages in that job so PR build validation needs no Pages settings access. Concurrency is per Git ref, so a PR does not share the main deployment queue. Install → build → check → upload `dist/` remains the build sequence. Checks reject a wrong artifact directory, ignored build failure, duplicate publisher or an absent main/PR gate.
- `README.md` and `docs/pages-repair/`: document source ownership, this audit and one deployment/verification/rollback procedure. Earlier dated reports remain historical records.
- Remove the one obsolete PDF. No other approved website file changes.

## Validation and readiness

From the isolated checkout, `npm install --ignore-scripts`, `npm run build` and `npm run check` pass. Node 22 requires no new dependency. The existing checks cover **22 pages, 521 local references and 65 fragments**, plus actual PDF page-one education/Deep Learning content and source/layout hashes. The current PDF and exact supplied CV source are unchanged.

The actual generated `dist/` was served locally. **110 browser checks** cover all 22 routes at **320, 375, 768, 1024 and 1440px**: ivory background, Georgia headings, loaded portraits/images, no page-width overflow, no navigation overlap, minimum visible HTML type 12px and PDF targets at least 44px. Screenshot review covers Home at every width plus About, Work, a case study, Contact, Résumé and a full-size diagram. Mobile menu expansion/Escape focus, the Résumé route, diagram Fit/100% at all five widths, keyboard scrolling and return-to-case navigation pass. No browser warnings/errors were recorded.

Fresh HTTP checks pass for nine public GitHub/LinkedIn/project links and ten local assets/diagnostics, including all three CSS files and the PDF. The PDF is delivered with the correct MIME type and exact expected bytes; browser links retain `download`. No message or call was sent. Native operating-system download dialogs were not exercised.

Independent fault tests reject **29 deliberately broken fixtures**; two valid controls, including the approved white print stylesheet, pass. They cover missing CSS/link/portrait/PDF/page, wrong stylesheet order and on-disk filename case, asset/manifest mismatch, dark screen overrides, wrong artifact path, command order, ignored failures and conflicting publishing actions. Test copies are isolated from the repair checkout. Workflow shape/conditions were reviewed manually and checked by the repository's constrained checker; no independent YAML parser or future Actions execution is claimed. Syntax/whitespace, source preservation, clean source-only reconstruction, patch application and archive verification are captured in the final validation receipts.

**Ready for review and publication after approval. Nothing has been pushed, merged or deployed by this repair.** Remaining limits: repository Pages settings need manual inspection; future Actions execution and post-deployment asset checks can only be completed after approval. Browser QA used Chromium, not Safari/Firefox or physical devices. Native print, screen-reader, Lighthouse and live cloud/project experiments were not rerun. These limits do not conceal a reproduced layout failure: the currently observed live layout already matches the approved source.
