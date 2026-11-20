import { writeFile, mkdir } from 'node:fs/promises';
import { profile as p, projects } from '../content/site.js';
import { resumeData as r } from '../content/resume.js';

const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const arrow = '';
const link = (href, text, cls='text-link') => `<a class="${cls}" href="${esc(href)}">${esc(text)} ${arrow}</a>`;
const stamp = '';
const pdfLink = (prefix, cls='') => p.pdf ? `<a class="${cls}" href="${esc(prefix+p.pdf)}" download>Download résumé PDF ${arrow}</a>` : '';
const projectFor = slug => projects.find(project => project.slug === slug);
const orderedProjects = ['dataset-health','crdc-capstone','strobe-ai','predictive-risk','parallel-protein','graph-optimisation'].map(projectFor);
const projectPath = project => project.slug==='dataset-health' ? 'Featured · Data & Cloud' : project.slug==='strobe-ai' ? 'Data & cloud workflows' : ['crdc-capstone','predictive-risk'].includes(project.slug) ? 'Applied AI & research tools' : 'Software foundations';

function shell(route, title, description, body, active='') {
  const pre = route.includes('/') ? '../' : '';
  const canonical = `https://vigodang.github.io/${route === 'index.html' ? '' : route}`;
  const nav = [['work.html','Work'],['about.html','About'],['contact.html','Contact']].map(([url,label])=>`<a href="${pre}${url}"${active===label?` aria-current="${route===url?'page':'true'}"`:''}>${label}</a>`).join('');
  const pageClass=route.startsWith('projects/')?'case-study':route.startsWith('visuals/')?'visual':route==='index.html'?'home':route.replace('.html','');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="${route==='index.html'?'#013230':'#f3ebdd'}">
  <title>${esc(title)} | Vigo Dang</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${esc(title)} | Vigo Dang">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="${pre?'article':'website'}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="https://vigodang.github.io/assets/og-image.png">
  <meta property="og:image:alt" content="Vigo Dang — data and cloud engineering">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${pre}assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${pre}styles.css">
  <link rel="stylesheet" href="${pre}layout-refinement.css">
  <link rel="stylesheet" href="${pre}case-refinement.css">
  <link rel="preload" href="${pre}assets/fonts/InterVariable.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${pre}portfolio-brand.css">
  <link rel="stylesheet" href="${pre}portfolio-pages.css">
  <script src="${pre}script.js" defer></script>
  ${route==='index.html'?'<script src="hero-badge.js" type="module"></script>':''}
</head>
<body class="portfolio page-${pageClass}">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header wrap">
    <a class="brand" href="${pre}index.html" aria-label="Vigo Dang home">VIGO<span class="brand-stop" aria-hidden="true">.</span><span class="brand-sub">DANG</span></a>
    <a class="header-after-dark" href="${route==='index.html'?'#hero-badge-stage':'/#hero-badge-stage'}">After Dark</a>
    <button class="nav-toggle" type="button" aria-controls="site-nav" aria-expanded="false" data-nav-toggle>Menu <span aria-hidden="true">+</span></button>
    <nav id="site-nav" aria-label="Main navigation" data-nav-links>${nav}<a class="nav-cv" href="${pre}resume.html"${active==='Resume'?' aria-current="page"':''}>Résumé</a></nav>
  </header>
  <main id="main" tabindex="-1">${body}</main>
  <footer class="site-footer">
    <div class="wrap"><div class="footer-invitation" data-reveal><p class="label">Data & Cloud Engineering · Internship / Graduate</p><h2>Good work starts<br>with a conversation.</h2>${link(pre+'contact.html','Let’s talk','button')}</div>
    <div class="footer-bottom"><p>${esc(p.name)}<span>${esc(p.location)}</span></p><div>${link(p.github,'GitHub')}${link(p.linkedin,'LinkedIn')}${link(pre+'resume.html','Résumé')}<a class="text-link footer-experiment" href="/play/">After Dark <span>· interactive ID badge</span></a></div></div></div>
  </footer>
</body>
</html>
`;
}

function visualEntries(pr) {
  return [
    {...pr.visual,key:'overview'},
    ...(pr.architecture ? [{...pr.architecture,key:'architecture'}] : []),
    ...(pr.evidenceVisual ? [{...pr.evidenceVisual,key:'results'}] : []),
    ...(pr.details || []).map((v,i)=>({...v,key:'detail-'+(i+1)}))
  ];
}
const viewerRoute = (pr, v) => `visuals/${pr.slug}-${v.key}.html`;

function figure(project, prefix='', cover=false, visual=null) {
  const v=visual || visualEntries(project)[0];
  return `<figure class="project-figure ${project.theme} ${v.kind}${cover?' cover':''}">
    <div class="figure-label"><span>${esc(v.label)}</span>${stamp}</div>
    <div class="visual-stage"${v.kind==='screenshot'&&!cover?` tabindex="0" role="region" aria-label="${esc(v.label)} — scrollable screenshot"`:''}><img src="${prefix}assets/${esc(v.src)}" width="${v.width}" height="${v.height}" alt="${esc(v.alt)}"${cover?' loading="lazy"':''}></div>
    <figcaption>${esc(cover?(project.coverCaption || v.label):v.caption)}</figcaption>
    ${!cover?link(prefix+viewerRoute(project,v),'Explore full-size visual','visual-link'):''}
  </figure>`;
}

function evidenceTable(pr) {
  if (!pr.evidenceTable) return '';
  return `<div class="table-wrap" role="region" tabindex="0" aria-label="${esc(pr.title)} measurements"><table><caption>Recorded measurements</caption><thead><tr>${pr.evidenceTable.headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${pr.evidenceTable.rows.map(row=>`<tr>${row.map((cell,i)=>i===0?`<th scope="row">${esc(cell)}</th>`:`<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${pr.evidenceData?link('../assets/'+pr.evidenceData,'Download measurement data (CSV)'):''}`;
}

function viewerPage(pr,v) {
  return `<section class="viewer-page wrap"><p class="label">${esc(pr.title)} / ${esc(v.label)}</p><h1>${esc(v.label)}</h1><p class="viewer-caption">${esc(v.caption)}</p>
    <div class="viewer-toolbar" data-viewer-controls hidden aria-label="Visual zoom controls"><button type="button" data-zoom="out" aria-label="Zoom out">−</button><button type="button" data-zoom="in" aria-label="Zoom in">+</button><button type="button" data-zoom="actual">100%</button><button type="button" data-zoom="fit">Fit width</button><output data-zoom-status aria-live="polite">100%</output></div>
    <p class="viewer-help" id="viewer-help">Scroll or swipe inside the image. You can also focus the image area and use the arrow keys.</p>
    <div class="visual-viewport" role="region" tabindex="0" aria-label="${esc(v.label)} — scrollable full-size visual" aria-describedby="viewer-help" data-viewer><img src="../assets/${esc(v.src)}" width="${v.width}" height="${v.height}" alt="${esc(v.alt)}" draggable="false" data-viewer-image></div>
    <div class="viewer-actions">${link('../projects/'+pr.slug+'.html', 'Back to '+pr.title)}${link('../assets/'+v.src,'Open original file')}</div></section>`;
}

function folio(project, extra='') {
  return `<article class="folio ${extra}"><div class="folio-image">${figure(project,'',true)}</div><div class="folio-copy"><p class="label">${esc(project.category)}</p><h3><a href="projects/${project.slug}.html">${esc(project.shortTitle)}</a></h3><p>${esc(project.summary)}</p><p class="tech">${esc(project.technologies)}</p><p class="folio-evidence"><span>Evidence</span>${esc(project.evidenceLabel)}</p></div></article>`;
}


function demoCapture(pr, prefix='') {
 const d=pr.liveDemo;
 return `<figure class="demo-capture"><img src="${prefix}assets/${esc(d.image)}" width="${d.width}" height="${d.height}" loading="lazy" alt="${esc(d.alt)}"><figcaption>${esc(d.caption)}</figcaption></figure>`;
}
function demoFeature(pr) {
 const d=pr.liveDemo;
 const copy = {
   'dataset-health': ['Make sense of a dataset.', 'Upload a CSV, spot gaps and explore what needs attention.', 'Browser-local analysis · synthetic samples'],
   'strobe-ai': ['Find the story in your media.', 'Create a sample post, then ask the assistant to find your photos.', 'Simulated sign-in · template replies · no live AI'],
   'crdc-capstone': ['Start with the source.', 'Explore a research workflow built around questions, evidence and traceability.', 'Synthetic research demo · example responses']
 }[pr.slug];
 const title=pr.slug==='crdc-capstone'?'CRDC Research Assistant':pr.title;
 return `<article class="project-showcase showcase-${esc(pr.slug)}" data-reveal><div class="showcase-copy"><p class="label">${esc(pr.slug==='dataset-health'?'Featured · Data & Cloud':d.category)}</p><h3><a href="projects/${pr.slug}.html">${esc(title)}</a></h3><p class="showcase-idea">${esc(copy[0])}</p><p class="showcase-description">${esc(copy[1])}</p><div class="demo-actions">${link(d.url,'Try the demo','button')}${link('projects/'+pr.slug+'.html','Read the case study')}</div><p class="demo-scope">${esc(copy[2])}</p></div><a class="showcase-preview" href="${esc(d.url)}" aria-label="Try the ${esc(pr.title)} live demo"><div class="browser-top" aria-hidden="true"><span></span><span></span><span></span><span class="browser-title">${esc(d.label)}</span></div><img src="assets/${esc(d.image)}" width="${d.width}" height="${d.height}" alt="${esc(d.alt)}" loading="lazy" decoding="async"></a></article>`;
}

function portrait(cls, sizes) {
  return `<picture class="portrait-picture ${cls}"><source type="image/webp" srcset="assets/vigo-portrait-cutout.webp"><img src="assets/vigo-portrait-cutout.png" width="1122" height="1402" alt="Vigo Dang smiling, wearing a rust-coloured polo shirt." fetchpriority="high" decoding="async"></picture>`;
}

function home() {
  return `<section class="hero hero-badge-experience" aria-labelledby="hero-name"><div class="wrap">
    <div class="hero-top"><p class="label">${esc(p.positioning.role)}</p><p class="hero-location">${esc(p.location)}</p></div>
    <div class="hero-stage"><div class="hero-copy"><h1 id="hero-name" class="hero-name"><span>VIGO</span> <span>DANG<span class="name-stop">.</span></span></h1><div class="hero-story"><p class="hero-intro">I build tools that<br> make data useful.</p><p class="hero-focus">QUT Data Science student.<br>Seeking a Data / Cloud Engineering<br> internship or graduate role.</p><div class="hero-actions">${link('#selected-work','Explore the work','button')}${pdfLink('','text-link')}</div></div></div>
      <div id="hero-badge-stage" class="hero-badge-stage" role="region" aria-label="Vigo Dang’s portfolio badge. Choose a chapter below to explore." aria-describedby="hero-badge-hint"><div class="hero-portrait-scene hero-badge-fallback" data-portrait-scene><p class="hero-badge-fallback-label">PORTFOLIO ID</p>${portrait('hero-cutout','')}<div class="hero-badge-fallback-copy"><p>Vigo Dang</p><span>Data &amp; Cloud Engineering</span><small>Open to work</small></div></div><canvas id="hero-badge-canvas" aria-hidden="true"></canvas></div>
      <div class="hero-badge-tools"><div class="hero-badge-control-row"><p id="hero-badge-hint" class="hero-badge-hint">Meet the person. Explore the work.</p><div class="hero-badge-controls"><button type="button" data-badge-turn hidden>Turn card</button><button type="button" data-badge-motion aria-pressed="false" hidden>Pause motion</button></div></div><nav class="hero-badge-chapters" aria-label="Explore Vigo’s badge"><a href="work.html" data-hero-chapter="work">Work</a><a href="#selected-work" data-hero-chapter="demos">Demos</a><a href="about.html" data-hero-chapter="skills">Skills</a><a href="about.html" data-hero-chapter="about">About</a><a href="contact.html" data-hero-chapter="contact">Contact</a></nav></div><p class="hero-badge-status" data-badge-status role="status" aria-live="polite"></p>
    </div>
    <div class="hero-baseline"><span>Listen. Ask. Improve.</span><span>QUT · Graduating ${esc(p.graduation)}</span></div>
  </div></section>
  <dialog id="hero-badge-dialog" aria-labelledby="hero-chapter-title" aria-describedby="hero-chapter-intro"><div class="hero-chapter-header"><p class="label" id="hero-chapter-eyebrow"></p><button type="button" data-badge-close aria-label="Close chapter" autofocus>×</button></div><div class="chapter-scroll"><h2 id="hero-chapter-title"></h2><p id="hero-chapter-intro" class="hero-chapter-intro"></p><div id="hero-chapter-body"></div></div><footer class="hero-chapter-footer"><span>VIGO DANG</span><button type="button" data-badge-close>Back to the badge</button></footer></dialog>
  <section class="selected wrap" id="selected-work" aria-labelledby="selected-title"><div class="section-heading" data-reveal><div><p class="label">Selected work</p><h2 id="selected-title">Built to be<br><span>used.</span></h2></div><div><p>Three demos you can explore.<br>Real project decisions behind each one.</p>${link('work.html','View all six projects')}</div></div><div class="project-showcases">${['dataset-health','crdc-capstone','strobe-ai'].map(projectFor).filter(pr=>pr.liveDemo).map(demoFeature).join('')}</div></section>
  <section class="human-note wrap" data-reveal><p class="label">A little about me</p><h2>Curious by nature.<br>Better with feedback.</h2><div><p>I grew up in Biên Hòa, Đồng Nai, and now study in Brisbane. I listen first, ask when I’m unsure and keep improving what I build.</p>${link('about.html','Meet the person behind the work')}</div></section>`;
}

function work() {
  return `<section class="page-intro wrap" data-reveal><p class="label">Selected projects</p><h1>Ideas into<br><span class="heading-continuation">working tools.</span></h1><p class="lede">Data and cloud workflows, applied AI and the software foundations behind them. Start with a live demo, or read how I approached the work.</p></section>
  <section class="work-index wrap" aria-label="Project case studies">${orderedProjects.map(project=>`<article class="work-row"><div class="work-preview">${project.liveDemo?demoCapture(project,''):figure(project,'',true)}</div><div class="work-summary"><p class="label">${esc(projectPath(project))}</p><p class="work-project-type">${esc(project.type)}</p><h2><a href="projects/${project.slug}.html">${esc(project.title)}</a></h2><p>${esc(project.summary)}</p><dl class="row-details"><div><dt>Scope</dt><dd>${esc(project.role)}</dd></div><div><dt>Tools</dt><dd>${esc(project.technologies)}</dd></div></dl><p class="evidence-line">${esc(project.evidenceLabel)}</p></div></article>`).join('')}</section><div class="further-work wrap"><p class="label">Deep Learning / Further implementation</p><h2>Drone imagery segmentation</h2><p>A TensorFlow/Keras residual U-Net-style pipeline with RGB + DSM inputs and tiled inference. Implementation experience is supported by source; model-quality results have not been independently reproduced.</p>${link(p.deepLearningSource,'Inspect the model implementation')}</div>`;
}

function about() {
  return `<section class="about-intro wrap"><div class="about-intro-copy"><p class="label">About Vigo</p><h1>Hi, I’m Vigo.</h1><p class="lede">I’m ${esc(p.fullName)}, usually Vigo. I grew up in Biên Hòa, Đồng Nai, Vietnam, and now study Data Science at QUT in Brisbane.</p><dl class="about-facts"><div><dt>Study</dt><dd>Bachelor of Data Science at QUT</dd></div><div><dt>Graduation</dt><dd>Expected ${esc(p.graduation)}</dd></div><div><dt>Focus</dt><dd>${esc(p.positioning.role)}</dd></div></dl><div class="hero-actions">${link('work.html','Explore my work')}</div></div><figure class="about-portrait">${portrait('about-photo','(max-width: 403px) calc(100vw - 44px), (max-width: 600px) 360px, (max-width: 900px) 280px, (max-width: 1100px) 320px, 360px')}<figcaption>Brisbane, Australia</figcaption></figure></section>
  <section class="about-practice wrap" data-reveal><header class="block-heading"><p class="label">How I work with people</p><h2>Listen. Build.<br>Learn together.</h2><p>${esc(p.positioning.approach)}</p></header><ol class="practice-grid" role="list"><li><h3>Listen first.</h3><p>I try to understand what someone needs before deciding what to make.</p></li><li><h3>Use feedback.</h3><p>I’m open to different views and use feedback to improve the next version.</p></li><li><h3>Keep learning.</h3><p>I ask when something is unclear, test what I can and explain what still needs work.</p></li></ol></section>
  <section class="skills-section wrap" data-reveal><div><p class="label">Technical practice</p><h2>Software around data.</h2><p class="section-summary">My projects span desktop prediction workflows, asynchronous cloud processing and source-linked retrieval.</p></div><div class="skill-lines">${p.skills.map(group=>`<p><strong>${esc(group.label)}</strong>${esc(group.items)}</p>`).join('')}<div class="implementation-note"><p>My deep learning work includes RGB and elevation inputs, a TensorFlow/Keras segmentation model and tiled inference for drone imagery.</p>${link(p.deepLearningSource,'View the segmentation implementation')}</div></div></section>
  <section class="education wrap" data-reveal><div><p class="label">Education & recognition</p><h2>A foundation to build on.</h2></div><div><h3>${esc(p.university)}</h3><p>${esc(p.degree)}<br>Minor: ${esc(p.minor)}<br>Expected graduation: ${esc(p.graduation)}</p><p class="recognition">${esc(p.award)}</p>${link('experience.html','Education & project experience')}</div></section>`;
}

function experience() {
 return `<section class="page-intro wrap"><p class="label">Education & project experience</p><h1>Learning through<br><span class="heading-continuation">systems and teams.</span></h1><p class="lede">A concise record of education and academic project work. These projects are distinct from professional employment.</p></section><section class="timeline wrap" aria-label="Education and project record"><article><p class="label">Expected ${esc(p.graduation)}</p><div><h2>${esc(p.degree)}</h2><p>${esc(p.university)}, Brisbane.<br>Minor: ${esc(p.minor)}.</p><p>${esc(p.award)}</p></div></article><article><p class="label">QUT / Team capstone</p><div><h2>Research synthesis with CRDC</h2><p>A student team partnering with the Cotton Research and Development Corporation. My emphasis: lead-agent orchestration, task-specific retrieval and evidence evaluation.</p>${link('projects/crdc-capstone.html','Read the capstone case study')}</div></article><article><p class="label">Academic / Project work</p><div><h2>Software around data</h2><p>Cloud media workflows, a desktop prediction application and graph routing. Each project has its own role, evidence and limitations in the case-study index.</p>${link('work.html','Browse the projects')}</div></article></section>`;
}

function resume() {
 return `<section class="page-intro wrap"><p class="label">Résumé</p><h1>${esc(p.name)}.<br><span class="heading-continuation">Software meets data.</span></h1><p class="lede">${esc(r.name)}<br>${esc(r.headline)}<br>${esc(r.location)} · Expected graduation: ${esc(r.education.graduation)}</p><div class="action-row">${pdfLink('','button')}<button class="text-link print-button" type="button" data-print>Print this page <span aria-hidden="true">↗</span></button></div><p class="source-note">Download a selectable-text PDF, or read the same CV content below.</p></section><div class="resume-content wrap"><section><h2>Profile</h2><div><p>${esc(r.summary)}</p></div></section><section><h2>Technical capabilities</h2><div class="skill-lines">${r.skills.map(group=>`<p><strong>${esc(group.label)}</strong>${esc(group.items)}</p>`).join('')}</div></section><section><h2>Selected projects</h2><div>${r.projects.map(pr=>`<article class="resume-project"><p class="label">${esc(pr.period)} · ${esc(pr.type)}</p><h3>${link('projects/'+pr.slug+'.html',pr.title)}</h3><p>${esc(pr.subtitle)}</p><p class="tech">${esc(pr.technologies)}</p><ul>${pr.bullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul></article>`).join('')}</div></section><section><h2>Analytical work</h2><div>${r.additional.map(item=>`<article class="resume-project"><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></article>`).join('')}</div></section><section><h2>Education & recognition</h2><div><h3>${esc(r.education.university)}</h3><p>${esc(r.education.degree)}<br>Minor: ${esc(r.education.minor)}<br>Expected ${esc(r.education.graduation)} · ${esc(r.education.location)}</p><p>${esc(r.education.award)}</p></div></section><section><h2>Contact</h2><div><p>${link('tel:+61410107614',r.phone)}</p><p>${link('mailto:'+r.email,r.email)}</p><p>${link(r.github,'GitHub')}&nbsp; ${link(r.linkedin,'LinkedIn')}</p></div></section></div>`;
}

function contact() {
 return `<section class="contact-page wrap"><p class="label">A conversation starts here</p><h1>Let’s build<br><span class="heading-continuation">something useful.</span></h1><div class="contact-grid"><div class="lede"><p>I’m seeking internship and graduate opportunities in data and cloud engineering.</p><p>If that fits your team, I’d be glad to talk through my work.</p></div><div class="contact-links"><p class="label">The direct route</p>${link('mailto:'+p.email,p.email,'contact-email')}<p>${esc(p.location)}<br>QUT · Expected ${esc(p.graduation)}</p><div class="profile-links">${link(p.github,'GitHub')}${link(p.linkedin,'LinkedIn')}${pdfLink('','text-link')}</div></div></div></section>`;
}

function caseStudy(pr) {
 const sections=[['context','Context'],['problem','Problem'],['contribution','My contribution'],['approach','Implementation'],['decisions','Trade-offs'],['evidence','Evidence'],['limitations','Limitations']];
 const entries=visualEntries(pr);
 return `<div class="case-breadcrumb wrap">${link('../work.html','All work')}<span class="label">Case ${pr.number} / ${esc(pr.category)}</span></div><header class="case-header wrap"><p class="label">${esc(pr.type)}</p><h1>${esc(pr.title)}</h1><p class="case-deck">${esc(pr.deck)}</p><dl class="case-meta"><div><dt>My focus</dt><dd>${esc(pr.role)}</dd></div><div><dt>Built with</dt><dd>${esc(pr.technologies)}</dd></div><div><dt>Project period</dt><dd>${esc(pr.period)}</dd></div></dl></header>${pr.liveDemo?`<div class="case-demo-intro wrap">${link(pr.liveDemo.url,'Open live demo','button')}<p>${esc(pr.liveDemo.scope)}</p></div>`:''}<div class="case-visual wrap">${pr.liveDemo?demoCapture(pr,'../'):figure(pr,'../')}${pr.liveDemo&&pr.slug==='dataset-health'?link('../'+viewerRoute(pr,entries[0]),'View original report capture','visual-link'):''}</div><div class="case-layout wrap"><aside class="contents"><details><summary>In this project</summary><nav aria-label="Case study contents">${sections.map(([id,label],i)=>`<a href="#${id}"><span>0${i+1}</span>${label}</a>`).join('')}</nav></details></aside><article class="case-body">
 <section id="context"><p class="label">01 / Context</p><h2>The project.</h2><p class="article-lede">${esc(pr.context)}</p>${pr.liveDemo?`<p>${esc(pr.liveDemo.deployment)}</p>`:''}</section>
 <section id="problem"><p class="label">02 / Problem</p><h2>What needed solving.</h2><p>${esc(pr.problem)}</p></section>
 <section id="contribution"><p class="label">03 / My contribution</p><h2>My part in the work.</h2><p>${esc(pr.contribution)}</p></section>
 <section id="approach"><p class="label">04 / Architecture & implementation</p><h2>How the pieces work.</h2><p>${esc(pr.approach)}</p>${pr.liveDemo&&pr.slug==='crdc-capstone'?figure(pr,'../'):''}${pr.architecture?figure(pr,'../',false,entries.find(v=>v.key==='architecture')):''}${(pr.details||[]).map((v,i)=>figure(pr,'../',false,entries.find(v=>v.key==='detail-'+(i+1)))).join('')}</section>
 <section id="decisions"><p class="label">05 / Engineering trade-offs</p><h2>Why these choices.</h2><ol class="decisions" role="list">${pr.decisions.map(([heading,text])=>`<li><h3>${esc(heading)}</h3><p>${esc(text)}</p></li>`).join('')}</ol></section>
 <section id="evidence"><p class="label">06 / Evidence & verification</p><h2>Results and verification.</h2><div class="evidence-box"><p>${esc(pr.proof)}</p></div>${pr.liveDemo&&pr.slug==='strobe-ai'?figure(pr,'../'):''}${pr.evidenceVisual?figure(pr,'../',false,entries.find(v=>v.key==='results')):''}${evidenceTable(pr)}<ul class="evidence-notes">${pr.proofNotes.map(note=>`<li>${esc(note)}</li>`).join('')}</ul><p class="source-note">${esc(pr.source)}</p></section>
 <section id="limitations"><p class="label">07 / Limitations</p><h2>Limits and next steps.</h2><p>${esc(pr.limitations)}</p></section>${pr.resources.length?`<section class="resources"><h2>Source & resources.</h2>${pr.resources.map(([label,url])=>link(url,label)).join('')}</section>`:''}</article></div><div class="case-next wrap"><p class="label">Next project</p>${link('../projects/'+orderedProjects[(orderedProjects.indexOf(pr)+1)%orderedProjects.length].slug+'.html',orderedProjects[(orderedProjects.indexOf(pr)+1)%orderedProjects.length].title,'next-title')}</div>`;
}

export async function render() {
 for (const pr of projects) {
   if (!/^[a-z0-9-]+$/.test(pr.slug) || !['sage','clay','paper'].includes(pr.theme)) throw new Error('Invalid project route or theme');
 }
 await mkdir('src/projects',{recursive:true});
 await mkdir('src/visuals',{recursive:true});
 const pages = [
  ['index.html','Data & cloud engineering','Vigo Dang, a QUT Data Science student in Brisbane seeking data and cloud engineering internship and graduate opportunities. Project work, public demos and traceable evidence.',home(),''],
  ['work.html','Selected work','Vigo Dang’s project work in data and cloud workflows, applied AI and software foundations. Contributions, public demos and evidence.',work(),'Work'],
  ['about.html','About','Meet Vigo Dang: QUT Bachelor of Data Science student in Brisbane, expected graduation '+p.graduation+'.',about(),'About'],
  ['experience.html','Education & project experience','Education and clearly scoped academic project experience for Vigo Dang.',experience(),'About'],
  ['resume.html','Résumé','Current public résumé summary for Vigo Dang, QUT data science student, expected '+p.graduation+'.',resume(),'Resume'],
  ['contact.html','Contact','Contact Vigo Dang in Brisbane about internship and graduate opportunities in data and cloud engineering.',contact(),'Contact'],
  ...projects.map(pr=>['projects/'+pr.slug+'.html',pr.title,pr.summary,caseStudy(pr),'Work']),
  ...projects.flatMap(pr=>visualEntries(pr).map(v=>[viewerRoute(pr,v),pr.title+' — '+v.label,v.caption,viewerPage(pr,v),'Work']))
 ];
 for(const [route,title,desc,body,active] of pages) await writeFile('src/'+route,shell(route,title,desc,body,active).replace(/[ \t]+\n/g,'\n'));
 await writeFile('src/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(([route])=>`<url><loc>https://vigodang.github.io/${route==='index.html'?'':route}</loc></url>`).join('')}</urlset>\n`);
 await writeFile('src/robots.txt','User-agent: *\nAllow: /\nSitemap: https://vigodang.github.io/sitemap.xml\n');
 console.log(`Rendered ${pages.length} pages from shared content and templates`);
}
