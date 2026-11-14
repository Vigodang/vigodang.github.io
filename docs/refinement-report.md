# Final refinement and deployment readiness

> Historical phase record: the later portrait/layout pass is documented in [portrait-layout-report.md](portrait-layout-report.md). Its current QA totals supersede the layout checks below.

Reviewed 14 November 2026, Australia/Brisbane. This continues the approved editorial rebuild; it does not replace its warm ivory, forest green, charcoal and serif direction. The existing hero headline is unchanged.

**Status: technically ready for approval. No commit, push or deployment was performed for this refinement.** The existing GitHub Pages site and deployment workflow remain unchanged.

## Before → after

| Area | Approved rebuild before this pass | Final refinement |
|---|---|---|
| Positioning | Broad software/data introduction | Specific Python/SQL, software engineering, AWS cloud, machine learning, TensorFlow/Keras deep learning and retrieval-based AI positioning beneath the same headline |
| Project selection | Five case studies; Dataset evidence still treated as user-reported | Six ordered cases, with Strobe, Dataset, CRDC, Credit and the newly added C++/OpenMP case prioritized; Graph remains supporting work |
| Evidence | Source-derived architecture drawings dominated | Real Dataset report/correlation captures; measured Dataset scaling plot; retained OpenMP runtime chart and CSVs; Strobe test results; conceptual diagrams only where supported |
| Case narratives | Overview, decisions and evidence | Seven explicit stages: context, problem, actual contribution, implementation, trade-offs, evidence/verification and limitations |
| Detailed visuals | Diagrams scaled with the page | Ten dedicated original-size viewers with fit/zoom controls, keyboard/touch scrolling, original-file links, captions and meaningful alternatives |
| Small-screen reading | Some compact metadata and labels | At least 12px rendered HTML text in the tested pages; wrapped mobile navigation/footer; readable body copy and contained scrolling for detailed imagery/tables |
| Résumé | HTML with print action; no current downloadable PDF | Real two-page selectable-text PDF and matching HTML derived from the supplied current CV, including phone, PyTorch/TensorFlow, analytical work and July 2027 graduation |
| Copy and links | Some process-oriented wording | More direct copy; evidence boundaries retained inside cases; current GitHub, project, LinkedIn, contact and PDF destinations verified |

The current CV's four projects and all nine bullets remain in their supplied order. Strobe stays on the website but was not inserted into the supplied CV. One evidence-based correction changes Dataset's project-stack Python token to JavaScript/Node.js; the original LaTeX is preserved unchanged. The PDF is a readable ReportLab adaptation, not a pixel-exact reproduction of the LaTeX layout.

## Verification completed

| Check | Result |
|---|---|
| Dependency install | `npm install --ignore-scripts` passed; no application dependencies added; zero audit vulnerabilities reported |
| Build | `npm run build` passed; 22 HTML pages: 12 content pages and 10 visual viewers |
| Existing/extended site checks | `npm run check` passed; 490 local references and 66 fragments; headings, metadata, local assets, encoding, public-content rules and PDF freshness passed |
| Responsive browser matrix | All 22 routes checked at 320, 375, 768, 1024 and 1440px (110 route/width checks); no page-width overflow, failed loaded images or HTML text below 12px |
| Deferred images | Off-screen index images use native lazy loading; asset references were checked and representative covers/case images loaded in the browser |
| Mobile interaction | Menu expansion, Escape closure/focus return and About navigation passed at 320px |
| Viewer interaction | Original size, Fit width, zoom in/out, 100% reset and focused ArrowRight scrolling passed at 320px; image overflow stays inside its labelled region |
| No-JavaScript fallback | Temporary script-free copies confirmed visible wrapped navigation and original-size scrollable viewer at 320px; fixtures removed |
| External links | All nine current external URLs returned HTTP 200; includes GitHub profile/project/source links and the exact LinkedIn URL supplied in the CV |
| Contact links | Email and international telephone URI targets checked; no email sent or call placed |
| PDF delivery | HTTP 200, `application/pdf`, 7,265 bytes; actual header file-link download completed through browser automation and matched the source byte-for-byte |
| PDF content/layout | Two A4 pages rendered and inspected; all 51 expected CV text fields matched extraction, including nine bullets; all four link annotations verified; no clipping, overlap or missing glyphs found |
| Source hygiene | JavaScript syntax and `git diff --check` passed; no private endpoints, credentials or raw partner/course data included in selected public assets |

Browser console inspection returned no warnings/errors for the reviewed session. Representative desktop, tablet and mobile screenshots accompany this report. The source package and binary patch are validated separately in the artifact verification record.

## What the project evidence does and does not establish

- **Strobe:** 229 local automated tests (145 backend, 67 ACP, 17 MCP) were reproduced earlier on 14 November against unchanged public commit `5d3a43f`. This refinement confirms the source is unchanged; it does not claim another test run or a new cloud deployment. Demo identity and stopped smoke deployment remain explicit.
- **Dataset:** original 12 October records support 40/40 completed jobs and workers 1 → 4 → 1. The actual 17 October interface captures use a separate showcase file. The reviewed 24 October source fixes were local and not deployed to the earlier measured baseline. No new AWS experiment was run. Crash recovery and non-atomic job/queue submission remain limitations.
- **OpenMP:** recomputation of 60 retained timings supports 3.25× versus the optimized sequential baseline at eight threads. Runtime confidence intervals and recorded byte comparisons are shown accurately. No program was rebuilt or benchmark rerun; this is bounded coursework evidence, not a general hardware claim.
- **Credit:** the repository supports application/model-workflow claims. Simulated dashboard fallback metrics are excluded. Genuine saved evaluation arrays and screenshots were absent, so no quality chart or lending-validation claim is invented.
- **CRDC:** the public account describes the student's orchestration/retrieval contribution within a team capstone. Confidential source, corpus details and unpublished evaluation results are not published.
- **Deep learning:** public TensorFlow/Keras segmentation code supports the implementation description. PyTorch is retained from the supplied CV. No unsupported pretrained-backbone, new training or model-quality claim is added.

See `refinement-evidence.md` and `resume-provenance.md` for the detailed evidence boundaries and update workflow.

## Remaining limits and deployment decision

There are no known broken current links, stale PDF assets or page-width overflows in the checks above. Browser download verification is complete; an earlier event-capture failure was resolved by downloading the actual file link and comparing its bytes. The old `www` LinkedIn variant was automation-blocked; current links use the supplied non-`www` URL, which returned 200.

Responsive verification used the in-app Chromium browser with explicit viewport widths. Physical-device, Safari/Firefox, full screen-reader and Lighthouse audits were not run. Reduced-motion and print styles were reviewed in source; an operating-system motion toggle and native print dialog were not exercised. PDF text extraction and single-column structure support ATS readability; no proprietary ATS parser was used.

The existing GitHub Pages workflow still installs with Node 22, builds, checks and uploads `dist/` before deployment. The committed PDF means CI does not need Python. Deployment has not been attempted, so a new remote Actions run and hosted smoke test remain pending approval. There is no required implementation blocker known from this pass.

After approval, the next action is to commit the reviewed changes, push the agreed branch/merge and run the existing Pages workflow, then check the hosted routes and PDF. Until approval, the work remains local. Earlier audit/delivery documents are historical and are explicitly superseded by this refinement record.
