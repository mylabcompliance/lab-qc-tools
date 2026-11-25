# Lab QC Tools (free, open source)

Browser-based calculators for clinical laboratories. No sign-up, no server: every calculation runs on your own machine, and nothing you enter is sent anywhere.

**Use them online:** [mylabcompliance.github.io/lab-qc-tools](https://mylabcompliance.github.io/lab-qc-tools/)

| Tool | What it does |
|---|---|
| [Westgard QC rules calculator](https://mylabcompliance.github.io/lab-qc-tools/westgard.html) | Checks 1-2s, 1-3s, 2-2s, R-4s, 4-1s and 10x for one or two control levels and draws a Levey-Jennings chart |
| [Method verification calculator](https://mylabcompliance.github.io/lab-qc-tools/method-verification.html) | Precision (CV%), accuracy by method comparison (bias, slope, intercept, r) and reportable range (recovery) against your criteria (42 CFR 493.1253) |
| [CLIA personnel qualification checker](https://mylabcompliance.github.io/lab-qc-tools/personnel-checker.html) | Screens lab directors, technical consultants, general supervisors and testing personnel against 42 CFR 493 Subpart M as amended effective Dec 28, 2024, including the grandfather clauses |

## Embed or reuse

- `src/qc.client.js`, `src/mv.client.js`, `src/pq.client.js` are plain, dependency-free scripts. Copy the matching page in `docs/` and you have a working tool.
- Want the free CLIA certificate quiz on your website? Use the [one-line embed code](https://floridalabconsultant.com/tools/embed-clia-quiz/).

## Accuracy

- The personnel checker encodes the current eCFR text of §§493.1405, 1411, 1423, 1443, 1461 and 1489. It is a screening aid; surveyors judge the actual transcripts, certificates and documented experience. Technical supervisor (§493.1449) is not covered yet.
- The QC and verification tools apply only the acceptance criteria you enter. Your laboratory director sets those criteria.

Found a mistake or a rule change? Please open an issue with a link to the source.

## About

Maintained by [Sound Lab Consultants](https://soundlabconsult.com), a clinical laboratory consulting team (CLIA, CAP, COLA and state licensure, method validation, survey preparation). Prefer software for QC logs, competency and personnel files? See [MyLabCompliance.io](https://mylabcompliance.io).

MIT License. General information, not legal advice. Not affiliated with CMS, CDC, FDA or any accrediting organization.
