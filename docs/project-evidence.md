# Public project evidence audit

> Historical public-only audit, retained for traceability. Its initial Dataset/PDF evidence gaps have been superseded by original project artifacts and the user's supplied current CV. See [refinement-evidence.md](refinement-evidence.md) for the current source, visual and measurement boundaries.

Checked 14 November 2026 (Australia/Brisbane). This audit distinguishes source inspection, locally reproduced tests, repository documentation, and facts supplied in the brief. No AWS account, private partner data, live deployment, or credit application database was accessed. Source snapshots and test logs are under `work/evidence/`.

## Editorial recommendation

Strobe AI, Predictive Credit Scoring, and Graph Optimisation have enough public implementation evidence for substantive case studies. Dataset Health Analyzer can have a bounded case study based on the supplied brief, with an explicitly labelled architecture illustration and a visible request for original controlled-test evidence; its 40-job/autoscaling result was not independently corroborated. CRDC should stay a clearly labelled QUT team capstone with confidential source material withheld. The supplied brief establishes the personal emphasis but public sources do not establish sole authorship or partner employment.

## Strobe AI — strong public evidence

- Public source: <https://github.com/Vigodang/strobe-ai-serverless-agent>
- Inspected commit: `5d3a43fa8103e663daadeca62e72f8dea98a3df0` (22 September 2026).
- Source confirms Node.js ES modules, AWS SDK clients, ACP client-facing streaming adapter, separate read-only MCP service, Bedrock chat/vision adapters, Titan embeddings, S3 Vectors, DynamoDB state, and SQS classifier/indexer handlers.
- `src/services/a2/s3VectorService.js` constructs a mandatory `userId` filter. MCP tools receive identity from server context, verify post ownership, and expose read-only handlers. Important limitation: `mcp-server/src/context/identity.js` uses configured demo identity; do not describe this as finished production multi-tenant authorization.
- Retry behavior is implemented: completed classification jobs skip duplicate processing, SQS handlers return partial batch failures, and heartbeat state includes stale/failed-run recovery. These are concrete engineering decisions suitable for a source-derived diagram.
- Fresh verification: `npm.cmd ci --ignore-scripts`, then `npm.cmd test` in all three packages. Backend **145/145**, ACP **67/67**, MCP **17/17**; **229 tests passed**, zero failed or skipped. These are local automated tests, reproduced on 14 November 2026; they are not a cloud integration/performance or production-availability claim.
- Saved logs: `work/evidence/strobe-backend-test.log`, `strobe-acp-test.log`, `strobe-mcp-test.log`.
- README describes earlier live smoke tests and explicitly says the ECS/Fargate MCP service was intentionally stopped. It also documents a local ACP server. Current deployed availability was not verified. Lambda packaging verification was not run in this audit.
- `docs/assets/` contains only a README of screenshot placeholders. Do not display synthetic WebUI/CloudWatch/DynamoDB screenshots as evidence.
- Attribution: package author is `QUT CAB432`; README identifies academic origin. Say academic engineering project. Individual contribution boundaries need the user's own account; source ownership alone does not prove sole authorship.
- Licensing: root package declares MIT and README includes an MIT badge, but no matching root LICENSE exists. The README itself asks for license confirmation. Do not label this a fully licensed MIT distribution in the portfolio.
- Dependency installation reported vulnerabilities in the historical project dependency trees (backend 8, ACP 8, MCP 9). They were not remediated because this is a read-only evidence audit. Avoid describing the system as production-secure.

Useful stable sources:

- [README at inspected revision](https://github.com/Vigodang/strobe-ai-serverless-agent/blob/5d3a43fa8103e663daadeca62e72f8dea98a3df0/README.md)
- [User-scoped vector implementation](https://github.com/Vigodang/strobe-ai-serverless-agent/blob/5d3a43fa8103e663daadeca62e72f8dea98a3df0/src/services/a2/s3VectorService.js)
- [MCP handlers and ownership checks](https://github.com/Vigodang/strobe-ai-serverless-agent/blob/5d3a43fa8103e663daadeca62e72f8dea98a3df0/mcp-server/src/tools/strobeTools.js)
- [Configured demo identity boundary](https://github.com/Vigodang/strobe-ai-serverless-agent/blob/5d3a43fa8103e663daadeca62e72f8dea98a3df0/mcp-server/src/context/identity.js)

## Predictive Credit Scoring — code and data confirmed, runtime not reproduced

- Public source: <https://github.com/Vigodang/AI-Predictive-Credit-Scoring-System>
- Inspected commit: `e4c11bc8bed89b81a46af0e81fb35c85510ae6f5`.
- Source contains Python/PyQt6 screens, MySQL services, prediction logging/history queries, active-model management, comparison/reporting UI, and optional Gemini service. Appropriate label: academic/personal ML desktop prototype, not a deployed banking product.
- CSV counts independently confirmed with Python's standard `csv` reader: `UCI_Credit_Card.csv` has **30,000 rows and 25 columns**; actual training input `UCI_Credit_Card_12months_OLD.csv` has **30,000 rows and 43 columns**. Both have 6,636 defaults and 23,364 non-defaults.
- `ml/train_models.py` actually trains XGBoost, LightGBM, and Logistic Regression with isotonic calibration. Its seed is 42, splits are stratified approximately **70/15/15**, identifiers are dropped, and artifacts/evaluation arrays are saved. This is stronger evidence than the repository short description, which also names CatBoost; CatBoost/service factory support is not equivalent to a trained comparison result.
- The expanded dataset is a 12-month *feature schema*. Provenance of the added history was not established; do not imply 12 months of independently collected real customer histories.
- A similarly named `UCI_Credit_Card_12months.csv` does not parse as a normal comma-delimited table in the standard reader. The training script explicitly selects the `_OLD.csv` file, so reference that exact file in reproducibility notes.
- `tests/main.py` is the application launcher. This is not evidence of an automated test suite.
- No MySQL database or trained artifacts were provisioned and no training/application run was attempted. Do not publish model performance figures as freshly reproduced results. No fairness clearance, clinical/banking validation, production use, or business impact is established.
- No project LICENSE found; GitHub API reports `license: null`. Link to public code, avoid a broad open-source licensing claim, and do not redistribute customer/report exports as portfolio assets.

Useful sources:

- [Training implementation](https://github.com/Vigodang/AI-Predictive-Credit-Scoring-System/blob/e4c11bc8bed89b81a46af0e81fb35c85510ae6f5/ml/train_models.py)
- [ML service](https://github.com/Vigodang/AI-Predictive-Credit-Scoring-System/blob/e4c11bc8bed89b81a46af0e81fb35c85510ae6f5/services/ml_service.py)
- [Model registry service](https://github.com/Vigodang/AI-Predictive-Credit-Scoring-System/blob/e4c11bc8bed89b81a46af0e81fb35c85510ae6f5/services/model_management_service.py)
- [Prediction history/data queries](https://github.com/Vigodang/AI-Predictive-Credit-Scoring-System/blob/e4c11bc8bed89b81a46af0e81fb35c85510ae6f5/services/query_service.py)

## Data-Oriented Graph Optimisation — good scoped coursework evidence

- Public source: <https://github.com/Vigodang/Data-Oriented-Graph-Optimization>
- Inspected commit: `0170ce8b487ff752c710d29b77b2382e9105a419`.
- Source confirms a C# autonomous player for the assignment's Return to Bork graph environment: parallel arrays/forward-star adjacency, open-addressing node lookup, BFS, Dijkstra, custom binary heap, area graph/MST planning, search stamps, and manual array capacity growth.
- Public deliverable includes `docs/Autonomous_Agent_Graph_Optimization_Whitepaper.pdf`. The source depends on an assignment-provided `RTBLocation` harness absent from the repository. No standalone application build or benchmark was reproduced.
- Suitable proof: public implementation and technical report; a source-derived schematic explaining graph discovery, route planning, and action selection.
- Do not copy README's "senior-level" or "production-style" marketing, imply robotics deployment, or fabricate speedup/latency figures.
- No project LICENSE found; GitHub API reports `license: null`.
- [Implementation at inspected revision](https://github.com/Vigodang/Data-Oriented-Graph-Optimization/blob/0170ce8b487ff752c710d29b77b2382e9105a419/src/Graph_Optimization_Engine/GraphOptimizationPlayer.cs)
- [Public technical report](https://github.com/Vigodang/Data-Oriented-Graph-Optimization/blob/0170ce8b487ff752c710d29b77b2382e9105a419/docs/Autonomous_Agent_Graph_Optimization_Whitepaper.pdf)

## Projects with evidence boundaries

- **Dataset Health Analyzer:** no corresponding public repo in current owner inventory. Architecture/module list and controlled 40/40 jobs, 1→4→1 worker scaling are supplied in the user's brief only. Original assignment report, logs, screenshots, and exact contribution/date boundaries are still needed to substantiate measured performance independently. A labelled architecture drawing may restate the supplied design; no measured chart should be invented.
- **CRDC synthesis:** no public repo found. Keep the brief's QUT student-team/partner framing. Retrieval, reranking, provenance, temporal diversity can be described at a high level as the user's stated emphasis. Avoid confidential document names/content, unpublished results, partner logos implying employment, and sole-author claims.
- **Parallel protein signatures:** no public repo found. The 3.25× result, 8-thread qut3 machine, optimized sequential baseline, and byte-identical output are brief-supplied, not independently checked. Publish a bounded summary only if needed, with measured-result provenance explicit.
- **PH² visualization:** no public repo found in current inventory. 200-image context is supplied in the brief; do not imply clinical validation.
- **Beta-binomial ecological analysis:** public README and tree inspected at <https://github.com/Vigodang/Beta-Binomial-GLMM-Ecological-Analysis>. Includes R Markdown, retained power-analysis `.rds`, public summary PDF and report-generation script. README explicitly withholds confidential raw data. Suitable compact secondary link; do not imply independent model reproduction or real consulting employment. Retained simulation claims were not independently rerun.

## Public repository inventory

GitHub REST API owner inventory returned 13 public repositories. All had GitHub `license: null` at audit time. Full metadata saved at `work/evidence/repo-inventory.json`.

1. Advanced-Machine-Learning-Coursework — API reports an empty repository; no README/tree to audit. Do not feature.
2. AI-Predictive-Credit-Scoring-System — inspected above.
3. airbnb-mongodb-analysis — inventory only.
4. Beta-Binomial-GLMM-Ecological-Analysis — README/tree inspected.
5. clinical-consultation-workload-analysis — inventory only; do not promote unreviewed health-data claims.
6. Data-Oriented-Graph-Optimization — inspected above.
7. Data-Structures-and-Algorithms-Coursework — inventory only.
8. Drone-Imagery-Semantic-Segmentation — inventory only.
9. Infection-Risk-Prediction-ML — inventory only; no clinical validation inferred.
10. Quasi-Poisson-Policy-Analysis — inventory only.
11. strobe-ai-serverless-agent — inspected/tested above.
12. vigodang.github.io — original site tree/README inspected.
13. Weblog-Text-Mining-Analytics — inventory only.

API source: <https://api.github.com/users/Vigodang/repos?per_page=100>. Public absence is not evidence that a private project does not exist.

## Outstanding evidence questions for the portfolio audit

1. Which exact parts of each academic/team project did Vigo personally implement, and when?
2. Is the supplied new CV available and factually current, including July 2027 graduation?
3. Can original Dataset Health Analyzer controlled-test artifacts be supplied, and may they be displayed publicly?
4. Are real Strobe demo screenshots and sanitized cloud evidence available?
5. What is the intended code/data license for each public project? Strobe's metadata alone is incomplete licensing evidence.
6. Family-business employment/dates/metrics and barista employer/dates are not established by this public-project audit; omit unsupported specifics unless user-provided CV/evidence confirms them.
