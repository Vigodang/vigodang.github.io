# Final local release — 14 November 2026

Ready for approval to release. Nothing has been committed, pushed or deployed during this final-fix pass. The approved editorial design and portrait presentation are preserved.

## Before → after

| Area | Before | Final local release |
|---|---|---|
| Downloadable résumé | QUT education appeared on page 2 | Complete education/recognition block follows Profile on page 1, including Bachelor of Data Science, minor and **Expected July 2027**. Deep learning & AI, PyTorch and TensorFlow also remain on page 1. |
| Portrait provenance | Incorrectly implied the supplied image had no AI editing | Records that the portrait was AI-enhanced from the user's real photograph before supply, then resized and optimized for this portfolio. No additional AI enhancement was performed during asset preparation. |
| About copy | Unconfirmed photography hobby | Removed without introducing another personal claim. No other unsupported hobby claims were found. |
| Résumé navigation | Header contained both HTML résumé and PDF entries | One header Résumé entry opens the HTML page. Direct PDF downloads remain on Résumé, About, Contact and every footer. |

The PDF remains two A4 pages with native selectable text, a single-column reading order, 10.3 pt body text, 10 pt metadata and four working link annotations. All 51 parsed CV fields and nine project bullets remain. The exact supplied LaTeX source is unchanged; only the documented section-order change and existing Dataset stack correction apply. No third-party ATS service was used, so universal ATS compatibility is not claimed.

## Verification

- `npm.cmd run build` and `npm.cmd run check` pass: **22 pages, 521 local references and 65 fragments**. Source and built PDF hashes, layout version and actual page-one education/deep-learning text pass native Node checks.
- Both PDF pages were rendered and visually inspected. Text extraction, page bounds, all CV fields, four link annotations and missing-text regression checks pass. The previous PDF with education on page 2 is rejected by the new placement check.
- **110 browser checks** cover all 22 routes at **320, 375, 768, 1024 and 1440px**. No page-width overflow, failed loaded images or duplicate header résumé entries. Visible HTML text is at least 12px; visible PDF links have targets at least 44px high.
- Mobile menu expansion, Escape/focus return and the header Résumé route pass. About has its portrait and no hobby sentence. The detailed Dataset architecture viewer passes Fit width / 100% at all five widths, keyboard scrolling at 320px and return-to-case navigation. No browser warnings/errors were recorded.
- All **nine public GitHub/LinkedIn URLs** returned HTTP 200 in fresh read-only checks. The PDF and four portrait variants returned HTTP 200 with appropriate MIME types and exact built-file bytes. Email/telephone URI values remain intact; no message or call was sent.
- Independent baseline comparison confirms all **six case-study bodies, ten visual-viewer bodies, project data, 19 non-PDF assets, three stylesheets, client JavaScript and deployment workflow** are unchanged. Source/build copies match. Shared header cleanup is the only change on project and visual pages.
- JavaScript/Python syntax, whitespace, archive integrity and incremental-patch application/build checks are recorded in the accompanying artifact verification receipt.

Receipts: `final-release-responsive.json`, `final-release-interactions.json`, `final-release-links.json`, `final-release-preservation.json` and `final-release-resume-qa.json`. The release archive includes source and built `dist/`; the incremental patch applies to the completed portrait version immediately before these release fixes, rather than the repository's original commit.

## Readiness and limits

No unresolved functional issue was found in this pass. The release is prepared locally and awaits the user's approval before any push or deployment. The existing GitHub Pages workflow is preserved.

Responsive/browser verification used Chromium in the in-app browser; Safari, Firefox, physical devices and a screen reader were not exercised in this pass. Native print output, no-JavaScript mode, OS reduced-motion settings and Lighthouse were not rerun because this change leaves styles/client behavior intact. Native HTML links and full-size original visual files remain available. Existing project evidence limitations still apply: cloud systems and historical experiments were not rerun for this release, and private capstone material remains unpublished.

Final PDF: 7,184 bytes; SHA-256 `dafb3dc7a24285cd934533edb41ab44169cd7baddfaffc8af8e6c9363ab477fd`.
