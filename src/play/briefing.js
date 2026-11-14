import { icon } from './icons.js';

const element = id => {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Project briefing requires #${id}`);
  return node;
};
const text = value => typeof value === 'string' ? value : '';
const node = (tag, value, className = '') => {
  const result = document.createElement(tag);
  result.textContent = text(value);
  if (className) result.className = className;
  return result;
};
const glyph = (name, size = 20) => {
  const result = document.createElement('span');
  result.className = 'briefing-glyph';
  // icon() accepts a fixed glyph name and returns our trusted, decorative SVG.
  result.innerHTML = icon(name, size);
  return result;
};

function section(title, value, className = '') {
  const result = node('section', '', `briefing-section ${className}`.trim());
  result.append(node('h3', title), node('p', value));
  return result;
}

// The highlight label remains verbatim. These short source-derived excerpts
// retain the historical date or comparison baseline before details are opened.
// If the authoritative wording changes, fall back to its full source summary.
function highlightContext(project) {
  const summary = text(project.evidence?.summary);
  if (project.slug === 'dataset-health') {
    return summary.match(/^The archived .*? AWS experiment/)?.[0] || summary;
  }
  if (project.slug === 'strobe-ai') {
    const date = summary.match(/\bon (\d{1,2} [A-Za-z]+ \d{4}):/)?.[1];
    const commit = summary.match(/\bpublic commit ([a-f0-9]+)/)?.[1];
    return date && commit ? `Local verification · ${date} · public commit ${commit}` : summary;
  }
  if (project.slug === 'parallel-protein') {
    const workload = summary.match(/^Retained \S+ timings/)?.[0];
    const baseline = summary.match(/versus optimised sequential/)?.[0];
    return workload && baseline ? `${workload} · ${baseline}` : summary;
  }
  if (project.slug === 'crdc-capstone') {
    return summary.match(/No retrieval-quality score is published\./)?.[0]
      || summary;
  }
  // Sentence boundaries require following whitespace: decimal measurements
  // cannot accidentally become a truncated claim.
  return summary.split(/(?<=[.!?])\s+(?=[A-Z])/)[0] || summary;
}

function resourceLink(link) {
  const href = text(link.href);
  const url = new URL(href, document.baseURI);
  if (!href || !['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol)) {
    throw new Error('Unsupported project resource URL');
  }
  const result = node('a', link.label);
  result.setAttribute('href', href);
  if (link.download) result.download = typeof link.download === 'string' ? link.download : '';
  if (link.target === '_blank') {
    result.target = '_blank';
    result.rel = 'noopener noreferrer';
  }
  result.append(glyph(link.download ? 'resume' : 'external', 18));
  return result;
}

/** Content only: game.js owns native modal opening, closing and focus restore. */
export function populateBrief(p, { firstVisit = false, reducedMotion = false } = {}) {
  if (!p || typeof p !== 'object') throw new TypeError('A project briefing requires source content');
  const dialog = element('project-dialog');
  const technical = element('project-technical');
  technical.open = false;
  technical.querySelectorAll('details[open]').forEach(details => { details.open = false; });
  dialog.dataset.firstVisit = String(Boolean(firstVisit));
  dialog.dataset.reducedMotion = String(Boolean(reducedMotion));

  element('project-kicker').textContent = typeof p.id === 'number'
    ? `STATION ${String(p.id + 1).padStart(2, '0')} / ${text(p.short).toUpperCase()}`
    : `CITY TERMINAL / ${text(p.short).toUpperCase()}`;
  element('project-icon').replaceChildren(glyph(p.icon, 36));
  element('project-context').textContent = text(p.context);
  element('project-title').textContent = text(p.name || p.title);
  element('project-role').textContent = text(p.role);
  element('project-role').hidden = !text(p.role);
  element('project-description').textContent = text(p.what);
  // The initial project view leads with ownership and evidence. Preserve the
  // overview under details instead of making narrow screens read it twice.
  element('project-description').hidden = typeof p.id === 'number';
  element('project-contribution-title').textContent = text(p.contributionLabel) || 'My contribution';
  element('project-contribution').textContent = text(p.contribution);
  element('project-tags').replaceChildren(...(Array.isArray(p.tools) ? p.tools : []).map(tool => node('li', tool)));

  element('project-highlight-title').textContent = text(p.evidenceTitle) || 'Evidence highlight';
  element('project-highlight').textContent = text(p.evidence?.label);
  element('project-highlight-context').textContent = highlightContext(p);

  const why = section(text(p.whyLabel) || 'Why it matters', p.why);
  const evidence = section(text(p.evidenceTitle) || 'Evidence', p.evidence?.summary);
  if (text(p.evidence?.basis)) {
    const basis = node('p', '', 'briefing-source');
    basis.append(node('span', 'Source basis'), document.createTextNode(text(p.evidence.basis)));
    evidence.append(basis);
  }
  const limits = section(text(p.limitTitle) || 'Scope & limitations', p.evidenceLimit, 'briefing-limit');
  const overview = typeof p.id === 'number' ? [section('Project context', p.what)] : [];
  element('project-details').replaceChildren(...overview, why, evidence, limits);
  element('project-links').replaceChildren(...(Array.isArray(p.links) ? p.links : []).map(resourceLink));

  const discovery = element('project-discovery');
  discovery.hidden = !firstVisit;
  discovery.replaceChildren(glyph('checkpoint', 16), node('span', firstVisit ? 'New discovery' : ''));
  // Reset every owned scroll container before the root calls showModal().
  dialog.scrollTop = 0;
  technical.scrollTop = 0;
  element('project-details').scrollTop = 0;
}
