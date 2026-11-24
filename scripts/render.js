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
  const storyRoute = route === 'index.html' ? 'home' : route === 'about.html' ? 'about' : null;
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
  ${storyRoute?'<link rel="stylesheet" href="scroll-story.css">':''}
  <script src="${pre}script.js" defer></script>
  ${route==='index.html'?'<script src="hero-badge.js" type="module"></script>':''}
  ${storyRoute?'<script src="scroll-story.js" type="module"></script>':''}
</head>
<body class="portfolio page-${pageClass}"${storyRoute?` data-scroll-story="${storyRoute}"`:""}>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header wrap">
    <a class="brand" href="${pre}index.html" aria-label="Vigo Dang home">VD<span class="brand-stop" aria-hidden="true">.</span></a>
    <button class="nav-toggle" type="button" aria-controls="site-nav" aria-expanded="false" data-nav-toggle>Menu <span aria-hidden="true">+</span></button>
    <nav id="site-nav" aria-label="Main navigation" data-nav-links>${nav}<a class="nav-cv" href="${pre}resume.html"${active==='Resume'?' aria-current="page"':''}>Résumé</a></nav>
  </header>
  <main id="main" tabindex="-1">${body}</main>
  <footer class="site-footer">
    <div class="wrap"><div class="footer-invitation" data-reveal><p class="label">Data & Cloud Engineering · Internship / Graduate</p><h2>Get in touch.</h2>${link('mailto:'+p.email,'Email me','button')}</div>
    <div class="footer-bottom"><p>${esc(p.name)}<span>${esc(p.location)}</span></p><div>${link(p.github,'GitHub')}${link(p.linkedin,'LinkedIn')}${link(pre+'resume.html','Résumé')}</div></div></div>
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
   'dataset-health': ['Upload a CSV or use a sample to check missing values, duplicates and column types.', 'Browser-local analysis · synthetic samples'],
   'strobe-ai': ['Create a sample post, add a comment and try the photo search assistant.', 'Simulated sign-in · template replies · no live AI'],
   'crdc-capstone': ['Pick a sample question and look through the response and cited passages.', 'Synthetic research demo · example responses']
 }[pr.slug];
 const title=pr.slug==='crdc-capstone'?'CRDC Research Assistant':pr.title;
 return `<article class="project-showcase showcase-${esc(pr.slug)}"><div class="showcase-copy"><p class="label">${esc(pr.slug==='dataset-health'?'Featured · Data & Cloud':d.category)}</p><h3><a href="projects/${pr.slug}.html">${esc(title)}</a></h3><p class="showcase-description">${esc(copy[0])}</p><div class="demo-actions">${link(d.url,'Try the demo','button')}${link('projects/'+pr.slug+'.html','Read the case study')}</div><p class="demo-scope">${esc(copy[1])}</p></div><a class="showcase-preview" href="${esc(d.url)}" aria-label="Try the ${esc(pr.title)} live demo"><div class="browser-top" aria-hidden="true"><span></span><span></span><span></span><span class="browser-title">${esc(d.label)}</span></div><img src="assets/${esc(d.image)}" width="${d.width}" height="${d.height}" alt="${esc(d.alt)}" loading="lazy" decoding="async"></a></article>`;
}

function demoMotionIntro() {
  const d=projectFor('dataset-health').liveDemo;
  return `<div class="demo-motion motion-sequence" data-motion-sequence="demos"><div class="motion-stage"><h2 id="selected-title" class="sequence-title"><span>Live</span><span>demos</span></h2><div class="sequence-copy"><p class="label">Projects</p><p>These three projects have demos you can open in your browser. Each case study explains what I worked on and what the demo includes.</p>${link('work.html','View all six projects')}</div><a class="sequence-feature" href="${esc(d.url)}" aria-label="Try the Dataset Health Analyzer live demo"><div class="browser-top" aria-hidden="true"><span></span><span></span><span></span><span class="browser-title">Dataset Health Analyzer</span></div><img src="assets/${esc(d.image)}" width="${d.width}" height="${d.height}" alt="${esc(d.alt)}" loading="lazy" decoding="async"></a></div></div>`;
}

function portrait(cls, sizes) {
  return `<picture class="portrait-picture ${cls}"><source type="image/webp" srcset="assets/vigo-portrait-cutout.webp"><img src="assets/vigo-portrait-cutout.png" width="1122" height="1402" alt="Vigo Dang smiling, wearing a rust-coloured polo shirt." fetchpriority="high" decoding="async"></picture>`;
}

function home() {
  return `<section class="hero hero-badge-experience" aria-labelledby="hero-name"><div class="wrap">
    <div class="hero-top"><p class="label">Personal portfolio</p><p class="hero-location">${esc(p.location)}</p></div>
    <div class="hero-stage"><div class="hero-copy"><h1 id="hero-name" class="hero-name" aria-label="Vigo Dang — Data and Cloud Engineering"><span>DATA</span> <span>CLOUD<span class="name-stop">.</span></span></h1><div class="hero-story"><p class="hero-intro">I build data and<br>cloud applications.</p><p class="hero-focus">I’m looking for a Data / Cloud Engineering<br>internship or graduate role in Brisbane.</p><div class="hero-actions">${link('#selected-work','View my projects','button')}${pdfLink('','text-link')}</div></div></div>
      <div id="hero-badge-stage" class="hero-badge-stage" role="region" aria-label="Vigo Dang’s portfolio badge. Choose a chapter below to explore." aria-describedby="hero-badge-hint"><div class="hero-portrait-scene hero-badge-fallback" data-portrait-scene><p class="hero-badge-fallback-label">PORTFOLIO ID</p>${portrait('hero-cutout','')}<div class="hero-badge-fallback-copy"><p>Vigo Dang</p><span>Data &amp; Cloud Engineering</span><small>Open to work</small></div></div><canvas id="hero-badge-canvas" aria-hidden="true"></canvas></div>
      <div class="hero-badge-tools"><div class="hero-badge-control-row"><p id="hero-badge-hint" class="hero-badge-hint">Meet the person. Explore the work.</p><div class="hero-badge-controls"><button type="button" data-badge-turn hidden>Turn card</button><button type="button" data-badge-motion aria-pressed="false" hidden>Pause motion</button></div></div><nav class="hero-badge-chapters" aria-label="Explore Vigo’s badge"><a href="work.html" data-hero-chapter="work">Work</a><a href="#selected-work" data-hero-chapter="demos">Demos</a><a href="about.html" data-hero-chapter="skills">Skills</a><a href="about.html" data-hero-chapter="about">About</a><a href="contact.html" data-hero-chapter="contact">Contact</a></nav></div><p class="hero-badge-status" data-badge-status role="status" aria-live="polite"></p>
    </div>
    <div class="hero-baseline"><span>Brisbane, Australia</span><span>Python · SQL · AWS</span></div>
  </div></section>
  <dialog id="hero-badge-dialog" aria-labelledby="hero-chapter-title" aria-describedby="hero-chapter-intro"><div class="hero-chapter-header"><p class="label" id="hero-chapter-eyebrow"></p><button type="button" data-badge-close aria-label="Close chapter" autofocus>×</button></div><div class="chapter-scroll"><h2 id="hero-chapter-title"></h2><p id="hero-chapter-intro" class="hero-chapter-intro"></p><div id="hero-chapter-body"></div></div><footer class="hero-chapter-footer"><span>VIGO DANG</span><button type="button" data-badge-close>Back to the badge</button></footer></dialog>
  <section class="selected wrap" id="selected-work" aria-labelledby="selected-title">${demoMotionIntro()}<div class="project-showcases">${['dataset-health','crdc-capstone','strobe-ai'].map(projectFor).filter(pr=>pr.liveDemo).map(demoFeature).join('')}</div></section>
  <section class="human-note wrap"><p class="label">About</p><h2>A bit<br>about me</h2><div><p>I’m from Vietnam and now live in Brisbane. I like travelling, finding new places to eat and taking photos.</p>${link('about.html','Read about me')}</div></section>`;
}

function work() {
  return `<section class="page-intro wrap" data-reveal><p class="label">Work</p><h1>My projects</h1><p class="lede">Here are six projects I’ve worked on. The case studies describe my role, implementation decisions and results; three also have demos you can try.</p></section>
  <section class="work-index wrap" aria-label="Project case studies">${orderedProjects.map(project=>`<article class="work-row"><div class="work-preview">${project.liveDemo?demoCapture(project,''):figure(project,'',true)}</div><div class="work-summary"><p class="label">${esc(projectPath(project))}</p><p class="work-project-type">${esc(project.type)}</p><h2><a href="projects/${project.slug}.html">${esc(project.title)}</a></h2><p>${esc(project.summary)}</p><dl class="row-details"><div><dt>Scope</dt><dd>${esc(project.role)}</dd></div><div><dt>Tools</dt><dd>${esc(project.technologies)}</dd></div></dl><p class="evidence-line">${esc(project.evidenceLabel)}</p></div></article>`).join('')}</section><div class="further-work wrap"><p class="label">Deep Learning / Further implementation</p><h2>Drone imagery segmentation</h2><p>A TensorFlow/Keras residual U-Net-style pipeline with RGB + DSM inputs and tiled inference. Implementation experience is supported by source; model-quality results have not been independently reproduced.</p>${link(p.deepLearningSource,'Inspect the model implementation')}</div>`;
}

function about() {
  const photo=(name,alt,{wide=false,eager=false}={})=>`<figure><div class="story-photo-media"><img src="assets/about/${name}.webp" width="${wide?2048:1365}" height="${wide?1365:2048}" alt="${esc(alt)}" loading="${eager?'eager':'lazy'}"${eager?' fetchpriority="high"':''} decoding="async"></div></figure>`;
  const spread=(id,title,copy,media,{first=false,pair=false}={})=>`<article class="story-spread" aria-labelledby="${id}"><div class="spread-copy">${first?'<p class="label">About me</p>':''}<${first?'h1':'h2'} id="${id}" class="spread-title">${title}</${first?'h1':'h2'}><div class="spread-body">${copy}</div></div><div class="spread-media ${pair?'photo-pair':'photo-wide'}">${media}</div></article>`;
  return `<section class="world-sequence everyday-world" data-motion-sequence="world" aria-label="Everyday life"><div class="world-stage"><div class="world-track">${spread('about-title','Hi,<br>I’m Vigo.','<p>I’m from Vietnam and I live in Brisbane, where I work on data and cloud projects.</p><p>I like trying new places to eat, travelling and taking photos. I enjoy dressing well, and I don’t mind a silly photo either.</p>',photo('everyday-celery','Vigo playfully posing with a large bunch of celery in a supermarket.',{eager:true})+photo('coffee-candid','Vigo taking a sip from a takeaway cup, wearing a rust-coloured polo.',{eager:true}),{first:true,pair:true})}${spread('food-title','Food and<br>photos','<p>I enjoy going out for a meal and trying food I haven’t had before. I take photos along the way, and I like keeping the funny ones too.</p>',photo('fries-candid','A candid close-up of Vigo taking a bite of food.')+photo('sushi-candid','Vigo holding sushi with chopsticks and making a playful expression.'),{pair:true})}</div></div></section>
  <section class="world-sequence outside-world" data-motion-sequence="world" aria-label="Travel and working with me"><div class="world-stage"><div class="world-track">${spread('travel-title','Travelling<br>in Vietnam','<p>I’ve travelled to Đà Nẵng, Huế and Hội An.</p>',photo('table-by-the-water','Vigo seated at an outdoor table with a meal and water in the background.',{wide:true}))}${spread('hoi-an-title','Hội An','<p>I like exploring a place, trying the food and stopping for a photo when something catches my eye.</p>',photo('hoi-an-stop','Vigo holding a drink outside a leafy shop with a Hội An sign.',{wide:true}))}${spread('people-title','Working<br>with me','<p>I’m easygoing and I like a laugh. In a team, I try to listen before jumping in, ask questions when I’m unsure, and take feedback seriously.</p><p>I’m looking for an internship or graduate role in Data or Cloud Engineering. I’d like to contribute to a team that shares ideas, gives useful feedback and takes care with its work.</p><div class="story-next">'+link('work.html','View my projects')+link('contact.html','Contact me')+'</div>',photo('travel-wander','Vigo wearing sunglasses and a dark shirt beside a stone wall and trees.')+photo('sushi-portrait','Vigo looking at the camera with a relaxed expression while holding sushi.'),{pair:true})}</div></div></section>
  <section class="about-story-foundation wrap" aria-labelledby="foundation-title"><div class="story-signoff">${portrait('story-signoff-photo','96px')}<div><h2 id="foundation-title">Education</h2><p>${esc(p.fullName)}<br>${esc(p.positioning.role)} · ${esc(p.location)}</p></div></div><div class="story-study"><h3>${esc(p.university)}</h3><p>${esc(p.degree)}<br>Minor: ${esc(p.minor)}<br>Expected graduation: ${esc(p.graduation)}</p><p>${esc(p.award)}</p>${link('experience.html','Education & project experience')}${pdfLink('','text-link')}</div><details class="story-background"><summary>Technical skills <span>Programming, cloud and machine learning</span></summary><div class="story-background-content"><p>My projects span desktop prediction workflows, asynchronous cloud processing and source-linked retrieval.</p><div class="story-skill-lines">${p.skills.map(group=>`<p><strong>${esc(group.label)}</strong>${esc(group.items)}</p>`).join('')}</div><p>My deep learning work includes RGB and elevation inputs, a TensorFlow/Keras segmentation model and tiled inference for drone imagery.</p>${link(p.deepLearningSource,'View the segmentation implementation')}</div></details></section>`;
}

function experience() {
 return `<section class="page-intro wrap"><p class="label">Education & project experience</p><h1>Education and<br><span class="heading-continuation">project experience</span></h1><p class="lede">My education and the projects I’ve worked on, with links to my contributions and the implementation details.</p></section><section class="timeline wrap" aria-label="Education and project record"><article><p class="label">Expected ${esc(p.graduation)}</p><div><h2>${esc(p.degree)}</h2><p>${esc(p.university)}, Brisbane.<br>Minor: ${esc(p.minor)}.</p><p>${esc(p.award)}</p></div></article><article><p class="label">Team research project</p><div><h2>Research synthesis with CRDC</h2><p>A team research project with the Cotton Research and Development Corporation. My emphasis: lead-agent orchestration, task-specific retrieval and evidence evaluation.</p>${link('projects/crdc-capstone.html','Read the capstone case study')}</div></article><article><p class="label">Engineering projects</p><div><h2>Software around data</h2><p>Cloud media workflows, a desktop prediction application and graph routing. Each project has its own role, evidence and limitations in the case-study index.</p>${link('work.html','Browse the projects')}</div></article></section>`;
}

function resume() {
 return `<section class="page-intro wrap"><p class="label">Résumé</p><h1>${esc(p.name)}.<br><span class="heading-continuation">Résumé</span></h1><p class="lede">${esc(r.name)}<br>${esc(r.headline)}<br>${esc(r.location)} · Expected graduation: ${esc(r.education.graduation)}</p><div class="action-row">${pdfLink('','button')}<button class="text-link print-button" type="button" data-print>Print this page <span aria-hidden="true">↗</span></button></div><p class="source-note">Download a selectable-text PDF, or read the same CV content below.</p></section><div class="resume-content wrap"><section><h2>Profile</h2><div><p>${esc(r.summary)}</p></div></section><section><h2>Technical capabilities</h2><div class="skill-lines">${r.skills.map(group=>`<p><strong>${esc(group.label)}</strong>${esc(group.items)}</p>`).join('')}</div></section><section><h2>Selected projects</h2><div>${r.projects.map(pr=>`<article class="resume-project"><p class="label">${esc(pr.period)} · ${esc(pr.type)}</p><h3>${link('projects/'+pr.slug+'.html',pr.title)}</h3><p>${esc(pr.subtitle)}</p><p class="tech">${esc(pr.technologies)}</p><ul>${pr.bullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul></article>`).join('')}</div></section><section><h2>Analytical work</h2><div>${r.additional.map(item=>`<article class="resume-project"><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></article>`).join('')}</div></section><section><h2>Education & recognition</h2><div><h3>${esc(r.education.university)}</h3><p>${esc(r.education.degree)}<br>Minor: ${esc(r.education.minor)}<br>Expected ${esc(r.education.graduation)} · ${esc(r.education.location)}</p><p>${esc(r.education.award)}</p></div></section><section><h2>Contact</h2><div><p>${link('tel:+61410107614',r.phone)}</p><p>${link('mailto:'+r.email,r.email)}</p><p>${link(r.github,'GitHub')}&nbsp; ${link(r.linkedin,'LinkedIn')}</p></div></section></div>`;
}

function contact() {
 return `<section class="contact-page wrap"><p class="label">Contact</p><h1>Contact me</h1><div class="contact-grid"><div class="lede"><p>I’m looking for a Data or Cloud Engineering internship or graduate role in Brisbane.</p><p>You can email me about a role, a project, or a question about my work.</p></div><div class="contact-links"><p class="label">Email</p>${link('mailto:'+p.email,p.email,'contact-email')}<p>${esc(p.location)}<br>Data &amp; Cloud Engineering</p><div class="profile-links">${link(p.github,'GitHub')}${link(p.linkedin,'LinkedIn')}${pdfLink('','text-link')}</div></div></div></section>`;
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
  ['index.html','Data & cloud engineering','Vigo Dang’s personal portfolio: data and cloud engineering projects, public demos and implementation details. Based in Brisbane and seeking internship or graduate opportunities.',home(),''],
  ['work.html','Projects','Vigo Dang’s project work in data and cloud workflows, applied AI and software foundations. Contributions, public demos and evidence.',work(),'Work'],
  ['about.html','About','About Vigo Dang, based in Brisbane and originally from Vietnam. Interests, photos, teamwork, education and technical skills.',about(),'About'],
  ['experience.html','Education & project experience','Vigo Dang’s education, engineering projects and contributions to team research.',experience(),'About'],
  ['resume.html','Résumé','Vigo Dang’s résumé: technical skills, data and cloud projects, education and contact details.',resume(),'Resume'],
  ['contact.html','Contact','Contact Vigo Dang in Brisbane about internship and graduate opportunities in data and cloud engineering.',contact(),'Contact'],
  ...projects.map(pr=>['projects/'+pr.slug+'.html',pr.title,pr.summary,caseStudy(pr),'Work']),
  ...projects.flatMap(pr=>visualEntries(pr).map(v=>[viewerRoute(pr,v),pr.title+' — '+v.label,v.caption,viewerPage(pr,v),'Work']))
 ];
 for(const [route,title,desc,body,active] of pages) await writeFile('src/'+route,shell(route,title,desc,body,active).replace(/[ \t]+\n/g,'\n'));
 await writeFile('src/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(([route])=>`<url><loc>https://vigodang.github.io/${route==='index.html'?'':route}</loc></url>`).join('')}</urlset>\n`);
 await writeFile('src/robots.txt','User-agent: *\nAllow: /\nSitemap: https://vigodang.github.io/sitemap.xml\n');
 console.log(`Rendered ${pages.length} pages from shared content and templates`);
}
