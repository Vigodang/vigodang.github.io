# Portrait asset provenance

Source: **user-provided PNG** (1122 × 1402 pixels, RGB). Per the user's clarification, the supplied portrait was **AI-enhanced from their real photograph** before it was provided. Portfolio asset preparation then resized and optimized that supplied enhanced portrait using Lanczos resizing and image compression. The full supplied frame is retained. No further AI enhancement or retouching was performed during portfolio asset preparation; the earlier enhancement's tools and individual edits are not documented here.

Output heights are rounded to the nearest whole pixel, yielding the intended 4:5 display ratio. The image files themselves are uncropped; any presentation crop is controlled by the website's CSS.

| Asset | Dimensions | Bytes | Encoding |
|---|---:|---:|---|
| `src/assets/vigo-portrait-400.webp` | 400 × 500 | 32,228 | WebP quality 86, method 6 |
| `src/assets/vigo-portrait-640.webp` | 640 × 800 | 64,638 | WebP quality 86, method 6 |
| `src/assets/vigo-portrait-960.webp` | 960 × 1200 | 120,738 | WebP quality 86, method 6 |
| `src/assets/vigo-portrait-640.jpg` | 640 × 800 | 97,074 | Progressive JPEG quality 88, optimized |

Use the WebP files as width-based `srcset` candidates (`400w`, `640w`, `960w`) and the 640-pixel JPEG as a fallback. A 640 × 800 intrinsic image size reserves the correct layout ratio; the `sizes` value should match the actual CSS portrait slot.

Every output was reopened and fully decoded to verify format and dimensions. Each WebP is a static, one-frame file containing only a VP8 image chunk, with no EXIF, XMP, ICC or animation chunks. The JPEG contains no EXIF, XMP or ICC data. Only standard technical format headers remain. The source itself had no EXIF entries. Optimized 400- and 640-pixel WebP versions were visually inspected for framing, facial detail and compression quality.

No source download path or private file metadata is published in this record. No CSS, templates or profile content were changed during asset preparation.
