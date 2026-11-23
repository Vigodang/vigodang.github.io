import {writeFile} from 'node:fs/promises';
import {orbitContent,renderChapterBody} from '../src/play/orbit-content.js';
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

export async function renderOrbit(){
  const nav=orbitContent.chapters.map(ch=>`<a href="#chapter-${ch.id}" data-chapter="${ch.id}"><span>${esc(ch.label)}</span></a>`).join('');
  const hotspots=orbitContent.chapters.map(ch=>`<button type="button" class="orbit-hotspot hotspot-${ch.id}" data-open-chapter="${ch.id}" hidden><span class="hotspot-dot" aria-hidden="true"></span><span>${esc(ch.label)}</span></button>`).join('');
  const staticChapters=orbitContent.chapters.map(ch=>`<section id="chapter-${ch.id}" class="direct-chapter"><p class="eyebrow">${esc(ch.eyebrow)}</p><h2>${esc(ch.title)}</h2><p>${esc(ch.intro)}</p>${renderChapterBody(ch)}</section>`).join('');
  await writeFile('src/play/index.html',`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#013230">
  <title>Vigo Dang — Portfolio</title>
  <meta name="description" content="Meet Vigo Dang through an interactive ID badge: Data and Cloud Engineering work, public demos and the person behind them.">
  <link rel="canonical" href="https://vigodang.github.io/play/">
  <meta property="og:title" content="Vigo Dang — Portfolio">
  <meta property="og:description" content="Vigo Dang’s data and cloud projects, public demos, technical skills and contact details.">
  <meta property="og:type" content="website"><meta property="og:url" content="https://vigodang.github.io/play/">
  <meta property="og:image" content="https://vigodang.github.io/assets/og-image.png">
  <meta property="og:image:alt" content="Vigo Dang — Data and Cloud Engineering">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="../assets/fonts/InterVariable.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="../assets/vigo-portrait-cutout.webp" as="image">
  <link rel="stylesheet" href="orbit.css">
  <script src="orbit.js" type="module"></script>
</head>
<body>
  <a class="skip-link" href="#direct-access">Skip the scene and explore the chapters</a>
  <header class="world-header">
    <a class="world-brand" href="../" aria-label="Vigo Dang portfolio">VIGO<span>.</span><b>PORTFOLIO</b></a>
    <a class="portfolio-return" href="../">Back to portfolio</a>
  </header>
  <main id="main">
    <section class="world" aria-labelledby="world-title">
      <div class="world-heading"><p class="eyebrow">A little introduction</p><h1 id="world-title"><span>A face. A name.</span><span>A conversation.</span></h1></div>
      <div class="world-identity"><p>Vigo Dang</p><span>Data &amp; Cloud Engineering</span><small>Seeking internship and<br> graduate opportunities</small></div>
      <div id="orbit-stage" class="orbit-stage" role="region" aria-label="Vigo Dang’s portfolio ID badge. Choose a chapter below to explore." aria-describedby="scene-hint">
        <div class="still-portrait"><div class="badge-fallback-top"><span>VIGO<span aria-hidden="true">.</span></span><span>PORTFOLIO ID</span></div><div class="badge-fallback-photo"><img src="../assets/vigo-portrait-cutout.webp" width="1122" height="1402" alt="Vigo Dang smiling, wearing a rust-coloured polo shirt." fetchpriority="high"></div><div class="badge-fallback-copy"><p>Vigo Dang</p><span>Data &amp; Cloud Engineering</span><small><span aria-hidden="true"></span>Open to work</small></div></div>
        <canvas id="orbit-canvas" aria-hidden="true"></canvas>
      </div>
      <div class="orbit-hotspots" aria-label="Explore a chapter">${hotspots}</div>
      <p id="scene-hint" class="scene-hint"><span class="drag-glyph" aria-hidden="true"></span><span id="hint-text">Choose a chapter to explore.</span></p>
      <div class="view-controls" hidden><button type="button" id="turn-view" aria-label="Turn card 45 degrees">Turn card</button><button type="button" id="reset-view">Reset card</button><button type="button" id="motion-toggle" aria-pressed="false">Pause motion</button></div>
      <nav class="chapter-nav" aria-label="Explore Vigo Dang’s portfolio">${nav}</nav>
      <p class="scene-status" id="scene-status" role="status" aria-live="polite"></p>
    </section>
    <div id="direct-access" class="direct-access" tabindex="-1"><header><p class="eyebrow">The person and the work</p><h2>Meet Vigo.<br>Explore the work.</h2></header>${staticChapters}</div>
  </main>
  <dialog id="chapter-dialog" aria-labelledby="chapter-title" aria-describedby="chapter-intro">
    <div class="chapter-header"><p class="eyebrow" id="chapter-eyebrow"></p><button type="button" id="close-chapter" aria-label="Close chapter" autofocus>×</button></div>
    <div class="chapter-scroll"><h2 id="chapter-title"></h2><p class="chapter-intro" id="chapter-intro"></p><div id="chapter-body"></div></div>
    <footer class="chapter-footer"><span>VIGO DANG</span><button type="button" id="return-scene">Back to the scene</button></footer>
  </dialog>
</body>
</html>
`);
}
