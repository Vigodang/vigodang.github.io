# Measured work — design system

## Chosen concept

An editorial engineering folio: warm paper, fine measurement rules, expressive serif headlines and useful technical annotations. The recurring motif is a small crosshair with folio labels. It marks structure rather than filling the page with a grid.

An alternative, a compact laboratory notebook with dense monospace panels, was considered. The editorial folio offers clearer reading and a stronger contrast with the existing terminal aesthetic, so it is the chosen direction.

## Tokens

| Role | Value |
| --- | --- |
| Paper | `#F5F2EB` |
| Raised paper | `#FCFAF5` |
| Ink | `#202622` |
| Forest | `#31584B` |
| Muted ink | `#59645C` |
| Hairline | `#C9CEC5` |
| Sage cover | `#DFE6DB` |
| Clay accent | `#A85F40` (small annotations only) |

Display: Georgia / Times serif, with italic emphasis. Functional: system sans (`Segoe UI`, Arial, sans-serif). Metadata: `Consolas`, monospace. No remote font requests, tracking or font licence dependency. Display sizes use fluid clamps; reading text is 17–19px, line height 1.6, maximum prose width 66ch. Tiny annotations are never the sole carrier of a claim.

Space scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px. Max page width: 1280px. Desktop margins: 64px, tablet: 32px, phone: 22px. Two-column hero pairs a broad headline with a narrow identity note. Featured work uses one broad cover then an asymmetric pair. Work index uses ruled rows, not a uniform tile grid. Case-study pages use a readable article with a compact sticky contents rail.

## Components and behaviour

1. Plain wordmark and crosshair, three primary links, explicit résumé link.
2. Large two-line editorial thesis, identity/education note and one work action.
3. Project folio with index, type, title, short problem, technical metadata, bespoke diagram and explicit case-study link.
4. Reusable case header, role/type/evidence metadata, annotated architecture figure, numbered decision list, evidence callout, limitations and resource links.
5. Quiet contact band with direct email and accessible profile links.

Project diagrams are editable SVG, visibly labelled conceptual/schematic. No synthetic product screenshots. Sage, paper and charcoal covers distinguish project domains without repeated gradients. Diagrams can be opened at full size; the caption provides an equivalent concise explanation.

Links have a persistent underline or clear action affordance. Focus uses a 3px forest ring. Touch targets are at least 44px where navigation/actions are concerned. Mobile navigation is visible by default without JS; JS enhances it into a menu with Escape/outside-click close and focus return. No content depends on entrance animation. Only 160–220ms colour/underline transitions; reduced motion removes smooth scrolling and transitions.

At 900px the hero and article rail stack. At 600px featured projects stack, covers keep useful aspect ratios, type scales down and metadata becomes a single column. Print removes navigation and interactive controls, exposes URLs and preserves case-study reading order. All pages retain unique metadata, canonical URLs, social artwork and sitemap entries.
