import { writeFile, mkdir } from 'node:fs/promises';
import { profile as p, projects } from '../content/site.js';
import { resumeData as r } from '../content/resume.js';

const esc = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const arrow = '<span aria-hidden="true">↗</span>';
const link = (href, text, cls='text-link') => `<a class="${cls}" href="${esc(href)}">${esc(text)} ${arrow}</a>`;
const stamp = '<span class="crosshair" aria-hidden="true">+</span>';
const pdfLink = (prefix, cls='') => p.pdf ? `<a class="${cls}" href="${esc(prefix+p.pdf)}" download>Download résumé PDF ${arrow}</a>` : '';

function shell(route, title, description, body, active='') {
  const pre = route.includes('/') ? '../' : '';
  const canonical = `https://vigodang.github.io/${route === 'index.html' ? '' : route}`;
  const nav = [['work.html','Work'],['about.html','About'],['contact.html','Contact']].map(([url,label])=>`<a href="${pre}${url}"${active===label?` aria-current="${route===url?'page':'true'}"`:''}>${label}</a>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#F5F2EB">
  <title>${esc(title)} | Vigo Dang</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${esc(title)} | Vigo Dang">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="${pre?'article':'website'}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="https://vigodang.github.io/assets/og-image.png">
  <meta property="og:image:alt" content="Vigo Dang — software, data and thoughtful systems">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${pre}assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${pre}styles.css">
  <link rel="stylesheet" href="${pre}layout-refinement.css">
  <link rel="stylesheet" href="${pre}case-refinement.css">
  <script src="${pre}script.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header wrap">
    <a class="brand" href="${pre}index.html" aria-label="Vigo Dang home">${stamp}<span>Vigo Dang<span class="brand-sub">Software & data</span></span></a>
    <button class="nav-toggle" type="button" aria-controls="site-nav" aria-expanded="false" data-nav-toggle>Menu <span aria-hidden="true">+</span></button>
    <nav id="site-nav" aria-label="Main navigation" data-nav-links>${nav}<a class="nav-cv" href="${pre}resume.html"${active==='Resume'?' aria-current="page"':''}>Résumé ${arrow}</a></nav>
  </header>
  <main id="main" tabindex="-1">${body}</main>
  <footer class="site-footer wrap">
    <div class="footer-top"><p class="label">Software & data opportunities</p>${link('mailto:'+p.email,'Let’s talk.','footer-title')}</div>
    <div class="footer-bottom"><p>${stamp} ${esc(p.name)}<span>${esc(p.location)}</span></p><div>${link(p.github,'GitHub')}${link(p.linkedin,'LinkedIn')}${link(pre+'resume.html','Résumé')}${pdfLink(pre,'text-link')}</div><small>Python / SQL / AWS / Applied AI</small></div>
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
    <div class="visual-stage"><img src="${prefix}assets/${esc(v.src)}" width="${v.width}" height="${v.height}" alt="${esc(v.alt)}"${cover?' loading="lazy"':''}></div>
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
  return `<article class="folio ${extra}"><a class="folio-image" href="projects/${project.slug}.html" aria-label="Read ${esc(project.title)} case study">${figure(project,'',true)}<span class="image-action" aria-hidden="true">↗</span></a><div class="folio-copy"><p class="label"><span>${project.number}</span> ${esc(project.category)}</p><h3><a href="projects/${project.slug}.html">${esc(project.shortTitle)}</a></h3><p>${esc(project.summary)}</p><p class="tech">${esc(project.technologies)}</p>${link('projects/'+project.slug+'.html','Read case study')}</div></article>`;
}

function portrait(cls, sizes) {
  return `<picture class="portrait-picture ${cls}"><source type="image/webp" srcset="assets/vigo-portrait-400.webp 400w, assets/vigo-portrait-640.webp 640w, assets/vigo-portrait-960.webp 960w" sizes="${sizes}"><img src="assets/vigo-portrait-640.jpg" width="640" height="800" alt="Vigo Dang smiling outdoors, wearing a rust-coloured polo shirt." fetchpriority="high" decoding="async"></picture>`;
}

function home() {
  return `<section class="hero wrap">
    <div class="hero-top"><p class="label">Software & data engineering</p><p class="label">${esc(p.location)} <span class="location-dot" aria-hidden="true"></span></p></div>
    <div class="hero-grid"><div class="hero-copy"><h1>From complex data<br>to <em>useful systems.</em></h1><p class="hero-intro">${esc(p.homeIntro)}</p><p class="hero-focus">Software engineering · Machine learning · TensorFlow/Keras deep learning</p><div class="hero-actions">${link('#selected-work','Explore selected work','button')}${link('resume.html','View résumé')}</div></div><figure class="hero-profile">${portrait('hero-portrait','(max-width: 600px) 124px, (max-width: 900px) 240px, (max-width: 1100px) 280px, 320px')}<figcaption><div><p class="portrait-name">Vigo Dang</p><p class="portrait-location">Brisbane, Australia</p></div></figcaption></figure></div>
    <dl class="hero-context"><div><dt>Studying</dt><dd>${esc(p.degree)}<span>QUT · ${esc(p.minor)} minor</span></dd></div><div><dt>Graduation</dt><dd>Expected ${esc(p.graduation)}<span>${esc(p.location)}</span></dd></div><div><dt>Looking for</dt><dd>Internship & early-career roles<span>Data, analytics, software & cloud engineering</span></dd></div></dl>
  </section>
  <section class="selected wrap" id="selected-work" aria-labelledby="selected-title"><div class="section-heading"><div><p class="label">01 / Selected work</p><h2 id="selected-title">Selected projects.</h2></div><p>Cloud applications, applied AI and performance engineering. Open a project for the decisions and evidence.</p>${link('work.html','All work')}</div>${folio(projects[0],'featured')}<div class="folio-pair">${folio(projects[1])}${folio(projects[4])}</div><div class="more-projects">${[projects[2],projects[3]].map(pr=>`<div><p class="label">${esc(pr.category)}</p>${link('projects/'+pr.slug+'.html',pr.title)}</div>`).join('')}</div></section>
  <section class="human-note wrap"><p class="label">02 / Behind the work</p><h2>Connecting the pieces.</h2><div><p>A model needs a usable interface. A queue needs a failure path. An answer needs a source. I’m interested in making those connections clear to the next person.</p>${link('about.html','How I approach the work')}</div></section>`;
}

function work() {
  return `<section class="page-intro wrap"><p class="label">Selected projects / 01—06</p><h1>Selected work.<br><span class="heading-continuation">Open the details.</span></h1><p class="lede">Cloud applications, research workflows, machine learning and performance engineering. Each case explains my contribution, the implementation and the results.</p></section>
  <section class="work-index wrap" aria-label="Project case studies">${projects.map(project=>`<article class="work-row"><div class="work-number label">${project.number} /</div><div class="work-summary"><p class="label">${esc(project.type)}</p><h2><a href="projects/${project.slug}.html">${esc(project.title)}</a></h2><p>${esc(project.summary)}</p><dl class="row-details"><div><dt>Scope</dt><dd>${esc(project.role)}</dd></div><div><dt>Tools</dt><dd>${esc(project.technologies)}</dd></div></dl><p class="evidence-line">${esc(project.evidenceLabel)}</p>${link('projects/'+project.slug+'.html','Open case study')}</div><a class="work-preview" href="projects/${project.slug}.html" aria-label="Read ${esc(project.title)}">${figure(project,'',true)}</a></article>`).join('')}</section><div class="further-work wrap"><p class="label">Deep Learning / Further implementation</p><h2>Drone imagery segmentation</h2><p>A TensorFlow/Keras residual U-Net-style pipeline with RGB + DSM inputs and tiled inference. Implementation experience is supported by source; model-quality results have not been independently reproduced.</p>${link(p.deepLearningSource,'Inspect the model implementation')}</div>`;
}

function about() {
  return `<section class="about-intro wrap"><div class="about-intro-copy"><p class="label">About Vigo</p><h1>Hi, I’m Vigo.</h1><p class="lede">I’m ${esc(p.fullName)}, usually Vigo. I’m based in Brisbane and interested in turning analytical ideas into software people can use.</p><dl class="about-facts"><div><dt>Study</dt><dd>Bachelor of Data Science at QUT</dd></div><div><dt>Graduation</dt><dd>Expected ${esc(p.graduation)}</dd></div><div><dt>Focus</dt><dd>Software, cloud & applied AI</dd></div></dl><div class="hero-actions">${link('work.html','Explore my work','button')}${pdfLink('','text-link')}</div></div><figure class="about-portrait">${portrait('about-photo','(max-width: 403px) calc(100vw - 44px), (max-width: 600px) 360px, (max-width: 900px) 280px, (max-width: 1100px) 320px, 360px')}<figcaption>Brisbane, Australia</figcaption></figure></section>
  <section class="about-practice wrap"><header class="block-heading"><p class="label">01 / How I work</p><h2>Understand it.<br>Build it. Check it.</h2><p>I enjoy understanding a system from the inside: where the data comes from, which component owns a decision, and what happens when something fails.</p></header><ol class="practice-grid" role="list"><li><span class="label">01</span><h3>Make ownership clear.</h3><p>Identify where data, decisions and failure handling belong.</p></li><li><span class="label">02</span><h3>Test an idea early.</h3><p>Check the evidence and record what remains untested.</p></li><li><span class="label">03</span><h3>Explain the trade-offs.</h3><p>Make the implementation understandable to the next person.</p></li></ol></section>
  <section class="skills-section wrap"><div><p class="label">02 / Technical practice</p><h2>Software around data.</h2><p class="section-summary">My projects span desktop prediction workflows, asynchronous cloud processing and source-linked retrieval.</p></div><div class="skill-lines">${p.skills.map(group=>`<p><strong>${esc(group.label)}</strong>${esc(group.items)}</p>`).join('')}<div class="implementation-note"><p>My deep learning work includes RGB and elevation inputs, a TensorFlow/Keras segmentation model and tiled inference for drone imagery.</p>${link(p.deepLearningSource,'View the segmentation implementation')}</div></div></section>
  <section class="education wrap"><div><p class="label">03 / Education & recognition</p><h2>A foundation to build on.</h2></div><div><h3>${esc(p.university)}</h3><p>${esc(p.degree)}<br>Minor: ${esc(p.minor)}<br>Expected graduation: ${esc(p.graduation)}</p><p class="recognition">${esc(p.award)}</p>${link('experience.html','Education & project experience')}</div></section>
  <section class="opportunity-panel wrap"><div><p class="label">04 / Opportunities</p><h2>Learning alongside a team.</h2></div><div><p>I’m seeking internship and early-career opportunities in data, analytics, software and cloud engineering.</p><div class="hero-actions">${link('mailto:'+p.email,'Get in touch','button')}${link('resume.html','View résumé')}</div></div></section>`;
}

function experience() {
 return `<section class="page-intro wrap"><p class="label">Education & project experience</p><h1>Learning through<br><span class="heading-continuation">systems and teams.</span></h1><p class="lede">A concise record of education and academic project work. These projects are distinct from professional employment.</p></section><section class="timeline wrap" aria-label="Education and project record"><article><p class="label">Expected ${esc(p.graduation)}</p><div><h2>${esc(p.degree)}</h2><p>${esc(p.university)}, Brisbane.<br>Minor: ${esc(p.minor)}.</p><p>${esc(p.award)}</p></div></article><article><p class="label">QUT / Team capstone</p><div><h2>Research synthesis with CRDC</h2><p>A student team partnering with the Cotton Research and Development Corporation. My emphasis: lead-agent orchestration, task-specific retrieval and evidence evaluation.</p>${link('projects/crdc-capstone.html','Read the capstone case study')}</div></article><article><p class="label">Academic / Project work</p><div><h2>Software around data</h2><p>Cloud media workflows, a desktop prediction application and graph routing. Each project has its own role, evidence and limitations in the case-study index.</p>${link('work.html','Browse the projects')}</div></article></section>`;
}

function resume() {
 return `<section class="page-intro wrap"><p class="label">Résumé</p><h1>${esc(p.name)}.<br><span class="heading-continuation">Software meets data.</span></h1><p class="lede">${esc(r.name)}<br>${esc(r.headline)}<br>${esc(r.location)} · Expected graduation: ${esc(r.education.graduation)}</p><div class="action-row">${pdfLink('','button')}<button class="text-link print-button" type="button" data-print>Print this page <span aria-hidden="true">↗</span></button>${link('mailto:'+r.email,'Get in touch')}</div><p class="source-note">Download a selectable-text PDF, or read the same CV content below.</p></section><div class="resume-content wrap"><section><h2>Profile</h2><div><p>${esc(r.summary)}</p></div></section><section><h2>Technical capabilities</h2><div class="skill-lines">${r.skills.map(group=>`<p><strong>${esc(group.label)}</strong>${esc(group.items)}</p>`).join('')}</div></section><section><h2>Selected projects</h2><div>${r.projects.map(pr=>`<article class="resume-project"><p class="label">${esc(pr.period)} · ${esc(pr.type)}</p><h3>${link('projects/'+pr.slug+'.html',pr.title)}</h3><p>${esc(pr.subtitle)}</p><p class="tech">${esc(pr.technologies)}</p><ul>${pr.bullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul></article>`).join('')}</div></section><section><h2>Analytical work</h2><div>${r.additional.map(item=>`<article class="resume-project"><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></article>`).join('')}</div></section><section><h2>Education & recognition</h2><div><h3>${esc(r.education.university)}</h3><p>${esc(r.education.degree)}<br>Minor: ${esc(r.education.minor)}<br>Expected ${esc(r.education.graduation)} · ${esc(r.education.location)}</p><p>${esc(r.education.award)}</p></div></section><section><h2>Contact</h2><div><p>${link('tel:+61410107614',r.phone)}</p><p>${link('mailto:'+r.email,r.email)}</p><p>${link(r.github,'GitHub')}&nbsp; ${link(r.linkedin,'LinkedIn')}</p></div></section></div>`;
}

function contact() {
 return `<section class="contact-page wrap"><p class="label">A conversation starts here</p><h1>Let’s build<br><span class="heading-continuation">something useful.</span></h1><div class="contact-grid"><div class="lede"><p>I’m seeking internship and early-career roles in data, analytics, software and cloud engineering.</p><p>I’d be glad to talk through a project here.</p></div><div class="contact-links"><p class="label">The direct route</p>${link('mailto:'+p.email,p.email,'contact-email')}<p>${esc(p.location)}<br>QUT · Expected ${esc(p.graduation)}</p><div class="profile-links">${link(p.github,'GitHub')}${link(p.linkedin,'LinkedIn')}${link('resume.html','Résumé')}${pdfLink('','text-link')}</div></div></div></section>`;
}

function caseStudy(pr) {
 const sections=[['context','Context'],['problem','Problem'],['contribution','My contribution'],['approach','Implementation'],['decisions','Trade-offs'],['evidence','Evidence'],['limitations','Limitations']];
 const entries=visualEntries(pr);
 return `<div class="case-breadcrumb wrap">${link('../work.html','All work')}<span class="label">Case ${pr.number} / ${esc(pr.category)}</span></div><header class="case-header wrap"><p class="label">${esc(pr.type)}</p><h1>${esc(pr.title)}</h1><p class="case-deck">${esc(pr.deck)}</p><dl class="case-meta"><div><dt>My focus</dt><dd>${esc(pr.role)}</dd></div><div><dt>Built with</dt><dd>${esc(pr.technologies)}</dd></div><div><dt>Project period</dt><dd>${esc(pr.period)}</dd></div></dl></header><div class="case-visual wrap">${figure(pr,'../')}</div><div class="case-layout wrap"><aside class="contents"><p class="label">In this project</p><nav aria-label="Case study contents">${sections.map(([id,label],i)=>`<a href="#${id}"><span>0${i+1}</span>${label}</a>`).join('')}</nav></aside><article class="case-body">
 <section id="context"><p class="label">01 / Context</p><h2>The project.</h2><p class="article-lede">${esc(pr.context)}</p></section>
 <section id="problem"><p class="label">02 / Problem</p><h2>What needed solving.</h2><p>${esc(pr.problem)}</p></section>
 <section id="contribution"><p class="label">03 / My contribution</p><h2>My part in the work.</h2><p>${esc(pr.contribution)}</p></section>
 <section id="approach"><p class="label">04 / Architecture & implementation</p><h2>How the pieces work.</h2><p>${esc(pr.approach)}</p>${pr.architecture?figure(pr,'../',false,entries.find(v=>v.key==='architecture')):''}${(pr.details||[]).map((v,i)=>figure(pr,'../',false,entries.find(v=>v.key==='detail-'+(i+1)))).join('')}</section>
 <section id="decisions"><p class="label">05 / Engineering trade-offs</p><h2>Why these choices.</h2><ol class="decisions" role="list">${pr.decisions.map(([heading,text])=>`<li><h3>${esc(heading)}</h3><p>${esc(text)}</p></li>`).join('')}</ol></section>
 <section id="evidence"><p class="label">06 / Evidence & verification</p><h2>Results and verification.</h2><div class="evidence-box"><p>${esc(pr.proof)}</p></div>${pr.evidenceVisual?figure(pr,'../',false,entries.find(v=>v.key==='results')):''}${evidenceTable(pr)}<ul class="evidence-notes">${pr.proofNotes.map(note=>`<li>${esc(note)}</li>`).join('')}</ul><p class="source-note">${esc(pr.source)}</p></section>
 <section id="limitations"><p class="label">07 / Limitations</p><h2>Limits and next steps.</h2><p>${esc(pr.limitations)}</p></section>${pr.resources.length?`<section class="resources"><h2>Source & resources.</h2>${pr.resources.map(([label,url])=>link(url,label)).join('')}</section>`:''}</article></div><div class="case-next wrap"><p class="label">Next project</p>${link('../projects/'+projects[(projects.indexOf(pr)+1)%projects.length].slug+'.html',projects[(projects.indexOf(pr)+1)%projects.length].title,'next-title')}</div>`;
}

export async function render() {
 for (const pr of projects) {
   if (!/^[a-z0-9-]+$/.test(pr.slug) || !['sage','clay','paper'].includes(pr.theme)) throw new Error('Invalid project route or theme');
 }
 await mkdir('src/projects',{recursive:true});
 await mkdir('src/visuals',{recursive:true});
 const pages = [
  ['index.html','Software, data & thoughtful systems','Vigo Dang, a QUT data science student in Brisbane. Selected engineering projects, careful decisions and traceable evidence.',home(),''],
  ['work.html','Selected work','Software and data case studies: Strobe AI, credit scoring, graph routing, research synthesis and dataset health analysis.',work(),'Work'],
  ['about.html','About','Meet Vigo Dang: QUT Bachelor of Data Science student in Brisbane, expected graduation '+p.graduation+'.',about(),'About'],
  ['experience.html','Education & project experience','Education and clearly scoped academic project experience for Vigo Dang.',experience(),'About'],
  ['resume.html','Résumé','Current public résumé summary for Vigo Dang, QUT data science student, expected '+p.graduation+'.',resume(),'Resume'],
  ['contact.html','Contact','Contact Vigo Dang in Brisbane about software, data engineering and applied AI opportunities.',contact(),'Contact'],
  ...projects.map(pr=>['projects/'+pr.slug+'.html',pr.title,pr.summary,caseStudy(pr),'Work']),
  ...projects.flatMap(pr=>visualEntries(pr).map(v=>[viewerRoute(pr,v),pr.title+' — '+v.label,v.caption,viewerPage(pr,v),'Work']))
 ];
 for(const [route,title,desc,body,active] of pages) await writeFile('src/'+route,shell(route,title,desc,body,active).replace(/[ \t]+\n/g,'\n'));
 await writeFile('src/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(([route])=>`<url><loc>https://vigodang.github.io/${route==='index.html'?'':route}</loc></url>`).join('')}</urlset>\n`);
 await writeFile('src/robots.txt','User-agent: *\nAllow: /\nSitemap: https://vigodang.github.io/sitemap.xml\n');
 console.log(`Rendered ${pages.length} pages from shared content and templates`);
}
