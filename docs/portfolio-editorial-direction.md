# Portfolio art direction and Strobe demo — 20 November 2026

The primary visitor is an Australian recruiter considering Data / Cloud Engineering internships and graduate roles. The page should introduce Vigo, let visitors try real interfaces, then lead to case-study evidence or a conversation. It keeps all six case studies and the résumé while removing duplicate project summaries and the large game promotion from the homepage.

## Visual and motion direction

The user's green, cream and orange reference supplies the palette: forest `#013230`, warm cream `#F3EBDD`, orange `#FF6A1F`, with an earthy brown for secondary emphasis. Inter Variable is used as a bold, plain sans serif rather than a decorative face. Buttons and reading panels have nearly square corners. The original portrait assets remain, and a new transparent cutout overlaps graphic planes in the hero. The mobile layout keeps the full name, hiring intention and first action visible without a surrounding portrait card.

The two supplied Pinterest videos were viewed through native browser playback: a restaurant object/ingredient sequence and a developer identity-badge portfolio. Their implementation and live-site scroll behavior were not verified from the videos. The four supplied screenshots separately informed large type, cutout layering and accent hierarchy. Their media was not copied into the portfolio.

Motion is progressive enhancement: a short entrance, once-only section reveals, restrained portrait movement for fine pointers and preview feedback on hover/focus. Page scrolling remains native. Reduced-motion preference removes motion; keyboard focus, browser find, anchor changes and printing reveal pending content. Without JavaScript, content and navigation remain available.

After Dark is now a quiet footer experiment. Every file under `src/play/` stays unchanged. The user requested portfolio work first and deferred the game's art direction.

## Strobe demo boundary

Public entry: https://vigodang.github.io/strobe-ai-demo/#/login

The actual deployed React app was inspected. Its JS and CSS matched the separate local demo build. Sample sign-in, post/comment creation, assistant lookup, owned-data refusal, mutation refusal, fictional registration and refresh reset passed eleven observed scenario checks. The interaction phase made no network requests.

The browser app is interactive, but sign-in and assistant/tool behavior are simulated. Replies use deterministic templates and keyword rules; photo lookup uses captions/tags. No live AWS service, model, ACP transport, MCP server or vector search is connected. Tab data resets on refresh. The portfolio adaptation builds on the QUT CAB432 starter and upstream interface work. These limits appear in the homepage summary and case study. The original cloud architecture, 229-test result, contribution and limits remain separate evidence.

`src/assets/strobe-ai-demo.jpg` is the unaltered 1440×1050 screenshot of the actual public Assistant view using fictional sample content. It is included on the homepage, project index and case study. The original test ledger and architecture remain in their viewer routes and the case-study evidence.

## Portrait asset provenance

ImageGen's built-in tool was used for background extraction from the existing user-supplied portrait, which was already documented as AI-enhanced before this task. The prompt requested preservation of identity, pose and clothing, with only the background removed. The result was visually inspected; no pixel-exact identity claim is made for a generative extraction.

- `src/assets/vigo-portrait-cutout.png`: 1122×1402, alpha transparency, 1,213,168 bytes.
- `src/assets/vigo-portrait-cutout.webp`: same dimensions and alpha, 147,928 bytes; WebP quality 90 encoding of the extracted PNG. Browsers load WebP through `<picture>`, with PNG fallback.
- The earlier four portrait formats remain protected and available.

Final extraction prompt:

> Use case: background-extraction. Edit target: the supplied existing portrait of Vigo Dang, smiling in a rust brown polo shirt, sitting with his hands at the bottom of the frame. Primary request: remove ONLY all background (plants, wall, bench) to make a clean professionally extracted portrait cutout with genuine alpha transparency for a portfolio website. Preserve the original person's identity, face, smile, hair, eyes, skin texture, body shape, seated posture, clothing, logo and colours exactly as in the photograph. Preserve the original framing and all visible person pixels including hands and trousers at the bottom. Keep wispy hair edges natural. Do not stylise, beautify, relight, retouch, redraw, add shadows, invent missing limbs, or add text/props. No background, no checkerboard baked into pixels, no border. Output a transparent PNG portrait cutout.

## Release contract

The new approved palette and cutout markup replace the old pale-mint release assertions. The release still requires all 23 routes, separate ordered portfolio/game stylesheets, source/build asset parity, manifest provenance, both résumé PDFs and the single checked GitHub Pages publisher. The three new assets bring the non-HTML count to 59. Exact Strobe login navigation is exempted from local-dist link resolution because it is deployed by a separate repository; asset URLs, unknown paths and unapproved hash routes remain checked.

Detailed browser observations, reference notes and baseline hashes are local review evidence under `work/portfolio-strobe-20261120/`, outside the published source.
