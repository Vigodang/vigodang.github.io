// Artifact metadata only. Public project claims, metrics, contribution and
// limitations are read from the shared project passed by content.js.
const asset = filename => new URL(`../assets/${filename}`, import.meta.url).href;

export const evidenceInventory = Object.freeze({
  'crdc-capstone': {
    status: 'PRIVATE',
    label: 'Public-safe conceptual workflow',
    primary: {
      file: 'crdc-workflow.svg', width: 900, height: 560,
      type: 'Conceptual illustration',
      alt: 'A scoped question passes through lead-agent planning, task-specific retrieval, reranking and provenance-linked synthesis.',
      caption: 'Sanitized conceptual workflow from the existing case study. This is an explanatory diagram; it contains no partner documents or research results.',
    },
    gap: 'Public research outputs and evaluation artifacts are unavailable. Partner material remains private; the diagram does not establish retrieval quality.',
    sources: ['docs/refinement-evidence.md', 'src/assets/crdc-workflow.svg'],
  },
  'dataset-health': {
    status: 'VERIFIED',
    label: 'Real application capture + recorded experiment',
    primary: {
      file: 'dataset-health-report.jpg', width: 599, height: 2881,
      type: 'Actual interface capture · 17 October 2026', scroll: true,
      alt: 'Unaltered Dataset Health Analyzer report showing its dataset summary, quality findings, cohort charts and missing-value analysis.',
      caption: 'Real report capture of a separate showcase file. Scroll the full report, or open the original. This interface snapshot is separate from the controlled AWS experiment.',
    },
    related: [
      {
        file: 'dataset-health-scaling.svg', width: 1200, height: 1200,
        type: 'Recorded AWS experiment · 12 October 2026',
        alt: 'Recorded completed-job observations and sampled desired/running worker counts during the controlled AWS experiment.',
        caption: 'Redrawn from the sanitized measurement CSV. Points are recorded samples; worker lines are sampled steps. These observations do not establish per-job latency or production readiness.',
      },
      {
        file: 'dataset-health-correlations.jpg', width: 599, height: 656,
        type: 'Actual interface capture · correlation view',
        alt: 'Real Dataset Health Analyzer interface displaying a Pearson correlation heatmap, a Cost–Profit tooltip and the strongest-correlations section.',
        caption: 'Unaltered exploratory correlation view from the showcase interface, separate from the load-test workload.',
      },
      {
        file: 'dataset-health.svg', width: 900, height: 560,
        type: 'Source-derived architecture illustration',
        alt: 'React and Cognito connect to a Lambda job API and DynamoDB; S3 uploads are processed by Fargate workers consuming Lambda-submitted SQS jobs.',
        caption: 'Architecture redrawn from retained application source. This image illustrates responsibilities and is not a cloud-console capture.',
      },
    ],
    conditions: 'Recorded test conditions: generated CSV inputs with 80,001 data rows, seven columns and all six analysis modules selected. The later interface captures and undeployed correctness fixes are separate snapshots.',
    gap: 'A new AWS run and a safe public application deployment are unavailable. Gameplay queue activity is an architectural illustration, separate from these recorded observations.',
    sources: ['docs/refinement-evidence.md', 'src/assets/dataset-health-scaling.csv', 'src/assets/dataset-health-report.jpg'],
  },
  'predictive-risk': {
    status: 'VERIFIED',
    label: 'Public implementation · source-derived application flow',
    primary: {
      file: 'risk-flow.svg', width: 900, height: 560,
      type: 'Source-derived architecture illustration',
      alt: 'PyQt6 interface, service layer, model pipeline, MySQL history and reporting responsibilities in the public implementation.',
      caption: 'Diagram of implementation responsibilities from the existing case study. This is not an application screenshot or a model-evaluation result.',
    },
    gap: 'A genuine saved-evaluation screenshot and independently reproduced held-out quality result are missing. The original dashboard’s simulated fallback metrics are excluded.',
    sources: ['docs/refinement-evidence.md', 'src/assets/risk-flow.svg'],
  },
  'strobe-ai': {
    status: 'VERIFIED',
    label: 'Dated local automated-test record',
    primary: {
      file: 'strobe-tests.svg', width: 900, height: 560,
      type: 'Redrawn test ledger · local automated tests',
      alt: 'Dated local test ledger showing backend, ACP and MCP package results, with the source revision and verification date.',
      caption: 'Existing dated test record at public commit 5d3a43f, reproduced on 14 November 2026. The ledger is a redrawn figure, separate from this portfolio’s own checks.',
    },
    related: [{
      file: 'strobe-architecture.svg', width: 900, height: 560,
      type: 'Source-derived architecture illustration',
      alt: 'ACP agent orchestration and read-only MCP tools sit beside a separate S3, EventBridge and SQS media pipeline.',
      caption: 'Redrawn from the inspected source. Configured demo identity remains a boundary; this is not evidence of a running production service.',
    }],
    gap: 'A genuine product screenshot and a current public cloud demonstration are unavailable. The request trace in the game is an educational illustration.',
    sources: ['docs/project-evidence.md', 'docs/refinement-evidence.md', 'src/assets/strobe-tests.svg'],
  },
  'parallel-protein': {
    status: 'VERIFIED',
    label: 'Archived runtime measurements + aggregate data',
    primary: {
      file: 'openmp-benchmark.svg', width: 1200, height: 800,
      type: 'Recorded benchmark · optimized sequential baseline',
      alt: 'Archived mean runtimes for optimized sequential execution and one, two, four and eight requested OpenMP threads, with runtime confidence intervals.',
      caption: 'Archived qut3 workload on AMD Ryzen 7 7800X3D, WSL2 and GCC 15.2.0. Whiskers are confidence intervals for mean runtime, not the speedup ratio. The baseline is optimized sequential.',
    },
    conditions: 'Recorded conditions: qut3 is a 200,000-FASTA-record input, with ten measured runs per configuration after warm-up. CPU affinity and frequency were uncontrolled. The executable and benchmark were not rerun.',
    gap: 'A freshly reproduced benchmark and public course source/datasets are unavailable. The game’s worker animation illustrates the concept and is not a timing experiment.',
    sources: ['docs/refinement-evidence.md', 'src/assets/openmp-benchmark-data.csv', 'src/assets/openmp-benchmark.svg'],
  },
  'drone-segmentation': {
    status: 'MISSING',
    label: 'Pinned public source · prediction evidence unavailable',
    gap: 'No retained checkpoint, real prediction image, training history or original metric output was found. A before/after model comparison cannot be presented as evidence.',
    sources: ['src/play/content.js', 'docs/refinement-evidence.md'],
  },
});

const el = (tag, value = '', className = '') => {
  const result = document.createElement(tag);
  if (value) result.textContent = value;
  if (className) result.className = className;
  return result;
};

function link(href, label) {
  const url = new URL(href, document.baseURI);
  if (!['http:', 'https:'].includes(url.protocol)) throw new TypeError('Unsupported evidence URL');
  const result = el('a', label, 'evidence-link');
  result.href = href;
  result.target = '_blank';
  result.rel = 'noopener noreferrer';
  result.setAttribute('aria-label', `${label} (opens in a new tab)`);
  return result;
}

function figure(artifact, { lazy = false } = {}) {
  const result = el('figure', '', 'evidence-figure');
  result.append(el('div', artifact.type, 'evidence-type'));
  const viewport = el('div', '', `evidence-visual${artifact.scroll ? ' evidence-visual--scroll' : ''}`);
  if (artifact.scroll) {
    viewport.tabIndex = 0;
    viewport.setAttribute('role', 'region');
    viewport.setAttribute('aria-label', 'Full report capture; scroll vertically to inspect');
  }
  const image = document.createElement('img');
  image.src = asset(artifact.file);
  image.alt = artifact.alt;
  image.width = artifact.width;
  image.height = artifact.height;
  image.decoding = 'async';
  if (lazy) image.loading = 'lazy';
  viewport.append(image);
  const caption = el('figcaption', artifact.caption);
  caption.append(link(asset(artifact.file), 'Open original artifact'));
  result.append(viewport, caption);
  return result;
}

function sourceArtifact(project) {
  const result = el('figure', '', 'evidence-source-artifact');
  result.append(el('div', 'Public implementation source · no prediction image', 'evidence-type'));
  const file = el('div', '', 'evidence-source-file');
  file.append(el('span', 'PY / IMPLEMENTATION'), el('strong', 'libs/models_UNet.py'));
  const pipeline = el('ol', '', 'evidence-source-flow');
  for (const step of ['Aligned RGB + DSM inputs', 'Residual U-Net-style model', 'Tiled inference / reconstruction']) {
    pipeline.append(el('li', step));
  }
  file.append(pipeline);
  result.append(file);
  const caption = el('figcaption', 'Source-derived implementation map. No generated mask is presented as a real prediction.');
  const source = project.links?.find(item => item.kind === 'pinned-source');
  if (source) caption.append(link(source.href, 'Inspect pinned model source'));
  result.append(caption);
  return result;
}

/**
 * A semantic, standalone evidence block for dossiers or completed missions.
 * The caller owns panel lifecycle/focus. No progress, network execution or
 * private project material is created by opening this view.
 */
export function renderEvidence(project) {
  if (!project || typeof project !== 'object') throw new TypeError('Evidence requires a project');
  const inventory = evidenceInventory[project.slug];
  const result = el('section', '', 'evidence-panel');
  result.dataset.project = String(project.slug || 'unknown');
  result.setAttribute('aria-label', `Project evidence: ${project.name || project.title || 'Project'}`);
  if (!inventory) {
    result.append(el('h3', 'Evidence'), el('p', project.evidence?.summary || 'No public evidence artifact is available.'));
    return result;
  }
  result.dataset.evidenceStatus = inventory.status;
  const header = el('header', '', 'evidence-heading');
  const badge = el('span', inventory.status === 'MISSING' ? 'RESULTS MISSING' : inventory.status, 'evidence-status');
  header.append(badge, el('h3', inventory.label));
  result.append(header);
  result.append(inventory.primary ? figure(inventory.primary) : sourceArtifact(project));

  const finding = el('div', '', 'evidence-finding');
  finding.append(el('h4', project.evidence?.label || 'Available proof'), el('p', project.evidence?.summary || ''));
  if (inventory.conditions) finding.append(el('p', inventory.conditions, 'evidence-conditions'));
  result.append(finding);

  const boundary = el('aside', '', 'evidence-boundary');
  boundary.setAttribute('aria-label', 'Evidence boundary');
  boundary.append(el('h4', 'Evidence boundary'), el('p', inventory.gap));
  if (project.evidenceLimit) boundary.append(el('p', project.evidenceLimit, 'evidence-project-limit'));
  result.append(boundary);

  if (inventory.related?.length) {
    const details = el('details', '', 'evidence-related');
    details.append(el('summary', 'Inspect related artifacts'));
    for (const artifact of inventory.related) details.append(figure(artifact, { lazy: true }));
    result.append(details);
  }
  if (project.evidence?.basis) result.append(el('p', `Source basis: ${project.evidence.basis}`, 'evidence-basis'));
  const resources = el('nav', '', 'evidence-resources');
  resources.setAttribute('aria-label', 'Evidence source links');
  for (const resource of project.links || []) resources.append(link(resource.href, resource.label));
  if (resources.childElementCount) result.append(resources);
  return result;
}
