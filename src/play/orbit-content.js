// Short orbit chapters share the portfolio's existing facts and destinations.
export const orbitContent = {
  title: 'Vigo Dang',
  role: 'Data & Cloud Engineering',
  opportunity: 'Seeking internship and graduate opportunities',
  intro: 'My projects, skills and a little about me.',
  instruction: 'Choose a chapter to explore.',
  portfolioLink: { label: 'Main portfolio', href: '../index.html' },
  portraitAlt: 'Vigo Dang smiling, wearing a rust-coloured polo shirt.',
  chapters: [
    {
      id: 'work',
      label: 'Work',
      eyebrow: 'Six project stories',
      title: 'My projects',
      intro: 'I build software around data—from a CSV report to the system that processes it.',
      groups: [
        {
          label: 'Data & cloud workflows',
          items: [
            { label: 'Dataset Health Analyzer', description: 'CSV analysis, queued workers and report delivery.', href: '../projects/dataset-health.html' },
            { label: 'Strobe AI', description: 'Agent boundaries, scoped retrieval and media processing.', href: '../projects/strobe-ai.html' }
          ]
        },
        {
          label: 'Applied AI & research tools',
          items: [
            { label: 'Research synthesis', description: 'Task-specific retrieval and source-linked evidence.', href: '../projects/crdc-capstone.html' },
            { label: 'Credit scoring application', description: 'A Python desktop workflow around model comparison.', href: '../projects/predictive-risk.html' }
          ]
        },
        {
          label: 'Software foundations',
          items: [
            { label: 'C++ / OpenMP optimisation', description: 'Parallel ownership, deterministic output and measurement.', href: '../projects/parallel-protein.html' },
            { label: 'Graph optimisation', description: 'Routing and data structures for a partially known graph.', href: '../projects/graph-optimisation.html' }
          ]
        }
      ]
    },
    {
      id: 'demos',
      label: 'Demos',
      eyebrow: 'Three public demos',
      title: 'Demos',
      intro: 'Each demo gives you something concrete to explore. Its scope is shown below.',
      items: [
        {
          label: 'Dataset Health Analyzer',
          description: 'Inspect a report or analyse a small CSV on your device.',
          scope: 'Real browser-local analysis. No AWS connection.',
          href: 'https://vigodang.github.io/dataset-health-analyzer-demo/',
          image: '../assets/dataset-health-demo.jpg',
          imageAlt: 'Actual Dataset Health Analyzer public demo interface.',
          width: 1440,
          height: 1050
        },
        {
          label: 'Research synthesis',
          description: 'Choose a sample question and inspect its source passages.',
          scope: 'Hand-authored samples. No live AI; partner research stays private.',
          href: 'https://crdc-research-assistant.jazzyactor4.chatgpt.site/',
          image: '../assets/crdc-research-demo.jpg',
          imageAlt: 'Actual Research Assistant public demo showing sample content and source references.',
          width: 1440,
          height: 1050
        },
        {
          label: 'Strobe social + assistant',
          description: 'Create a sample photo post, then ask the assistant to find it.',
          scope: 'Simulated sign-in and template replies. No live AI or AWS.',
          href: 'https://vigodang.github.io/strobe-ai-demo/#/login',
          image: '../assets/strobe-ai-demo.jpg',
          imageAlt: 'Actual Strobe Assistant public demo showing a sample beach-photo result.',
          width: 1440,
          height: 1050
        }
      ]
    },
    {
      id: 'skills',
      label: 'Skills',
      eyebrow: 'Tools in my project work',
      title: 'Technical skills',
      intro: 'I’m interested in the whole workflow: preparing data, connecting services and making the result usable.',
      items: [
        { label: 'Data & applications', description: 'Python, SQL, JavaScript/Node.js, Pandas and NumPy.' },
        { label: 'Cloud & backend', description: 'AWS S3, Lambda, SQS and Fargate; REST APIs and Docker.' },
        { label: 'Evaluation & delivery', description: 'Model evaluation, automated testing, Git and Linux.' }
      ],
      link: { label: 'More about my technical practice', href: '../about.html' }
    },
    {
      id: 'about',
      label: 'About',
      eyebrow: 'The person behind the work',
      title: 'Hi, I’m Vigo.',
      intro: 'I’m from Vietnam and I’m studying Data Science at QUT in Brisbane.',
      statement: 'In a team, I try to listen, ask questions when I’m unsure and use feedback to improve my work.',
      facts: [
        { label: 'Study', value: 'Bachelor of Data Science · QUT' },
        { label: 'Graduation', value: 'Expected July 2027' },
        { label: 'Focus', value: 'Data & Cloud Engineering' }
      ]
    },
    {
      id: 'contact',
      label: 'Contact',
      eyebrow: 'Internship / graduate opportunities',
      title: 'Contact me',
      intro: 'I’m looking for a Data or Cloud Engineering internship or graduate role in Brisbane.',
      location: 'Brisbane, Australia',
      link: { label: 'lieudong2005@gmail.com', href: 'mailto:lieudong2005@gmail.com' },
      secondaryLink: { label: 'Download résumé PDF', href: '../assets/Vigo_Dang_Resume_2026_Redesigned.pdf', download: true }
    }
  ]
};

const escapeHTML = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

function chapterLink(item, contents = escapeHTML(item.label), newTab = true) {
  const attributes = newTab
    ? ` target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(item.label)} (opens in a new tab)"`
    : item.download ? ' download' : '';
  return `<a href="${escapeHTML(item.href)}"${attributes}>${contents}</a>`;
}

/** Render body only; the shell owns the chapter heading, intro and controls. */
export function renderChapterBody(chapter) {
  if (!chapter) return '';
  switch (chapter.id) {
    case 'work':
      return `<div class="chapter-groups">${chapter.groups.map(group => `<section class="chapter-group"><h3>${escapeHTML(group.label)}</h3><ul class="chapter-items">${group.items.map(item => `<li class="chapter-item">${chapterLink(item, `<strong>${escapeHTML(item.label)}</strong><span>${escapeHTML(item.description)}</span>`)}</li>`).join('')}</ul></section>`).join('')}</div>`;
    case 'demos':
      return `<ul class="chapter-demos">${chapter.items.map(item => `<li class="chapter-demo">${chapterLink(item, `<img src="${escapeHTML(item.image)}" width="${escapeHTML(item.width)}" height="${escapeHTML(item.height)}" alt="${escapeHTML(item.imageAlt)}" loading="lazy" decoding="async"><span><strong>${escapeHTML(item.label)}</strong><span>${escapeHTML(item.description)}</span><small>${escapeHTML(item.scope)}</small></span>`)}</li>`).join('')}</ul>`;
    case 'skills':
      return `<div class="chapter-groups">${chapter.items.map(item => `<section class="chapter-group"><h3>${escapeHTML(item.label)}</h3><p>${escapeHTML(item.description)}</p></section>`).join('')}<p>${chapterLink(chapter.link)}</p></div>`;
    case 'about':
      return `<p class="chapter-statement">${escapeHTML(chapter.statement)}</p><dl class="chapter-facts">${chapter.facts.map(fact => `<div><dt>${escapeHTML(fact.label)}</dt><dd>${escapeHTML(fact.value)}</dd></div>`).join('')}</dl>`;
    case 'contact':
      return `<div class="chapter-contact"><p>${escapeHTML(chapter.location)}</p><p>${chapterLink(chapter.link, escapeHTML(chapter.link.label), false)}</p><p>${chapterLink(chapter.secondaryLink, escapeHTML(chapter.secondaryLink.label), false)}</p></div>`;
    default:
      return '';
  }
}
