# Development workflow

The root [AGENTS.md](../AGENTS.md) defines standing instructions, scope, scientific integrity and release gates. This page records practical commands and the Git handoff workflow. No specific chat or model setting is required: continue from committed source, decisions and validation results.

## Each implementation milestone

0. **WIP and latest-insights check:** Inspect open PRs, unmerged branches, and recent research notes under `docs/research/` and `references/` that affect the planned inputs. Read `docs/LATEST_INSIGHTS.md` if present. Record the result in the task log. Incorporate relevant WIP or explicitly note why it is deferred.

1. Inspect the current branch, worktree, remote PRs and release state. Read the task-relevant project and source records.
2. Create a feature branch for substantial changes. Keep hypotheses, extracted sources and diagnostic scenarios separate from accepted calibration inputs.
3. Implement one coherent milestone with source-matched and held-out checks for all affected aircraft. Do not silently refit independent checks or discard negative results.
4. Run `npm run check` and inspect numerical differences; run `npm run test:browser` when applicable. A green regression suite does not prove historical accuracy.
5. Update the relevant decisions, limitations, scorecard and next-priority records, including unfavorable findings.
6. Commit, push and open a reviewable candidate PR. Codex verifies required CI and scientific milestone gates for the exact revision and merges when the applicable gates pass. Record the specific blocker on any candidate that needs more work.
7. Verify the merged state and accessible generated research artifact. Create a stable release/tag **only** when the stricter documented historical-validation requirements are met. Label intermediate models as research or beta, not real-world validated.

## Candidate handoff

Use one issue or draft PR per scoped candidate. Codex coordinates ownership and integrates accepted work under [AGENTS.md](../AGENTS.md#parallel-candidates-and-production-ownership). For an independently permissioned contributor, a fork and pull request keep the candidate in its own repository. A standalone handoff can use the same fields.

| Field | Record |
| --- | --- |
| Scope and owner | Aircraft, metric or files, assigned agent, and any intentional independent review |
| Baseline | Base commit, simulator and input-pack versions, and related open candidates |
| Evidence | Source links and page/table or figure, aircraft/serial, loading, configuration, rating, original readings and units |
| Proposed changes | Stable record IDs for corrections, new observations, or a focused patch |
| Calculations and checks | Formulas, inputs, assumptions, uncertainty, fit/check role, reproducible commands and adverse results |
| Handoff | Candidate branch or commit, remaining gaps and expected integration step |

## Commands

- `npm test`: run Node regression scripts and build checks.
- `npm run build`: generate `dist/model.html` from the frozen UI template and current source.
- `npm run validate`: regenerate `validation/current/`, baseline comparisons and `docs/CURRENT_VALIDATION.md`.
- `npm run check`: verify frozen import integrity, build and validation.
- `npm run test:browser`: run the standalone browser smoke check when the environment supports it.

GitHub Actions runs the repository's regression workflow on pushes and pull requests and publishes test/build artifacts. It does not commit generated documents into `main`.

Frozen files in `validation/baseline/` and `references/import/` are provenance, not calibration knobs. Preserve them. Explain any intentional changes to current generated outputs, and do not treat a passing numerical diff as proof of scientific improvement.

Older Python research and plotting tools are retained for provenance; routine checks use Node.
