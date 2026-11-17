// Condensed from the existing verified portfolio; themed stations are fictional navigation.
export const projects = [
  {
    "title": "AI-Assisted Research Synthesis",
    "context": "QUT team capstone · CRDC partner",
    "role": "Lead-agent orchestration & evaluation",
    "what": "A team research system for source-linked synthesis of historical scientific reports.",
    "contribution": "I contributed lead-agent orchestration, task-specific retrieval, cross-encoder reranking, document/chunk relevance checks and provenance, and explored temporal diversity in selected evidence.",
    "tools": [
      "Python",
      "RAG",
      "Multi-agent workflow",
      "Embeddings",
      "Cross-encoder reranking"
    ],
    "why": "A relevant document is not enough: the passage used in an answer must support the task and retain its source.",
    "evidence": {
      "label": "Team capstone · private partner material",
      "summary": "The public case explains my contribution and a sanitized conceptual workflow. No retrieval-quality score is published.",
      "basis": "Student-team contribution account and a sanitized conceptual workflow. Public-release permission is required for detailed partner artefacts."
    },
    "evidenceLimit": "A QUT student-team capstone with CRDC, not employment or an internship. Partner material is private; no independent quality result or partner endorsement is claimed.",
    "links": [
      {
        "label": "Read case study",
        "href": "/projects/crdc-capstone.html",
        "kind": "case-study"
      }
    ],
    "id": 0,
    "slug": "crdc-capstone",
    "name": "AI-Assisted Research Synthesis",
    "short": "AI Lab",
    "icon": "retrieval",
    "x": 440
  },
  {
    "title": "Dataset Health Analyzer",
    "context": "QUT CAB432 · Cloud computing project",
    "role": "CSV workflow & application integration",
    "what": "An authenticated web app that uploads a CSV, queues its analysis and returns an interactive quality report.",
    "contribution": "I developed the CSV analysis workflow and integrated authentication, direct uploads, persistent job tracking, queued workers and reporting, building on earlier course infrastructure.",
    "tools": [
      "React",
      "JavaScript/Node.js",
      "Cognito",
      "API Gateway/Lambda",
      "S3",
      "DynamoDB",
      "SQS",
      "ECS/Fargate"
    ],
    "why": "Long-running analysis stays outside the browser request while users can track progress and retrieve results.",
    "evidence": {
      "label": "40/40 jobs completed · observed workers 1 → 4 → 1",
      "summary": "The archived 12 October 2026 AWS experiment completed 40/40 jobs; observed workers scaled 1 → 4 → 1, with no failed/cancelled jobs and an empty final dead-letter queue.",
      "basis": "Original submission source, accepted 12 October experiment CSV/JSON and unaltered 17 October interface captures. Only aggregate measurements and safe UI views are published."
    },
    "evidenceLimit": "The run was not repeated. Bounded in-memory analysis, abandoned RUNNING jobs and non-atomic DynamoDB/SQS submission remain limits. The 17 October UI and 24 October undeployed fixes are separate snapshots; production readiness is not established.",
    "links": [
      {
        "label": "Read case study",
        "href": "/projects/dataset-health.html",
        "kind": "case-study"
      },
      {
        "label": "Recorded aggregate data",
        "href": "/assets/dataset-health-scaling.csv",
        "kind": "aggregate-data"
      }
    ],
    "id": 1,
    "slug": "dataset-health",
    "name": "Dataset Health Analyzer",
    "short": "Cloud Hub",
    "icon": "cloud",
    "x": 1080
  },
  {
    "title": "Predictive Credit Scoring System",
    "context": "Independent ML application",
    "role": "Application & ML workflow",
    "what": "A desktop app connecting data preparation, model training, predictions, history and reporting around a 30,000-record dataset.",
    "contribution": "I built the application workflow: PyQt6 screens, service/domain layers, structured predictions, model context, MySQL history and reporting.",
    "tools": [
      "Python",
      "PyQt6",
      "MySQL",
      "scikit-learn",
      "Logistic Regression",
      "XGBoost",
      "LightGBM"
    ],
    "why": "Model outputs are easier to inspect when probabilities, model metadata and prediction history are kept together.",
    "evidence": {
      "label": "Public code · three implemented model families",
      "summary": "Public code implements calibrated Logistic Regression, XGBoost and LightGBM. The dataset row count was checked; it is not a model-quality result.",
      "basis": "Public source and data-shape inspection at commit e4c11bc8. Model training, application execution and financial validation were not reproduced."
    },
    "evidenceLimit": "No held-out quality result was independently reproduced. Simulated fallback dashboard metrics are excluded. This student application is not a validated lending service; leakage, calibration, fairness and feature provenance need review.",
    "links": [
      {
        "label": "Read case study",
        "href": "/projects/predictive-risk.html",
        "kind": "case-study"
      },
      {
        "label": "Public repository",
        "href": "https://github.com/Vigodang/AI-Predictive-Credit-Scoring-System",
        "kind": "repository-source"
      }
    ],
    "id": 2,
    "slug": "predictive-risk",
    "name": "Predictive Credit Scoring System",
    "short": "Data City",
    "icon": "data",
    "x": 1720
  },
  {
    "title": "Strobe AI",
    "context": "Academic engineering project",
    "role": "Agent & backend engineering",
    "what": "A multimodal AI assistant with streaming conversations, read-only tools, user-scoped retrieval and queued media processing.",
    "contribution": "My work focused on agent/MCP tool boundaries, server-scoped identity and retrieval, asynchronous AWS media processing and retry behaviour within the wider system.",
    "tools": [
      "Node.js",
      "AWS Bedrock",
      "ACP",
      "MCP",
      "S3 Vectors",
      "DynamoDB",
      "EventBridge/SQS"
    ],
    "why": "Tool access and slow media processing need explicit boundaries so the conversational model does not decide record ownership.",
    "evidence": {
      "label": "229 local automated tests passed",
      "summary": "At public commit 5d3a43f, local suites passed 145 backend, 67 ACP and 17 MCP tests on 14 November 2026: 229 passed, no failures or skips.",
      "basis": "Public repository, README and dated local test reproduction at commit 5d3a43f."
    },
    "evidenceLimit": "MCP uses a configured demo identity; production multi-user authentication remains unfinished. Local tests do not establish current cloud availability, scale or a complete security review. No cloud deployment was rerun.",
    "links": [
      {
        "label": "Read case study",
        "href": "/projects/strobe-ai.html",
        "kind": "case-study"
      },
      {
        "label": "Public repository",
        "href": "https://github.com/Vigodang/strobe-ai-serverless-agent",
        "kind": "repository-source"
      }
    ],
    "id": 3,
    "slug": "strobe-ai",
    "name": "Strobe AI",
    "short": "Agent HQ",
    "icon": "agent",
    "x": 2360
  },
  {
    "title": "Parallel Protein Signature Generation",
    "context": "QUT CAB401 · Student coursework",
    "role": "Performance engineering & benchmarking",
    "what": "A supplied C++ protein-signature program reworked for deterministic parallel execution.",
    "contribution": "I redesigned record ownership, made hot-path lookup read-only, used bounded accumulators and disjoint output slices, then benchmarked versions and checked output bytes.",
    "tools": [
      "C++17",
      "OpenMP",
      "Profiling",
      "Memory layout",
      "Correctness checks"
    ],
    "why": "Parallel work is useful when it preserves the output and avoids shared-state contention.",
    "evidence": {
      "label": "3.25× at 8 threads · byte-identical recorded output",
      "summary": "Retained qut3 timings show 3.25× at eight threads versus optimised sequential: 0.1807455 s versus 0.5882820 s. Recorded configuration checks were byte-identical.",
      "basis": "Retained coursework report, final-validation raw timings/statistics and correctness records. Public resources contain only sanitized aggregates; source code and course datasets are not republished."
    },
    "evidenceLimit": "qut3 is the 200,000-record input, not the machine. This is an archived workload/hardware-specific result; no benchmark was rerun. CPU affinity/frequency were uncontrolled, and recorded byte identity is not exhaustive correctness.",
    "links": [
      {
        "label": "Read case study",
        "href": "/projects/parallel-protein.html",
        "kind": "case-study"
      },
      {
        "label": "Recorded aggregate data",
        "href": "/assets/openmp-benchmark-data.csv",
        "kind": "aggregate-data"
      }
    ],
    "id": 4,
    "slug": "parallel-protein",
    "name": "Parallel Protein Signature Generation",
    "short": "Compute",
    "icon": "parallel",
    "x": 3000
  },
  {
    "title": "Drone Imagery Semantic Segmentation",
    "context": "Coursework/research implementation · public source",
    "role": "Deep Learning implementation study",
    "what": "A TensorFlow/Keras segmentation workflow using RGB imagery and DSM elevation, with tiled inference.",
    "contribution": "Source-visible implementation covers a residual U-Net-style encoder-decoder, aligned multimodal inputs, training/loss code, tiled mask reconstruction and weighted evaluation metrics.",
    "tools": [
      "TensorFlow/Keras",
      "Residual U-Net-style model",
      "RGB + DSM",
      "Tiled inference"
    ],
    "why": "Pixel-level classification requires aligned inputs and consistent reconstruction of tiled predictions.",
    "evidence": {
      "label": "Pinned implementation source",
      "summary": "Public source at d1d344d supports the implementation description. No retained checkpoint, actual prediction image, training history or original metric output was found.",
      "basis": "work/refinement-public-evidence.md; docs/refinement-evidence.md"
    },
    "evidenceLimit": "Individual ownership is not independently attributed. The source uses TensorFlow/Keras; no model-quality result, checkpoint or training run is claimed here.",
    "links": [
      {
        "label": "View source",
        "href": "https://github.com/Vigodang/Drone-Imagery-Semantic-Segmentation",
        "kind": "repository"
      },
      {
        "label": "Model implementation",
        "href": "https://github.com/Vigodang/Drone-Imagery-Semantic-Segmentation/blob/d1d344d2abb1ad25e414a15c41183294c37c1679/libs/models_UNet.py",
        "kind": "pinned-source"
      }
    ],
    "id": 5,
    "slug": "drone-segmentation",
    "name": "Drone Imagery Semantic Segmentation",
    "short": "Vision",
    "icon": "vision",
    "x": 3640,
    "contributionLabel": "Implementation focus"
  }
];
export const profile = {
  "name": "Vigo Dang",
  "fullName": "Truong Lieu Dong (Vigo) Dang",
  "headline": "QUT Data Science undergraduate · software, cloud & applied AI",
  "intro": "I’m Vigo, a QUT Data Science student in Brisbane. I build data applications, AWS workflows and retrieval-based AI, with an emphasis on implementation, evaluation and clear evidence.",
  "location": "Brisbane, Australia",
  "university": "Queensland University of Technology",
  "degree": "Bachelor of Data Science",
  "minor": "Advanced Computing for Data Science",
  "graduation": "Expected July 2027",
  "opportunity": "Seeking internship or early-career opportunities in data, analytics, software and cloud engineering.",
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
  "deepLearning": {
    "display": "Deep Learning & AI · PyTorch, TensorFlow",
    "sourceBackedDetail": "TensorFlow/Keras segmentation, residual U-Net-style model, RGB + DSM inputs and tiled inference.",
    "boundary": "PyTorch is user-supplied CV information; it is not attributed to the inspected TensorFlow/Keras Drone implementation. No model-quality or new training result is claimed."
  }
};
