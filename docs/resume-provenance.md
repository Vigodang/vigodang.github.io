# Resume provenance and update workflow

The user supplied the current CV as LaTeX during this rebuild. Its exact text is preserved unchanged in `content/current-cv.tex`. This supplied source supersedes the earlier September PDF; the September file is not copied into the public site.

`content/resume.js` reads the supplied source directly and exports `resumeData` for both the HTML resume and the PDF generator. It extracts the profile, five capability groups, four ordered project headings and all nine project bullets, two additional analytical-work entries and the education/recognition text. Shared website profile/contact/education fields are checked against the supplied source so ordinary edits cannot silently introduce conflicting dates or skill lists.

The four CV projects remain in this order: Dataset Health Analyzer, AI-Assisted Research Synthesis, Predictive Credit Scoring and Parallel Protein Signature Generation. Strobe remains a website case study and does not appear in the supplied CV or generated PDF. PyTorch and TensorFlow are retained as user-supplied capabilities. The PH² work retains the 200-case description and the statistical-modelling entry retains R and beta-binomial/generalised mixed modelling. Phone, project periods, the Independent credit-project label and July 2027 graduation are preserved. No employment section is invented.

## One documented evidence correction

The Dataset Health Analyzer technology line in the supplied LaTeX says Python. The retained backend and worker source use JavaScript/Node.js. As explained to the user, the generated HTML/PDF technology line substitutes **JavaScript/Node.js** for that project's Python token. Python remains in general programming capabilities and in the other relevant projects. All nine project bullets are preserved in meaning and wording, with only text-rendering normalization such as LaTeX emphasis removal, ASCII dashes, arrows and multiplication notation.

The correction is explicit in `resumeData.sourceCV.corrections`; the original LaTeX is never rewritten. No other project, metric, employer or skill was added to the supplied CV content.

## Typesetting and source integrity

No LaTeX engine was available. The PDF is an ATS-readable, single-column ReportLab adaptation of the supplied content. It is **not claimed to be a pixel-exact rendering** of the Lato/LaTeX layout. Standard text, four active contact/profile links, clear project bullets and body type of at least 10 pt are used; there is no skill table, sidebar or scanned text. ASCII hyphen bullet markers keep extracted text free of a font-specific bullet control character.

**Documented layout-order exception:** the PDF's complete QUT education/recognition block now appears directly after Profile, before Technical capabilities, on page one. The degree, minor, expected July 2027 graduation, location and academic award remain together. This makes the qualification and Deep learning & AI capabilities visible on the first page. The supplied original TeX retains its original order and is not edited; no CV text is removed or rewritten by this placement change.

`resumeFingerprint` is the SHA-256 of `JSON.stringify(resumeData)` in Node.js. The data includes the SHA-256 of the exact supplied `.tex` text and layout version 3 with the page-one education placement. The generator stores these as PDF `/SourceHash`, `/SourceCVHash` and `/ResumeLayoutVersion` metadata. A CV or layout-version change invalidates a stale PDF. These hashes establish freshness/provenance, not a digital signature or independent certification of the CV's claims.

Both generation and CI check the **actual first-page text**, not only metadata. Python generation extracts it with `pypdf`; the native Node.js checker follows this controlled PDF's first page/content references and decodes ASCII85/Flate streams with built-in `zlib`, without Python or application dependencies. Both reject a missing QUT qualification, degree, minor, date, location, award or deep-learning capabilities. The complete document is limited to two pages.

The adapter handles the text macros and structure used in this supplied CV. A substantial TeX-format change should update the adapter and receive fresh extraction/visual QA; this is not a general TeX interpreter.

## Regeneration

The committed PDF is a static asset. Normal site build and CI checks use Node.js only; they do not install Python or application dependencies.

1. Update the user-supplied CV source deliberately and reconcile the corresponding shared website facts. Preserve any evidence correction as an explicit transformation.
2. Use Python with `reportlab` and `pypdf`, setting `PORTFOLIO_PYTHON` if `python` does not name the intended interpreter.
3. Run `npm run resume:build` or `node scripts/build-resume.js`.
4. Render every page, compare extracted text with the parsed CV values, verify contact links and inspect layout. Keep body type at least 10 pt and the document within two pages.
5. Run the normal site build/check and commit the source, adapter changes and refreshed PDF together. Do not hand-edit the PDF after generation.

## Verification of this supplied-CV adaptation

Generated and inspected 14 November 2026. The PDF has two A4 pages, 10.3 pt body text and 10 pt metadata (9 pt footer). All pages were rendered with PDFium and visually inspected: no clipping, overlap, missing glyphs or broken project blocks was found. PDF glyph bounds were also checked against page bounds.

`pypdf` extraction was compared against **51 parsed text fields**, including all nine project bullets and every technology line after the one documented correction. All four project titles, the supplied phone, PyTorch, TensorFlow, PH², the 200 dermoscopic cases, R modelling and July 2027 were found. The complete QUT education/award and Deep learning & AI blocks were independently confirmed on page one. The full name leads ATS extraction, and Strobe, obsolete June/Jun 2027 wording, font-specific bullet control characters and unverified employment are absent. Four link annotations target the phone, email, GitHub and LinkedIn. The phone displays exactly `0410 107 614`; its annotation uses `tel:+61410107614` for international calling.

Regression checks removed the degree, graduation date, deep-learning label, PyTorch and TensorFlow from the extracted first-page text independently: both the generator and native checker rejected all five cases. The native checker also rejected the historical PDF with education on page two. The regenerated real PDF passed all checks.

- Supplied `.tex` SHA-256: `30df99e859c9f8e3c9d67ee8f51ec21ec617828b38a0a333c424a08d6a39a371`.
- Parsed resume-source SHA-256: `09a9b90b208e71be059244de8c071f6e9ca1d315f826d67c3a95f4e76de8fd2f`.
- Generated PDF size: 7,184 bytes.
- Generated PDF file SHA-256: `dafb3dc7a24285cd934533edb41ab44169cd7baddfaffc8af8e6c9363ab477fd`.

The native Node.js signature/end-marker/source/layout-hash and actual page-one text checks pass. Both rendered pages were visually inspected after the education placement change. Renders, extracted text, expected parsed data and native/generator regression results remain outside the public site in `work/final-release/resume-qa/`.
