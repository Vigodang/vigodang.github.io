# Refinement evidence and provenance

Reviewed 14 November 2026. This note records the evidence used by the current portfolio refinement. It supersedes the initial public-only audit where additional original project evidence and the current CV have since been supplied. It does not certify a final build, deployment or PDF rendering check.

Only selected interface captures, redrawn schematics and aggregate measurements are published. Private source archives, assessment reports, course datasets, partner material, cloud inventories and raw logs are not public downloads.

## Dataset Health Analyzer

Original submission source, timestamped experiment records and actual browser captures now support this QUT CAB432 case study. The student's submission association supports the application-development and integration account. Earlier course infrastructure was reused; the portfolio does not claim every inherited component was written from scratch.

The source establishes a React client, Cognito authentication, API Gateway/Lambda control plane, private direct S3 uploads, DynamoDB job state, Lambda-submitted SQS work and ECS/Fargate analysis workers. This project does not use Strobe's EventBridge media-processing path. The implementation is Node.js/JavaScript; the current CV's Dataset project stack is corrected from Python to Node.js in the generated résumé content on that evidence basis.

Three historical snapshots remain separate:

- **12 October 2026:** controlled AWS experiment. All 40 jobs completed, with zero failures or cancellations and an empty final dead-letter queue. Observed desired/running workers increased from one to four and returned to one.
- **17 October 2026:** real report-interface captures of a separate showcase file, containing 22,030 rows and 23 columns. These are demonstration results, not the autoscaling workload.
- **24 October 2026:** locally reviewed correctness fixes. This source revision was not deployed and is not represented as the implementation measured in the earlier AWS experiment.

The controlled workload selected all six modules: profiling, missing values, duplicate rows, numeric statistics, IQR outliers and Pearson correlation. Each generated test input contained 80,001 data rows and seven columns in 2,886,027 bytes; the nominal generator parameter was 80,000 base rows, followed by one deliberate duplicate. It contained no customer workload.

The published scaling chart is a new Matplotlib drawing of 26 recorded observations over 460.931 seconds. Completion points connect measured samples; worker traces show sampled state as steps. The figure does not establish exact transition times, per-job latency, a fourfold speedup or production readiness. The downloadable CSV preserves the aggregate observations with elapsed seconds and excludes private identifiers and endpoints. Approximate queue counts retained in the data are not plotted or treated as precise distinct-job counts.

The selected report and correlation JPEGs are unaltered real browser captures. Visual review found no visible user identity, private endpoint, job identifier, credential or row-level personal data; the selected files contain no EXIF/XMP/comment metadata. The report's aggregate showcase results must not be presented as customer impact or merged with the load-test measurements.

Published assets:

- `src/assets/dataset-health-report.jpg` — real report interface.
- `src/assets/dataset-health-correlations.jpg` — real exploratory correlation view.
- `src/assets/dataset-health.svg` — source-derived architecture schematic.
- `src/assets/dataset-health-scaling.svg` and `.csv` — measured controlled-run chart and sanitized aggregate data.

Known limitations remain visible: bounded in-memory analysis, minimum capacity of one worker, no automatic recovery for a worker crash after claiming a job, and non-atomic DynamoDB/SQS submission. Conditional claims and duplicate protection do not establish exactly-once processing. No live AWS experiment was rerun during this refinement.

## Parallel protein signature generation

Retained individual coursework documentation, raw timings, summary statistics and byte-comparison records support the C++17/OpenMP case study. The contribution is performance engineering of supplied software: state ownership, immutable lookup, bounded accumulators, deterministic output layout and measurement. The supplied algorithm and libraries are not claimed as new inventions.

The headline comparison uses the **optimised sequential baseline**, derived from the final implementation with OpenMP directives/linking removed. It is distinct from one-thread OpenMP scaling and from total improvement over the original program.

- Optimised sequential mean: **0.5882820 seconds**.
- Eight requested OpenMP threads: **0.1807455 seconds**.
- Ratio: **3.254753**, reported as **3.25×**.
- Ten measured runs per configuration, after an unmeasured warm-up, with forward/reverse configuration ordering.
- Error bars show archived Student-t **95% confidence intervals for mean runtime**, not a confidence interval for the speedup ratio.

The machine was an AMD Ryzen 7 7800X3D with eight physical cores and 16 logical CPUs, under WSL2 with GCC/G++ 15.2.0. The recorded input workload contained 200,000 FASTA records; it is a dataset label rather than the machine name. The retained reader deliberately preserves a legacy extra EOF processing pass. Byte-identical output is supported by the recorded configuration checks, not by exhaustive validation of arbitrary FASTA input.

The new `src/assets/openmp-benchmark.svg` and sanitized `.csv` plot retained runtime means and intervals. Summary statistics were independently recomputed from the retained timings; **no executable was rebuilt and no benchmark was rerun** for the portfolio. CPU affinity and frequency were not controlled. Timing includes application setup through output close, excludes process startup, and does not establish durable-storage synchronization time. Serial input/output and retained buffers limit generalization.

## Strobe AI

The existing verified result remains **229 local automated tests passed**: 145 backend, 67 ACP and 17 MCP tests, with zero failures or skips, reproduced on 14 November 2026 against public commit `5d3a43f`. These counts belong to Strobe and are not evidence about Dataset Health Analyzer.

The test ledger and architecture are redrawn figures, not cloud-console or product screenshots. The configured demo identity is explicit; production multi-user authentication is unfinished. The public README describes local ACP operation and an intentionally stopped MCP Fargate smoke deployment. Local test success does not establish current cloud availability, scale or a complete security review. No new cloud deployment or cloud performance run is claimed.

## Predictive Credit Scoring

Public code and local data counts support the Python/PyQt6/MySQL application, 30,000-record context and calibrated Logistic Regression/XGBoost/LightGBM training workflow. They do not establish a validated lending service.

The dashboard can use **simulated fallback metrics** when genuine saved evaluation arrays are absent. Those fallback plots are excluded from the portfolio. No displayed accuracy/AUC figure, saved-evaluation screenshot, freshly retrained result or independently reproduced held-out quality result is claimed. The published visual is a labelled source-derived application-flow schematic.

Expanded-history feature provenance, fairness, leakage, calibration and threshold analysis remain limitations. An application launcher in a test-named directory is not an automated test suite. No real lending usage or business impact is inferred.

## CRDC team capstone

The public account covers the student's stated lead-agent orchestration, task-specific retrieval, document/chunk evaluation, reranking, provenance and temporal-diversity contribution within a QUT team. It is a student capstone with a partner, not partner employment or an internship.

Only a sanitized conceptual workflow is published. Private source, partner documents, corpus details, screenshots and unpublished evaluation results remain withheld. A conceptual diagram is not measured retrieval-quality evidence or a partner endorsement. Detailed release requires the appropriate permission.

## Deep learning and the current CV

The current CV **has been supplied** and is preserved at `content/current-cv.tex`. It is the source for the refreshed résumé's current profile, skills, project list, education and July 2027 graduation. The public PDF and HTML résumé are derived from that current content with the documented Dataset project-stack correction to Node.js. This provenance note does not itself claim that the current regeneration has passed layout or build validation.

Public Drone Imagery Semantic Segmentation code independently supports TensorFlow/Keras, residual U-Net-style segmentation, RGB/DSM inputs and tiled inference. No new training, model-quality measurement or benchmark is asserted. The user's current CV additionally lists **PyTorch**; that is user-supplied skill information, not a claim that the inspected TensorFlow/Keras project implements PyTorch. The portfolio preserves this distinction.

## Public-release boundaries

The source-derived diagrams and newly drawn charts are labelled by evidence type. Actual browser captures retain their real interface appearance. No synthetic product screenshot, private cloud endpoint, account/student/job identifier, presigned URL, raw course dataset or confidential partner material is included in these selected assets. Public repository availability alone is not a general redistribution licence; private code or whole project archives are not published.

Build checks, responsive review, résumé rendering and deployment verification belong in the delivery record after those steps actually finish. Historical project observations remain dated and separate from checks performed for the portfolio.
