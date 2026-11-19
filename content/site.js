// Public profile, project copy and evidence. Generated HTML and PDF share these facts.
export const profile = {
  "name": "Vigo Dang",
  "fullName": "Truong Lieu Dong (Vigo) Dang",
  "location": "Brisbane, Australia",
  "email": "n11721138@qut.edu.au",
  "github": "https://github.com/Vigodang",
  "linkedin": "https://linkedin.com/in/vigodang",
  "university": "Queensland University of Technology",
  "degree": "Bachelor of Data Science",
  "minor": "Advanced Computing for Data Science",
  "graduation": "July 2027",
  "award": "2024 Executive Dean’s Commendation for Academic Excellence (Semester 2 teaching period cluster)",
  "reviewed": "14 November 2026",
  "pdf": "assets/Vigo_Dang_Resume_2026_Redesigned.pdf",
  "summary": "QUT Data Science undergraduate with practical experience designing, testing and explaining technical systems across AWS cloud, data pipelines, machine learning and information retrieval. Comfortable working from problem definition through implementation, evaluation and documentation. Seeking internship or early-career opportunities in data, analytics, software and cloud engineering.",
  "skills": [
    {
      "label": "Programming & data",
      "items": "Python, SQL, R, C++17, C#, JavaScript/Node.js; Pandas, NumPy, MySQL, DynamoDB"
    },
    {
      "label": "Machine learning",
      "items": "scikit-learn, XGBoost, LightGBM; classification, regression, model evaluation"
    },
    {
      "label": "Deep Learning & AI",
      "items": "PyTorch, TensorFlow; neural networks, embeddings, RAG"
    },
    {
      "label": "Cloud & backend",
      "items": "AWS S3, Lambda, API Gateway, Cognito, SQS, ECS/Fargate, CloudWatch; REST APIs, Docker"
    },
    {
      "label": "Tools & delivery",
      "items": "Git/GitHub, Linux, automated testing, Power BI, PyQt6, data visualisation"
    }
  ],
  "deepLearningSource": "https://github.com/Vigodang/Drone-Imagery-Semantic-Segmentation/blob/d1d344d2abb1ad25e414a15c41183294c37c1679/libs/models_UNet.py",
  "homeIntro": "I’m Vigo, a QUT data science student in Brisbane. I build Python/SQL applications, AWS workflows and retrieval-based AI.",
  "phone": "0410 107 614",
  "locationShort": "Brisbane, QLD",
  "positioning": {
    "role": "Data & Cloud Engineering",
    "opportunity": "Seeking internship and graduate opportunities",
    "intro": "I’m Vigo, a QUT Data Science student in Brisbane. I build data tools and cloud workflows, and I’m looking for a team to learn with.",
    "approach": "I listen first, ask when something is unclear, and use feedback to make the next version better."
  }
};

export const projects = [
  {
    "slug": "strobe-ai",
    "number": "01",
    "title": "Strobe AI",
    "shortTitle": "Strobe AI",
    "category": "Cloud systems / Applied AI",
    "type": "Academic engineering project",
    "role": "Agent & backend engineering",
    "technologies": "Node.js · AWS · Bedrock · ACP / MCP",
    "cover": "strobe-architecture.svg",
    "theme": "sage",
    "deck": "An AI assistant with explicit tool, identity and processing boundaries.",
    "summary": "A multimodal assistant with ACP streaming, read-only MCP tools, user-scoped retrieval and queued AWS media processing.",
    "evidenceLabel": "229 local automated tests passed",
    "contribution": "My work focused on the agent and MCP tool boundary, user-isolated retrieval, asynchronous media processing and retry behaviour. The overall system includes a social media backend and client integration; this case study focuses on that engineering scope rather than claiming sole authorship of every component.",
    "problem": "A conversational assistant needs useful access to personal media, but model-generated tool calls must not decide who the user is or which records they own. Slow classification and embedding jobs also need a separate lifecycle from the upload request.",
    "approach": "ACP carries the conversational stream. MCP exposes read-only backend tools. A configured server-side demo identity scopes tool access and vector retrieval. Separately, S3 events flow through EventBridge and SQS into classification and embedding work, with state in DynamoDB and retrieval through S3 Vectors.",
    "caption": "Architecture schematic, redrawn from public project documentation. The interactive agent path and asynchronous media path have separate responsibilities.",
    "decisions": [
      [
        "Resolve identity in the server",
        "Server-scoped identity and ownership checks keep the model out of authorization decisions. The current demo uses a configured identity; a production identity lifecycle would add integration work."
      ],
      [
        "Separate conversation from capabilities",
        "ACP carries the stream while MCP exposes read-only tools. This makes each boundary testable, at the cost of coordinating contracts across separate services."
      ],
      [
        "Queue classification and indexing",
        "S3 events route through EventBridge and SQS so inference does not block uploads. The trade-off is an eventual result with retry, duplicate-delivery and job-state handling."
      ]
    ],
    "proof": "On 14 November 2026, fresh local test runs against public commit 5d3a43f passed 145 backend, 67 ACP and 17 MCP tests: 229 passed, with no failures or skipped tests. These are local automated checks; a cloud deployment was not rerun.",
    "proofNotes": [
      "Fresh local runs passed 145 backend, 67 ACP and 17 MCP tests, with no failures or skips.",
      "The public README documents local ACP operation and an intentionally stopped MCP Fargate smoke deployment."
    ],
    "limitations": "The MCP service uses a configured demo identity; production multi-user authentication and authorization remain future work. Passing local tests does not demonstrate production operation, scale or a complete security review. I would next reproduce a deployed integration run with failure injection, queue backlog observation and explicit end-to-end latency measurements.",
    "resources": [
      [
        "Public repository",
        "https://github.com/Vigodang/strobe-ai-serverless-agent"
      ],
      [
        "Backend source & tests",
        "https://github.com/Vigodang/strobe-ai-serverless-agent/tree/main/src"
      ],
      [
        "ACP test suite",
        "https://github.com/Vigodang/strobe-ai-serverless-agent/tree/main/acp-agent/tests"
      ],
      [
        "MCP test suite",
        "https://github.com/Vigodang/strobe-ai-serverless-agent/tree/main/mcp-server/tests"
      ]
    ],
    "source": "Public repository, README and dated local test reproduction at commit 5d3a43f.",
    "period": "September 2026 · public source",
    "context": "An academic engineering project extending a social media backend with a multimodal assistant and asynchronous media processing. The public source spans the backend, ACP adapter and MCP tools.",
    "visual": {
      "src": "strobe-tests.svg",
      "width": 900,
      "height": 560,
      "kind": "ledger",
      "label": "Automated test results",
      "alt": "229 local automated tests passed: 145 backend, 67 ACP and 17 MCP, verified 14 November 2026 at public commit 5d3a43f.",
      "caption": "Local automated test results at commit 5d3a43f, verified 14 November 2026. These counts do not measure deployment availability or cloud performance."
    },
    "architecture": {
      "src": "strobe-architecture.svg",
      "width": 900,
      "height": 560,
      "kind": "schematic",
      "label": "Architecture",
      "alt": "ACP client and agent boundary connect to read-only MCP tools. A separate S3, EventBridge and SQS pipeline classifies and indexes media.",
      "caption": "Source-derived architecture. MCP uses a configured demo identity; production multi-user authentication remains future work."
    },
    "resumeBullet": "Implemented agent/tool boundaries, user-scoped retrieval and asynchronous AWS media processing. Public-source local suites passed 229 tests across backend, ACP and MCP.",
    "coverCaption": "Local run · three packages · 14 November 2026"
  },
  {
    "slug": "dataset-health",
    "number": "02",
    "title": "Dataset Health Analyzer",
    "shortTitle": "Dataset Health Analyzer",
    "category": "Cloud / Data quality",
    "type": "QUT CAB432 · Cloud computing project",
    "role": "CSV workflow & application integration",
    "technologies": "React · Node.js · AWS S3 / SQS / Fargate",
    "cover": "dataset-health.svg",
    "theme": "sage",
    "deck": "Upload a CSV. Queue the analysis. See what needs attention.",
    "summary": "A CSV analysis workflow with a deployed browser demo. My cloud project connects uploads, queued workers, progress tracking and reports.",
    "evidenceLabel": "Live analysis demo · recorded AWS experiment",
    "contribution": "For my QUT cloud computing project, I developed the CSV analysis workflow and integrated the authenticated control plane, queued workers and reporting interface. The submission reuses earlier course infrastructure; I do not claim every inherited component was written from scratch.",
    "problem": "CSV profiling can take longer than a normal browser request. Uploading data, authorizing a user, tracking a job and running analysis need separate boundaries so the user can see progress while workers handle the compute.",
    "approach": "The React frontend uses Cognito authentication and uploads directly to private S3 storage. API Gateway and Lambda verify ownership and upload state, create DynamoDB job records and enqueue SQS messages. Fargate workers claim queued jobs, read the CSV, write private analysis results and update job state. CloudWatch-backed scaling adjusts worker capacity.",
    "caption": "Source-derived architecture of the authenticated CSV workflow and queued Fargate workers.",
    "decisions": [
      [
        "Keep uploads off the control plane",
        "Upload directly to private S3 storage and verify the object before queuing work. This avoids large request bodies but requires ownership, size and completion checks at the boundary."
      ],
      [
        "Track jobs independently of workers",
        "Conditional DynamoDB transitions guard claims and terminal state. That makes progress visible, but crash recovery still needs a reconciliation mechanism."
      ],
      [
        "Use queues to absorb a burst",
        "SQS separates job arrival from worker execution and supports backlog-driven scaling. Minimum capacity is one worker; scale-to-zero and cold-start behaviour remain separate design questions."
      ]
    ],
    "proof": "The archived 12 October 2026 AWS experiment completed all 40 jobs, with no failed or cancelled jobs and an empty final dead-letter queue. Recorded worker counts rose from one to four and returned to one. Each job used a 2,886,027-byte generated CSV containing 80,001 data rows, with all six analysis modules selected. The original CSV/JSON records were checked for this refinement; the AWS experiment was not rerun.",
    "proofNotes": [
      "The original measured deployment, 17 October UI captures and 24 October source corrections are different snapshots.",
      "The 24 October correctness fixes were local and were not deployed to the measured AWS baseline.",
      "Six analysis modules cover profiling, completeness, duplicates, numeric statistics, IQR outliers and correlation.",
      "The public browser demo was checked on 19 November 2026: all eight report views, JSON export and a small synthetic CSV analysis worked. The demo computes locally and does not reproduce the archived AWS load experiment."
    ],
    "limitations": "The source uses bounded in-memory CSV analysis rather than unlimited streaming. A worker crash after claiming a job can leave it RUNNING; SQS redrive does not repair that state automatically. DynamoDB transitions and SQS submission are not atomic, so exactly-once processing is not claimed. I would add recovery/reconciliation for abandoned jobs and test that path in a newly deployed, versioned environment. The public demo provides a separate browser-local version with limits of 1 MiB, 5,000 rows and 30 columns. It does not exercise cloud authentication, queueing or autoscaling.",
    "resources": [],
    "source": "Original submission source, accepted 12 October experiment CSV/JSON and unaltered 17 October interface captures. Only aggregate measurements and safe UI views are published.",
    "period": "October 2026",
    "context": "A QUT CAB432 Assessment 3 application for authenticated, browser-based CSV profiling. It builds on earlier course infrastructure, with a standalone analysis workflow, worker service and reporting interface.",
    "visual": {
      "src": "dataset-health-report.jpg",
      "width": 599,
      "height": 2881,
      "kind": "screenshot",
      "label": "Working report interface",
      "alt": "Actual Dataset Health Analyzer report interface, captured 17 October 2026, with dataset summary, quality findings, cohort charts and missing-value breakdown.",
      "caption": "Actual report interface, 17 October 2026. This showcase file has 22,030 rows and 23 columns; it is separate from the 40-job load-test fixture."
    },
    "architecture": {
      "src": "dataset-health.svg",
      "width": 900,
      "height": 560,
      "kind": "schematic",
      "label": "Control plane & workers",
      "alt": "React and Cognito connect to a Lambda job API and DynamoDB. Direct S3 uploads are analysed by Fargate workers consuming Lambda-submitted SQS jobs.",
      "caption": "Architecture redrawn from the retained application source. Lambda verifies uploads and submits SQS jobs; Fargate workers analyse the CSV files and store results."
    },
    "evidenceVisual": {
      "src": "dataset-health-scaling.svg",
      "width": 1200,
      "height": 1200,
      "kind": "chart",
      "label": "Recorded controlled run",
      "alt": "26 recorded observations show completed jobs reaching 40 and running workers increasing from 1 to 4 before returning to 1 over a 460.931-second window.",
      "caption": "Recorded AWS experiment, 12 October 2026. Points are sampled observations, not per-job latency measurements. Completion and scaling do not establish production readiness."
    },
    "evidenceData": "dataset-health-scaling.csv",
    "evidenceTable": {
      "headers": [
        "Recorded outcome",
        "Result"
      ],
      "rows": [
        [
          "Jobs completed",
          "40 / 40"
        ],
        [
          "Failed / cancelled",
          "0 / 0"
        ],
        [
          "Running workers",
          "1 → 4 → 1"
        ],
        [
          "Final dead-letter queue",
          "0"
        ],
        [
          "Samples / window",
          "26 / 460.931 seconds"
        ]
      ]
    },
    "resumeBullet": "Developed a React/AWS CSV analysis workflow with Lambda, private S3 uploads, DynamoDB, SQS and Fargate. An archived controlled experiment completed 40/40 jobs with observed workers scaling 1 to 4 to 1.",
    "details": [
      {
        "src": "dataset-health-correlations.jpg",
        "width": 599,
        "height": 656,
        "kind": "screenshot",
        "label": "Correlation report",
        "alt": "Actual correlation report from the showcase CSV: a heatmap and ranked feature-pair relationships.",
        "caption": "Actual interface capture, 17 October 2026. This is exploratory analysis of a showcase CSV, not a model-quality result or part of the autoscaling load fixture."
      }
    ],
    "coverCaption": "Actual interface · showcase CSV · 17 October 2026",
    "liveDemo": {
      "url": "https://vigodang.github.io/dataset-health-analyzer-demo/",
      "image": "dataset-health-demo.jpg",
      "width": 1440,
      "height": 1050,
      "label": "Dataset Health Analyzer",
      "category": "Data & cloud workflows",
      "description": "Explore a dataset report, inspect data-quality findings, or analyse a small CSV on your own device.",
      "scope": "Real browser-local analysis with synthetic examples. Files stay in the tab; this demo does not connect to AWS.",
      "deployment": "This public demo is a static React application on GitHub Pages. CSV analysis runs locally in the browser. The original AWS queue, workers and recorded load experiment are separate.",
      "alt": "Dataset Health Analyzer public demo showing the synthetic retail report, eight report views, completeness and duplicate findings.",
      "caption": "Actual deployed interface · 19 November 2026 · Synthetic sample analysed locally"
    }
  },
  {
    "slug": "crdc-capstone",
    "number": "03",
    "title": "Scientific Research Synthesis",
    "shortTitle": "Research synthesis",
    "category": "Retrieval / Research systems",
    "type": "QUT team capstone · CRDC partner",
    "role": "Lead-agent orchestration & evaluation",
    "technologies": "Python · Retrieval · Cross-encoder reranking",
    "cover": "crdc-workflow.svg",
    "theme": "paper",
    "deck": "Retrieve for the task, then keep the answer connected to its sources.",
    "summary": "A source-linked research workflow from a QUT team capstone with CRDC. Explore the deployed interface, sample reports and citations.",
    "evidenceLabel": "Interactive demo · private original research",
    "contribution": "In a QUT student team partnering with the Cotton Research and Development Corporation, my emphasis was lead-agent orchestration, task-specific retrieval, document/chunk evaluation, cross-encoder reranking, provenance and temporal diversity. The wider capstone is team work. This was not employment or an internship with CRDC.",
    "problem": "A relevant document can still contain chunks that do not answer the analytical task. Giving every specialist the same retrieval query can produce fluent synthesis that overlooks context, provenance or older evidence.",
    "approach": "Separate the research question from the analytical task and retrieval intent. A lead agent coordinates task-specific retrieval, ranking and evidence selection before synthesis. Keep source references attached to the evidence and inspect usefulness at both document and chunk level.",
    "caption": "Public-safe conceptual workflow. It contains no partner documents, source code, document names, corpus statistics or unpublished results.",
    "decisions": [
      [
        "Plan retrieval per analytical task",
        "Different specialists receive task-specific retrieval intent instead of the same broad query. This adds orchestration complexity but makes retrieval behaviour easier to inspect."
      ],
      [
        "Check evidence at two levels",
        "Evaluate document relevance and the actual chunks supplied to synthesis. Passage-level inspection takes more work than a document-only score, but exposes unsupported context."
      ],
      [
        "Preserve provenance and time context",
        "Keep source references attached to selected evidence and examine temporal diversity. Diversification can trade top-ranked similarity for a broader historical view; it needs task-level evaluation."
      ]
    ],
    "proof": "The contribution account covers lead-agent and retrieval integration, task-specific evidence selection and document/chunk evaluation. No public retrieval-quality score, completed independent review result or partner endorsement is claimed. Private run material cannot be used as public evaluation evidence without release permission.",
    "proofNotes": [
      "A relevant source document does not guarantee that the selected chunk supports an answer.",
      "The public case explains the implementation approach, not an independently validated research outcome.",
      "The public interface demo was checked on 18 November 2026: all three sample reports, citation/source inspection, and HTML/Markdown exports worked. These are hand-authored examples, not AI evaluation results."
    ],
    "limitations": "The public account cannot independently establish retrieval quality. Within an approved evaluation, I would compare fixed question sets, inspect citation support and track how evidence selection changes across time periods. Partner review would be required before publishing any detailed findings.",
    "resources": [],
    "source": "Student-team contribution account, sanitized conceptual workflow, and an actual capture of the public interface demo on 18 November 2026. Detailed partner artefacts remain private.",
    "period": "2026 · Team capstone",
    "context": "A QUT student team capstone partnering with the Cotton Research and Development Corporation. The aim is to help researchers work across historical scientific reports while retaining evidence provenance.",
    "visual": {
      "src": "crdc-workflow.svg",
      "width": 900,
      "height": 560,
      "kind": "schematic",
      "label": "Research workflow",
      "alt": "A public-safe workflow separates the research question, lead-agent planning, task-specific retrieval, reranking and provenance-linked synthesis.",
      "caption": "Conceptual workflow only. Partner documents, private source, corpus details and unpublished results are withheld."
    },
    "resumeBullet": "Contributed lead-agent orchestration, task-specific retrieval, cross-encoder reranking and evidence evaluation to a QUT team capstone with CRDC; private partner material remains confidential.",
    "liveDemo": {
      "url": "https://crdc-research-assistant.jazzyactor4.chatgpt.site/",
      "image": "crdc-research-demo.jpg",
      "width": 1440,
      "height": 1050,
      "label": "CRDC Research Assistant",
      "description": "Choose a sample question, inspect its source passages, and export a report. Try the actual deployed interface in your browser.",
      "scope": "Hand-authored sample reports and synthetic source notes. This public demo does not run AI; original partner research remains private.",
      "deployment": "The public demo is a static website published on ChatGPT Sites. The original Python retrieval and multi-agent pipeline is a separate application.",
      "category": "Applied AI & research tools",
      "alt": "CRDC Research Assistant public demo showing a sample report, citations and sample question navigation.",
      "caption": "Actual deployed interface · 18 November 2026 · Hand-authored sample content"
    }
  },
  {
    "slug": "predictive-risk",
    "number": "04",
    "title": "Predictive Credit Scoring System",
    "shortTitle": "Credit scoring, as software",
    "category": "Data / Desktop application",
    "type": "Independent ML application",
    "role": "Application & ML workflow",
    "technologies": "Python · PyQt6 · MySQL · Scikit-learn",
    "cover": "risk-flow.svg",
    "theme": "clay",
    "deck": "Taking a model beyond a notebook, into a usable desktop workflow.",
    "summary": "A Python/PyQt6 application connecting model comparison, structured predictions, MySQL history and reporting on a 30,000-record dataset.",
    "evidenceLabel": "Public code · three implemented model families",
    "contribution": "My focus was the application around the model: PyQt6 screens, services, domain objects, prediction flow, reporting and model-management concepts. This is a student project; it does not represent a deployed lending service or bank-grade validation.",
    "problem": "A trained classifier is only one part of an application. Inputs need a consistent schema, predictions need model context, and users need to review results and history without navigating training code.",
    "approach": "The UI calls a service layer rather than training code directly. The training workflow compares calibrated Logistic Regression, XGBoost and LightGBM. Structured prediction outputs carry probability, risk label and model context, while MySQL-oriented services support history and reporting.",
    "caption": "Application flow schematic based on the public implementation. This is a diagram of responsibilities, not a screenshot or a model-performance chart.",
    "decisions": [
      [
        "Separate interface and services",
        "Keep UI screens, application logic, ML utilities and domain objects separate. This adds explicit interfaces but makes model and presentation changes less coupled."
      ],
      [
        "Use an interpretable comparison baseline",
        "Compare boosted trees with calibrated Logistic Regression. Model selection needs reproducible held-out evidence rather than a preference for complexity."
      ],
      [
        "Store prediction context",
        "Track model identity alongside structured outputs and history. That improves traceability, while introducing versioning and data-governance responsibilities."
      ]
    ],
    "proof": "The public repository contains the PyQt6 application, training code and 30,000-row data files. The training implementation includes Logistic Regression, XGBoost and LightGBM. The file under tests/ launches the application; it is not an automated test suite.",
    "proofNotes": [
      "Training code implements calibrated Logistic Regression, XGBoost and LightGBM.",
      "The 30,000-row files were counted; dataset size is not a validation result.",
      "No genuine saved evaluation arrays or screenshots were available; fallback demo plots are not used."
    ],
    "limitations": "No held-out model-quality result was independently reproduced. The dashboard can fall back to simulated metrics when saved evaluation arrays are absent, so those visuals are excluded here. Expanded-history feature provenance also needs documentation. Before use beyond coursework, I would add service tests, leakage/calibration checks and a fairness/threshold review; this is not a validated lending service.",
    "resources": [
      [
        "Public repository",
        "https://github.com/Vigodang/AI-Predictive-Credit-Scoring-System"
      ]
    ],
    "source": "Public source and data-shape inspection at commit e4c11bc8. Model training, application execution and financial validation were not reproduced.",
    "period": "2025–2026",
    "context": "A student desktop ML application built around a 30,000-record credit dataset. The project combines a PyQt6 interface, training utilities, service boundaries and MySQL-oriented history/reporting.",
    "visual": {
      "src": "risk-flow.svg",
      "width": 900,
      "height": 560,
      "kind": "schematic",
      "label": "Application responsibilities",
      "alt": "PyQt6 interface calls application services, model selection and prediction, with MySQL history and reporting alongside the training workflow.",
      "caption": "Source-derived application schematic. No ROC curve or dashboard metric is presented as a measured result."
    },
    "resumeBullet": "Built a Python/PyQt6 credit-scoring application with MySQL history/reporting and training workflows for calibrated Logistic Regression, XGBoost and LightGBM on 30,000 records."
  },
  {
    "slug": "parallel-protein",
    "title": "Parallel Protein Signature Generation",
    "shortTitle": "C++ / OpenMP optimisation",
    "category": "Performance engineering / C++",
    "type": "QUT CAB401 · Student coursework",
    "role": "Performance engineering & benchmarking",
    "period": "October 2026",
    "technologies": "C++17 · OpenMP · SIMD-friendly data layout",
    "cover": "openmp-benchmark.svg",
    "theme": "paper",
    "context": "An individual coursework report on optimising a supplied C++ protein-signature program. The supplied algorithm, ISAAC, uthash and OpenMP are existing building blocks; my work focused on data layout, state ownership, output and measurement.",
    "deck": "Make ownership explicit. Measure the gain. Check the bytes.",
    "summary": "A supplied C++ program reworked for deterministic parallel execution. Retained measurements show a 3.25× gain at eight threads over the optimised sequential baseline.",
    "evidenceLabel": "3.25× at 8 threads · byte-identical recorded output",
    "problem": "Adding threads does little if workers contend over mutable lookup state or serialize their output. The challenge was to expose independent work without changing the signature bytes produced by the supplied program.",
    "contribution": "I redesigned record-level ownership, replaced hot-path mutable canonical lookup work with an immutable table, used bounded narrower accumulators, assigned disjoint output ranges and benchmarked the versions. This was performance engineering of supplied coursework software, not a new biological analysis algorithm.",
    "approach": "Records are indexed before a static OpenMP parallel-for. Input and canonical tables are read-only; each iteration owns local accumulators and an exact output slice. Prefix offsets place results into one contiguous buffer, followed by a serial write after the barrier. The retained reader preserves the legacy EOF pass for compatibility.",
    "visual": {
      "src": "openmp-benchmark.svg",
      "width": 1200,
      "height": 800,
      "kind": "chart",
      "label": "Measured runtime",
      "alt": "Mean qut3 runtimes: optimised sequential 0.588 seconds; OpenMP at 1, 2, 4 and 8 requested threads 0.576, 0.349, 0.233 and 0.181 seconds. Ten measured runs per configuration; whiskers show archived 95% confidence intervals.",
      "caption": "Archived qut3 workload benchmark on AMD Ryzen 7 7800X3D, WSL2 and GCC 15.2.0. Whiskers are 95% confidence intervals for mean runtime, not for the speedup ratio."
    },
    "proof": "Summary statistics were recomputed from all 60 retained qut3 timings during this refinement. The eight-thread mean was 0.1807455 seconds versus 0.5882820 seconds for the V6-derived optimised sequential baseline: 3.254753×, reported as 3.25×. Ten runs per configuration followed one warm-up, with forward/reverse ordering. Recorded comparison and hash checks match the reference output for every tested configuration. No executable was rebuilt or benchmark rerun for the portfolio.",
    "proofNotes": [
      "qut3 is the 200,000-FASTA-record input workload, not the computer.",
      "Eight requested OpenMP threads ran on an 8-core / 16-logical-CPU Ryzen 7 7800X3D.",
      "The 3.25× comparison uses optimised sequential; it is distinct from one-thread OpenMP scaling or total improvement over the original program."
    ],
    "evidenceData": "openmp-benchmark-data.csv",
    "evidenceTable": {
      "headers": [
        "Configuration",
        "Mean seconds",
        "Measured runs"
      ],
      "rows": [
        [
          "Optimised sequential",
          "0.588282",
          "10"
        ],
        [
          "OpenMP · 1 thread",
          "0.575697",
          "10"
        ],
        [
          "OpenMP · 2 threads",
          "0.348762",
          "10"
        ],
        [
          "OpenMP · 4 threads",
          "0.233363",
          "10"
        ],
        [
          "OpenMP · 8 threads",
          "0.180746",
          "10"
        ]
      ]
    },
    "decisions": [
      [
        "Give each record its own output",
        "Use local accumulators and disjoint prefix-defined slices instead of locks around each record. A final contiguous buffer preserves deterministic ordering, at the cost of retaining that buffer in memory."
      ],
      [
        "Precompute an immutable lookup table",
        "The fixed 20-symbol, 3-mer domain has 8,000 entries. Direct indexing removes mutable hash/RNG work from the hot path, trading setup/storage for simpler repeated computation."
      ],
      [
        "Prove a smaller accumulator safe",
        "At most 14 overlapping 3-mers contribute -1, 0 or +1 within a full partition, bounding each component to [-14,+14]. A 16-bit accumulator is sufficient and compiler-SIMD-friendly; no hand-written intrinsics are claimed."
      ]
    ],
    "limitations": "Internal application timing includes setup through output close but excludes process startup and durable-storage fsync. CPU affinity and frequency were not controlled. Serial read/layout/output limit scaling, and the reader’s correctness scope is narrow. Byte identity on the recorded inputs is not exhaustive correctness for malformed or arbitrary FASTA data. I would next benchmark memory use, scheduling choices and additional fixed workloads under a controlled runtime.",
    "resources": [],
    "source": "Retained coursework report, final-validation raw timings/statistics and correctness records. Public resources contain only sanitized aggregates; source code and course datasets are not republished.",
    "resumeBullet": "Optimised a supplied C++17 program with OpenMP, immutable lookup tables and deterministic output slices. Archived qut3 runs show 3.25x at eight threads versus optimised sequential, with matching reference bytes.",
    "number": "05",
    "coverCaption": "Measured runtime · ten runs per configuration"
  },
  {
    "slug": "graph-optimisation",
    "number": "06",
    "title": "Data-Oriented Graph Engine",
    "shortTitle": "Graph optimisation",
    "category": "Algorithms / Systems",
    "type": "C# coursework implementation",
    "role": "Routing logic & data structures",
    "technologies": "C# · BFS · Dijkstra · Flat arrays",
    "cover": "graph-engine.svg",
    "theme": "sage",
    "deck": "Planning routes when the graph is still being discovered.",
    "summary": "A memory-conscious routing implementation with flat graph storage, custom heap and hash structures, built inside an assignment runtime.",
    "evidenceLabel": "Public code & technical whitepaper",
    "contribution": "I built the player-side routing implementation: incremental discovery, BFS, weighted and lock-aware routing, resource handling, objective planning, custom heap/hash storage and action buffers. The assignment-provided runtime and harness are separate from this public implementation.",
    "problem": "The agent starts without a complete map. It must explore, remember routes and account for resources and locks while collecting objectives and reaching an exit. Repeated searches make memory representation a practical design concern.",
    "approach": "Graph and traversal state use contiguous arrays. BFS handles reachability, Dijkstra handles weighted paths, and custom priority-queue/hash storage supports repeated lookup and routing. Search stamps avoid clearing complete state arrays for every search.",
    "caption": "Illustrative topology and implementation schematic, not a benchmark or a trace from an actual runtime session. Highlighted connections explain routing structure only.",
    "decisions": [
      [
        "Store traversal state contiguously",
        "Use flat arrays rather than an object-heavy graph to keep the storage and repeated traversal behaviour explicit."
      ],
      [
        "Choose search by the question",
        "Use BFS when reachability and unweighted distance are enough; use Dijkstra when edge costs affect route selection."
      ],
      [
        "Reuse search storage",
        "Use stamps and reusable buffers to avoid repeatedly resetting or allocating full search state."
      ]
    ],
    "proof": "The public repository contains the C# implementation and a technical whitepaper explaining the algorithms and complexity. The supplied runtime is absent, so this repository alone is not a standalone application and no fresh runtime benchmark is claimed.",
    "proofNotes": [
      "BFS: O(V + E).",
      "Dijkstra with a heap: O((V + E) log V).",
      "Complexity analysis is not a measured speedup."
    ],
    "limitations": "The harness is needed for a representative end-to-end run. With an available harness, I would compare against a simple baseline across fixed seeds and report correctness, allocations and runtime separately, including unsuccessful routes.",
    "resources": [
      [
        "Public repository & whitepaper",
        "https://github.com/Vigodang/Data-Oriented-Graph-Optimization"
      ]
    ],
    "source": "Public C# implementation and technical report; scope constrained by the absent assignment runtime.",
    "period": "2026 · Coursework",
    "context": "A C# coursework player implementation for an assignment-provided graph runtime. The public implementation and whitepaper cover routing and storage; the runtime itself is not included.",
    "visual": {
      "src": "graph-engine.svg",
      "width": 900,
      "height": 560,
      "kind": "schematic",
      "label": "Graph representation",
      "alt": "Illustrative graph with routing and flat-array storage responsibilities, including BFS, Dijkstra and custom heap/hash structures.",
      "caption": "Illustrative topology and implementation schematic, not a benchmark or a trace from an actual runtime session. Highlighted connections explain routing structure only."
    }
  }
];
