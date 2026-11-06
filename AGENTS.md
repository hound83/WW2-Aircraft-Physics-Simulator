# Coding-agent instructions — European Air War Physics

These instructions apply to `hound83/WW2-Aircraft-Physics-Simulator`, the **scientific flight model**, not the Atlas website. The current user request determines the release objective and limits.

## Mission and substantial milestones

- Aim for a usable, physically consistent and historically evidence-bounded shared solver covering the **four benchmark aircraft/configurations identified by the current repository**. Preserve meaningful differences between aircraft; do not tune them into artificially identical behavior.
- A substantial implementation assignment owns one **substantial end-to-end scientific milestone**: source diagnosis where needed, a bounded model candidate, integration, fair validation, regression and browser checks, and concise evidence-backed reporting. Do not stop after a small audit if the approved objective also calls for a tested improvement. Keep explicitly narrow requests narrow.
- Agree the user-visible/scientific outcome, relevant baseline, non-goals and reasonable acceptance gates. When exact error thresholds are unknown, derive provisional tolerances from source quality and report them as judgments. A target like **5:1 discrimination** is not automatically a 5% historical-residual tolerance or proof that every matchup is supported.
- Make routine technical decisions autonomously and finish necessary in-scope steps without another "GO". Do not invent evidence, add new aircraft, rewrite unrelated architecture, or widen research indefinitely. Stop for a material decision, permission blocker, or environment limit; leave an exact checkpoint when interrupted.
- For standalone source-research requests, follow relevant archival leads as long as they improve the assigned investigation, retain original citations and uncertainty, and return to the core question. This does not authorize unrequested model changes.

## Current sources of truth

- Inspect git status, remote refs/PRs when available, `README.md` and the task-relevant portions of `docs/DECISIONS.md`, `docs/NEXT_STEPS.md`, `docs/CURRENT_VALIDATION.md`, `docs/KNOWN_LIMITATIONS.md`, `docs/WORKFLOW.md` and source registers under `references/`. Current branch outputs and evidence supersede historical descriptions in old release notes.
- One shared physical solver lives in `src/` with aircraft/configuration-specific source-bounded inputs under `aircraft/`. Preserve frozen import/baseline records and Greg's original numerical material. Never modify old snapshots or test expectations merely to erase unfavorable results.
- Never modify `hound83/ww2-airwar` without an explicit cross-repository task. Pin and audit an accepted physics release before Atlas integration.

## Physics and evidence integrity

- Separate historical observation, digitized/transcribed source, derived quantity, interpolation, engineering assumption, fitted training point, reserved/independent check, Greg arithmetic, and IL-2/DCS comparison. Game simulations can corroborate behavior but are not independent primary historical truth.
- Match aircraft variant, mass, installation/configuration, engine rating, RPM, gear, altitude, atmosphere and speed definition before treating a residual as valid evidence. Keep shaft power, propulsive power and thrust distinct; use aircraft-specific IAS→CAS calibration and preserve CAS/EAS/TAS differences without double correction or unjustified stall extrapolation.
- Derive CLmax only from matched, corrected stall EAS, actual weight, wing area and configuration; mark inferred bounds as such. Keep provisional lift or drag transfers inside their supported source envelope. Preserve documented sensitivity analyses and unresolved source disputes; never present diagnostic scenarios or uncertain transcriptions as accepted historical facts.
- Evaluate speed, climb, stall and turn behavior **throughout relevant flight envelopes**, not just on chosen fit points. Use withheld conditions or independent sources, fair comparisons against the previous model, sensitivity/alternate splits and physically plausible parameter limits. Never tune on withheld points then call them independent.
- Report absolute residuals, altitude/configuration bands, negative regressions, and supported pairwise aircraft differences. Mark unsupported matchups and the 5:1 criterion unresolved rather than manufacturing a passing score.

## Implement, validate and test

1. Freeze a reproducible before-scorecard and identify which observations are fit, reserved, or diagnostic only.
2. Test a physics-motivated bounded candidate in the **shared solver**. Reject artificial variant fudge factors and improvements that sacrifice other aircraft without an explicit, evidenced tradeoff.
3. Run `npm run check`; inspect numerical reports and test differences, not only exit code. Run `npm run test:browser` after the build where available and relevant. Keep expected regression changes explicit and justified.
4. Check that the real interactive app exposes the accepted model and sensible states; repeat the four-aircraft scorecard, not just the one aircraft being tuned.
5. Preserve source hashes, failed candidates, uncertainties and known unsupported regions. Update relevant decisions, current validation, limitations and next steps with meaningful accepted changes.

Passing CI proves reproducibility of the checked behavior, **not** that its historical accuracy has been established. Do not claim a major version, real-world validation or a stable release without its documented scientific acceptance evidence.

## Git, autonomous merge, scientific release and delivery

- Use a feature branch and reviewable PR for substantial or experimental work. Keep `main` runnable, frozen import intact and previous tags recoverable. No force-push, hidden baseline changes or unvalidated stable release.
- **Standing owner authorization:** for an authorized implementation milestone, **autonomously merge the PR** when the scoped scientific acceptance checks and engineering release gates are verified. No separate GO is needed for routine in-scope completion. Do not treat an evidence-gathering-only task as authorization to change the solver.
- **Merge gates:** the four-aircraft scorecard, fit/held-out separation and uncertainty are reported; `npm run check` and applicable browser checks pass; source provenance, protected baselines, observed regressions and model plausibility have been reviewed; required GitHub CI checks pass on the exact PR revision; no unresolved **milestone-blocking** scientific or technical defect or unauthorized assumption change remains. Preserve a recoverable earlier commit and respect branch protection/reviews/permissions.
- **Stable release/publication gate is stricter than merge:** an accepted engineering or research milestone may merge without proving complete real-world historical accuracy. Only tag, publish or describe a **validated/stable flight-model release** when the separately documented historical accuracy and 5:1 evidence requirements are actually met for the claimed scope. Otherwise publish only the accurately labelled research/beta artifacts that the established workflow already generates; never invent a production deployment.
- After merging, verify the resulting main-branch CI run and accessible generated simulation artifact. For a stable release, additionally verify the actual tag, release artifacts and user-facing access path. If checks, approvals or evidence are unavailable, leave the PR ready and report exactly why merge or stable publication is blocked. Never bypass protections or change a frozen baseline to pass the gate.
- Use focused source retrieval and existing indexes rather than repeated broad searches or huge handover archives. If source research reveals relevant side evidence, record its provenance, then return to the assigned milestone.
- Report in compact form: accepted model change, **before/after per-aircraft metrics**, regressions, independent validation status, actual test/browser results, PR/merge/artifact status and unresolved source gaps. Do not present a merged research change as a validated flight-model release.

