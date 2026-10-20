# Neurodegen-Vis: Disclaimer

This file is the release disclaimer required by the HEREDITARY misuse self-assessment (D9.1, Ethics Requirement 1). Neurodegen-Vis is a visualisation tool over a synthetic table. It shows cohort-level statistics only, makes no prediction and has no clinical function.

> **Research use only. Not a medical device.**
> This software was developed in the HEREDITARY project as a research prototype. It has not been assessed or certified under the EU Medical Device Regulation (EU) 2017/745. It must not be used to diagnose, treat, monitor or make any other decision about individual patients.

<!-- To be shown in the user interface:
"Research prototype of the HEREDITARY project. Not a medical device and not for clinical use. The data shown is synthetic. Do not enter personal or patient data." (not yet shown, as of 2026-10-18) -->

## 1. Overview

| Field | Value |
|---|---|
| Name | Neurodegen-Vis |
| Version | v0.1.0 |
| Type | Demo or web application (source code, plus a synthetic sample dataset) |
| Owner partner and contact | TU Graz (IVC); Peter Waldert, peter.waldert@tugraz.at |
| License | MIT (see [`LICENSE`](LICENSE)), in line with the WP5 licensing policy (D5.2, "Component FAIRification"). The Zenodo record of v0.1.0 is licensed CC-BY-4.0 (the GitHub-Zenodo default); the next archived version should carry MIT. |
| Repository and DOI | https://github.com/hereditary-eu/Neurodegen-Vis — demo: https://hereditary.cgv.tugraz.at/neurodegen-vis/ — Zenodo: https://doi.org/10.5281/zenodo.17870087 — paper: https://ceur-ws.org/Vol-4172/paper1.pdf — video: https://www.youtube.com/watch?v=Dx4C1wNZ3Fk |
| Release date | Repository created 2025-12-09; v0.1.0 archived on Zenodo in December 2025 |
| Related task or deliverable | WP5, T5.1; D5.1, D5.2 (demonstrator); component chapter in D5.5 |
| How to cite | Grabner, Waldert, Kantz, Schreck, *Privacy-Preserving Visual Exploration of Healthcare Data with a Language Model Integration*, Joint Proceedings of the ECAI 2025 Workshops XAI-KRKG and UCEX-XAI, Bologna, 2025. https://ceur-ws.org/Vol-4172/paper1.pdf |

## 2. Intended use

**Primary intended use.** Exploratory visual analysis of tabular cohort data. Neurodegen-Vis combines a Pearson correlation heatmap, scatterplots, histograms and a PCA biplot with k-means clustering, so that a user can find correlations between clinical variables, spot distribution shifts introduced by different test methodologies, and inspect group structure. An integrated language-model assistant explains features, explains the views themselves, and proposes feature pairs worth looking at — grounded only in differentially private results computed on the displayed synthetic table, never on patient records.

**Intended users.** Visualization and biomedical data-science researchers, and developers building LLM-assisted analytics dashboards.

**Out-of-scope uses.** This release must not be used for

- clinical diagnosis, prognosis or treatment of individual patients;
- decisions about individuals, such as insurance, employment or access to care;
- re-identification of individuals, or linkage of the released synthetic table with other data sources;
- drawing epidemiological or statistical conclusions about Parkinson's Disease — the released table is synthetic and its correlations are approximations, not findings;
- processing real patient data through the default local configuration, which routes chat context to a third-party model API (see Section 4).

## 3. Data provenance

| Dataset | Source partner | Type | Population | Ethics approval or access conditions |
|---|---|---|---|---|
| Project-internal Parkinson's Disease cohort | University of Padua, courtesy of Prof. Antonini's research group | Personal clinical data — **not released** | ~50 patients, ~100 columns: demographics (age, time since PD diagnosis), cognitive test batteries (attentional, executive, visuospatial, memory, language z-scores), treatment details; ~15 unique measurements after removing duplicate encodings and test-method markers | Shared inside HEREDITARY under the project's data-sharing arrangements and the ethics approvals held by the University of Padua (D2.2, Table 1). Used only to fit the anonymisation pipeline; never published. |
| Neurodegen-Vis synthetic sample table | TU Graz (generated) | Synthetic, differentially private | 100 generated rows over the same feature schema | Served by the deployed demo (`database/noisy.csv`) and kept in the git history (commit `d3a0070`); not in the current repository tree or the Zenodo archive. Its `record_id` and birth-date columns are generated, not real. |

The repository and the deployed demo contain no personal data, pseudonymized records, identifiers or pseudonymization keys. Direct identifiers are stripped before synthesis, and only the synthetic output is distributed — not the source cohort and not the fitted generator.

## 4. Method

- **Algorithm or architecture.** React/TypeScript frontend; all analytics run client-side (the table is under 100 KB): Pearson correlation matrix, k-means++, PCA with biplot loadings, plots via Observable Plot and D3. A small FastAPI backend relays chat messages to an OpenAI-compatible endpoint; the chat context is the dashboard description, the feature descriptions and the computed correlation values, so the model never sees a data row.
- **Training setting.** No predictive model is trained or released. The only component fitted to real data is the anonymisation pipeline, run once by the data holder.
- **Privacy techniques.** Differential privacy. Direct identifiers are removed; categorical columns are synthesised with the MWEM mechanism as implemented in OpenDP's `smartnoise-sdk`; the ~60x60 Pearson correlation matrix is passed through the same mechanism before use; continuous columns are re-sampled from fitted bounded distributions in randomised order, with each draw skewed by the noised correlations against the already-sampled columns, so that the synthetic table preserves correlation structure.
- **Language model.** Deployment uses a self-hosted vLLM instance at TU Graz (`SERVER=true`, `OPENAI_BASE_URL=https://hereditary.cgv.tugraz.at/lm/api/v1`, Austria/EU). The default local configuration documented in the repository README (`SERVER=false`) uses the OpenAI API with `gpt-4o-mini`, i.e. a non-EU/EEA processor; set `SERVER=true` and `OPENAI_BASE_URL` to keep inference in-house.

## 5. Performance

- **Evaluation data.** The synthetic table derived from the Padua PD cohort. No quantitative benchmark; the system was demonstrated through use cases and presented at the UCEX-XAI workshop at ECAI 2025 (TRL 3–4).
- **Metrics and results.** Not applicable — the tool makes no prediction. Reported qualitatively in the paper: the LLM integration answers feature and dashboard questions correctly in the demonstrated cases, and the "suggest features" function reliably returns a usable feature pair under a strictly formatted prompt.
- **Results by subgroup.** Not reported. The source cohort (~50 patients, single site) is far too small for subgroup estimates, and the displayed data is synthetic.

## 6. Known limitations and risks

- **Synthetic data is not evidence.** Every correlation, cluster and loading shown is computed on a differentially private synthetic table. It approximates the source distribution and its correlations; it must not be quoted as a result about Parkinson's Disease patients.
- **Incomplete DP coverage.** The categorical columns and the correlation matrix carry a formal MWEM guarantee. The means, standard deviations and bounds used to sample the *continuous* columns are taken from the real cohort and are not themselves noised, so the synthetic table leaks approximate aggregate statistics of continuous features. No epsilon budget is published for the pipeline as a whole. DP-noised continuous marginals and a stated budget are the planned next step.
- **No extraction test.** No membership-inference or attribute-inference attack was run against the synthetic table; this was judged disproportionate given that the generator is not released and the published sample is 100 rows, but it means the residual risk above is documented rather than measured.
- **LLM failure modes.** The assistant can misstate a number, over-interpret a correlation causally, or answer confidently outside its given context. The design contains this — it is prompted to explain and to point at views rather than to conclude, and every statement it makes is verifiable on screen — but it does not eliminate it.
- **Generalizability.** Built around one feature schema (`PD_DataFieldsDescription_plain.txt`, the PD cohort's fields). Applying it to another dataset requires replacing the feature descriptions, the variable lists and the system prompts.
- **Deployment hygiene.** The backend currently sets CORS `allow_origins=["*"]` (marked `TODO` in `backend/main.py`) and prints every generated chat response to the container log (`backend/chat.py`; responses can quote the user's question, while logging of the incoming messages is commented out). Neither exposes personal data in the current demo, but both should be tightened before any deployment that accepts user-supplied text.

## 7. Responsible use and reporting

- **Terms of use.** Public read-only demo over a synthetic table; no user data upload path. Licensed under MIT (`LICENSE`).
- **Pre-release actions.** This disclaimer is linked from the repository README since 2026-10-18. Since the same date the repository carries an MIT `LICENSE` file. Still open: show the research-use line in the dashboard header, restrict CORS and drop content logging.
- **Contact for misuse or vulnerability reports.** peter.waldert@tugraz.at

## 8. Acknowledgement

Funded by the European Union under grant agreement No 101137074 (HEREDITARY). Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or the European Health and Digital Executive Agency (HaDEA). Neither the European Union nor the granting authority can be held responsible for them.
