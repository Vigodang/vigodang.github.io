# Portrait and layout refinement

Historical portrait/layout pass. The final local release fixes in `final-release-report.md` supersede its résumé placement and header-navigation details. Portrait provenance below has been corrected to reflect the user's clarification.

Completed 14 November 2026, Australia/Brisbane. The existing editorial direction and homepage hero headline are preserved. This pass makes the completed portfolio more personal and structured; it does not rebuild the site from scratch.

**Ready for review. Nothing has been pushed or deployed.**

## Before → after

| Area | Before | After |
|---|---|---|
| Homepage | Monogram, long introduction and loosely grouped supporting context | Real portrait, shorter introduction, separate technical-focus line and aligned study/graduation/opportunity facts |
| Portrait | No personal photograph | User-supplied photo on Home and About only; quiet rectangular treatment without decorative frames or shadows |
| About | Large decorative headline followed by long prose and a monogram card | Personal introduction, concise profile facts, three working principles, grouped skills, education and opportunity blocks |
| Typography | Repeated italic display lines | One italic emphasis remains in the approved hero; secondary headings use upright serif type with clearer body/metadata contrast |
| Project pages | Long vertical sections with loose spacing | Bounded context/limitations panels, aligned problem/contribution columns on wider screens, clearer metadata and anchor grids, and structured trade-off rows |
| Résumé/contact | Uneven text grouping and compact download targets | Distinct résumé project blocks, a contained contact panel, shorter contact copy and consistent download-link targets |
| Mobile | Longer uninterrupted text and weak personal identity near the top | Portrait/name near the top of Home; About portrait follows its short introduction; stacked facts/cards and cleaner section boundaries |

The warm ivory, forest green, charcoal typography and Georgia serif system remain unchanged. No new achievements, employment, project metrics, evaluation results or product screenshots were added. All six project content objects and seven-stage case narratives remain unchanged. The current CV source, résumé adapter and PDF are unchanged, including Deep Learning skills and expected July 2027 graduation.

## Portrait handling

The supplied portrait was AI-enhanced from the user's real photograph before it was provided. This portfolio pass resized and compressed that supplied enhanced portrait, without further AI enhancement or retouching. Its full supplied framing is preserved, with a consistent 4:5 display ratio. Only Home and About use it.

Three WebP widths (400, 640 and 960 pixels) use responsive `srcset` and accurate slot-size hints. A progressive 640-pixel JPEG provides a fallback. WebP assets are approximately 32, 65 and 121 KB; the JPEG is 97 KB, compared with the supplied 2.32 MB PNG. Metadata was stripped. Intrinsic dimensions and an explicit aspect ratio reserve space while the image loads. Descriptive alt text identifies the portrait; no repeated decorative portrait is added elsewhere.

See `portrait-provenance.md` for dimensions, compression and verification details.

## QA completed

- `npm run build` passed: 22 pages, with no new application dependency.
- `npm run check` passed: 543 local references, 65 fragments, metadata/assets/encoding and source/built PDF freshness.
- All 22 routes were checked in the browser at 320, 375, 768, 1024 and 1440px: 110 checks, no page-width overflow or failed loaded images. Rendered HTML text remained at least 12px. Off-screen project covers retain native lazy loading.
- Portraits loaded correctly on both intended pages. All four portrait variants and the PDF returned HTTP 200 with correct MIME types and exact file bytes.
- All nine current external URLs returned HTTP 200, including GitHub, project/source links and LinkedIn. Email/telephone URI targets remain intact; no message was sent or call placed.
- Mobile menu expansion and Escape/focus return passed. The redundant portrait link was removed so keyboard navigation does not jump upward after the hero actions.
- Detailed-diagram original size, Fit width, 100% reset and keyboard scrolling remain functional at 320px. Original files, captions and explanatory case text remain available.
- Visible résumé download links met a 44px minimum target height in the responsive matrix. The long email address fits on one line at 320px.
- Manual desktop/tablet/mobile inspection covered Home, About, Contact, case sections and full-size diagrams. No browser warnings/errors were recorded in the reviewed session.
- The PDF is byte-identical to the completed pre-portrait version; its existing selectable text, current-CV content and download were preserved. Project figures and measurement CSVs are unchanged.
- JavaScript syntax and whitespace checks passed. The GitHub Pages workflow is unchanged.

Machine-readable receipts are `portrait-layout-links.json`, `portrait-layout-responsive.json` and `portrait-layout-interactions.json` in the source package. The downloadable ZIP and incremental patch are separately validated in `artifact-verification.json` beside the deliverables.

## Trade-offs and limits

The technical case studies remain deliberately detailed; stronger grouping and shorter line lengths make them easier to scan without removing useful evidence or limitations. Portrait variants balance photo detail with download size; the original uncompressed PNG remains outside the published source package.

Browser verification used Chromium with explicit viewport widths. Physical devices, Safari/Firefox, proprietary ATS software, a full screen-reader audit, the native print dialog and an operating-system reduced-motion toggle were not exercised. No new cloud experiment, model training or performance benchmark was needed or claimed for this visual pass. Previously documented project-evidence limits remain in `refinement-evidence.md`.

There are no known implementation blockers from this pass. Remote Actions and a hosted smoke test remain pending because publication has not been approved. The local preview server is a QA aid; the source package can be previewed with `npm run build` and `npm run serve` (use `npm.cmd` on Windows if PowerShell blocks `npm.ps1`).
