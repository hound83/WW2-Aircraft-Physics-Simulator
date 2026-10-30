# Development workflow

Use one ongoing Work conversation for the v3.0 cycle, with successive assignments. The repository carries source, evidence, results and decisions between conversations.

## Each assignment

1. Inspect `git status`, fetch remote state and inspect branches/latest release. Read current project documents.
2. Create a feature branch for substantial physics work. Keep hypotheses/source extraction separate from accepted calibrated inputs.
3. Implement a coherent milestone and its meaningful tests. Avoid expanding research beyond evidence needed for the decision.
4. Run `npm run check`, inspect the test report and numerical changes. A passing regression may intentionally preserve a known scientific failure.
5. Update README status, decisions, limitations, current results and next priorities.
6. Commit with a concrete message. Push the tested commit; verify remote state. Use a PR for reviewable experimental work.
7. Create a tagged GitHub release only for a completed stable milestone. Do not use a v3.0 tag for this import.

## Commands

- `npm test`: run all Node regression scripts, including the current standalone build checks.
- `npm run build`: generate `dist/model.html` from the frozen v2.5 UI template with current engine/data and the package research-version label.
- `npm run validate`: test and regenerate `validation/current/`, baseline differences and `docs/CURRENT_VALIDATION.md`.
- `npm run check`: verify frozen import integrity, build and validate.

GitHub Actions runs the same check on pushes and pull requests. It uploads the current test results and standalone HTML as artifacts. Documentation changes remain a development responsibility; CI does not auto-commit to main.

Frozen outputs in `validation/baseline/` are versioned reference records. Current output files are generated from active code. Do not refresh frozen expectations to conceal a regression. Numeric differences identify changed calculations; they do not by themselves establish scientific improvement.

No npm dependencies or Python are needed for routine Node checks. Older Python research/build/plot/browser tools remain in the frozen import for provenance.
