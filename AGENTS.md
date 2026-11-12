# Coding-agent instructions — European Air War Physics

These instructions apply to `hound83/WW2-Aircraft-Physics-Simulator`, the **scientific flight model**, not the Atlas website. The current user request determines the release objective and limits.

## Assignment checklist and recovery

- Before starting a new repository assignment, save a temporary Markdown task log. Turn the prompt into a `- [ ]` checklist with one item per requested outcome. Capture the constraints, acceptance checks, and delivery steps needed to reconstruct the assignment. Record the repository and starting branch or commit when known. Update the same log when the user changes the scope.
- Keep the log private and outside the Git checkout. Use a location that survives a new chat or checkout. In ChatGPT Work, use the user's Library when available. Otherwise use a persistent `codex-task-logs/` folder. Name the file `task-log--<owner>--<repo>--<UTC-timestamp>--<short-task>.md`. For cross-repository work, use `multi-repo` in the filename and list the repositories in the log. Share the link or path at the start and in the final reply. If only transient storage is available, save there and state the recovery limitation. Omit credentials and unnecessary personal details.
- Mark each item `- [x]` once its outcome is verified. Add brief evidence such as a file path, test result, commit, PR, or verified live link. Save the log at each meaningful checkpoint with the current branch, commit, or worktree location as applicable. Keep open items unchecked and record any blocker and the next concrete action.
- When resuming, open the existing log and verify the checkpoint against the current repository state. Before the final reply, reconcile the checklist with the latest request. Record `Done` when all requested outcomes are verified, or `In progress` or `Blocked` with the remaining work. Leave the log available for the user's review.


- **Pre-assignment WIP and latest-insights check:** Before starting a new implementation milestone, inspect open PRs, unmerged feature branches, and recent commits under `docs/research/` and `references/` for work that touches the same aircraft, subsystem, or validation path. Also read `docs/LATEST_INSIGHTS.md` (or the top of `docs/NEXT_STEPS.md`) if it exists. Record the scan result in the task log. If relevant in-progress material exists, either incorporate it or state why the milestone proceeds without it. Do not begin from a private chat history when committed or open work already covers the same ground.

## Mission and substantial milestones

- Aim for a usable, physically consistent and historically evidence-bounded shared solver covering the **four benchmark aircraft/configurations identified by the current repository**. Preserve meaningful differences between aircraft; do not tune them into artificially identical behavior.
- A substantial implementation assignment owns one **substantial end-to-end scientific milestone**: source diagnosis where needed, a bounded model candidate, integration, fair validation, regression and browser checks, and concise evidence-backed reporting. Do not stop after a small audit if the approved objective also calls for a tested improvement. Keep explicitly narrow requests narrow.
- Agree the user-visible/scientific outcome, relevant baseline, non-goals and reasonable acceptance gates. When exact error thresholds are unknown, derive provisional tolerances from source quality and report them as judgments. A target like **5:1 discrimination** is not automatically a 5% historical-residual tolerance or proof that every matchup is supported.
- Make routine technical decisions autonomously and finish necessary in-scope steps without another "GO". Do not invent evidence, add new aircraft, rewrite unrelated architecture, or widen research indefinitely. Stop for a material decision, permission blocker, or environment limit; leave an exact checkpoint when interrupted.
- For standalone source-research requests, follow relevant archival leads as long as they improve the assigned investigation, retain original citations and uncertainty, and return to the core question. This does not authorize unrequested model changes.

## Current sources of truth

- Inspect git status, remote refs/PRs when available, `README.md` and the task-relevant portions of `docs/DECISIONS.md`, `docs/NEXT_STEPS.md`, `docs/CURRENT_VALIDATION.md`, `docs/KNOWN_LIMITATIONS.md`, `docs/WORKFLOW.md` and source registers under `references/`. Current branch outputs and evidence supersede historical descriptions in old release notes.
- The [simulator data handoff](docs/SIMULATOR_DATA_HANDOFF.md) summarizes the current data pack, modeled roster and suggested aircraft candidates.
- One shared physical solver lives in `src/` with aircraft/configuration-specific source-bounded inputs under `aircraft/`. Preserve frozen import/baseline records and Greg's original numerical material. Never modify old snapshots or test expectations merely to erase unfavorable results.
- Never modify `hound83/ww2-airwar` without an explicit cross-repository task. Pin and audit an accepted physics release before Atlas integration.

## Physics and evidence integrity

- Separate historical observation, digitized/transcribed source, derived quantity, interpolation, engineering assumption, fitted training point, reserved/independent check, Greg arithmetic, and IL-2/DCS comparison. Game simulations can corroborate behavior but are not independent primary historical truth.
- Match aircraft variant, mass, installation/configuration, engine rating, RPM, gear, altitude, atmosphere and speed definition before treating a residual as valid evidence. Keep shaft power, propulsive power and thrust distinct; use aircraft-specific IAS→CAS calibration and preserve CAS/EAS/TAS differences without double correction or unjustified stall extrapolation.
- Derive CLmax only from matched, corrected stall EAS, actual weight, wing area and configuration; mark inferred bounds as such. Keep provisional lift or drag transfers inside their supported source envelope. Preserve documented sensitivity analyses and unresolved source disputes; never present diagnostic scenarios or uncertain transcriptions as accepted historical facts.
- Evaluate speed, climb, stall and turn behavior **throughout relevant flight envelopes**, not just on chosen fit points. Use withheld conditions or independent sources, fair comparisons against the previous model, sensitivity/alternate splits and physically plausible parameter limits. Never tune on withheld points then call them independent.
- Report absolute residuals, altitude/configuration bands, negative regressions, and supported pairwise aircraft differences. Mark unsupported matchups and the 5:1 criterion unresolved rather than manufacturing a passing score.
- **Capture research on GitHub:** commit all relevant findings from each source investigation, including unused but potentially valuable measurements, matched test conditions, source IDs/links/pages, original vs derived values, uncertainty, disagreements, useful failed leads and unresolved gaps. Use the existing `references/` source registers and appropriate `docs/` records; prefer compact CSV/TSV/JSON for numeric observations and concise Markdown for conclusions. Summarize large investigations while retaining enough evidence to reproduce or reuse their results. Link to archival scans/PDFs instead of committing bulky copies, page dumps or duplicate research bundles; never overwrite frozen imported originals.

## Implement, validate and test

1. Freeze a reproducible before-scorecard and identify which observations are fit, reserved, or diagnostic only.
2. Test a physics-motivated bounded candidate in the **shared solver**. Reject artificial variant fudge factors and improvements that sacrifice other aircraft without an explicit, evidenced tradeoff.
3. Run `npm run check`; inspect numerical reports and test differences, not only exit code. Run `npm run test:browser` after the build where available and relevant. Keep expected regression changes explicit and justified.
4. Check that the real interactive app exposes the accepted model and sensible states; repeat the four-aircraft scorecard, not just the one aircraft being tuned.
5. Preserve source hashes, failed candidates, uncertainties and known unsupported regions. Update relevant decisions, current validation, limitations and next steps with meaningful accepted changes.

Passing CI proves reproducibility of the checked behavior, **not** that its historical accuracy has been established. Do not claim a major version, real-world validation or a stable release without its documented scientific acceptance evidence.

## Parallel candidates and production ownership

- **Codex leads integration and production.** Codex owns the accepted state of `main` and the latest verified simulator publication on behalf of the repository owner. Record the simulator version, input-pack version, release commit and verification link when production changes.
- **Codex and Grok can work in parallel.** Either can discover sources, extract or append observations, audit results, calculate derived values, and propose model or data changes. Use a dedicated candidate branch or fork for each scoped change. A contributor working through chat can hand off a standalone evidence file or patch. Grok hands off at the candidate PR or review stage.
- **Coordinate through GitHub.** Put the owner, scope, base commit, input-pack version and expected deliverable in the issue or draft PR before work overlaps. Include affected aircraft, metrics or paths. Give overlapping changes one integration owner and mark any duplicate effort as independent review. Use GitHub and its checks for the normal handoff and verification.
- **Keep the evidence reproducible.** Preserve original values, units, source location, airframe and test conditions. Identify existing records by stable ID when proposing corrections. For calculations, record the formula, cited inputs, assumptions, uncertainty and the result. State fit, reserved or independent status and include unfavorable results.
- **Integrate one candidate at a time.** Codex compares candidates against current `main`, resolves conflicts and duplicate observations, regenerates shared data outputs, and verifies applicable source, regression and CI checks on the revision to merge. Codex merges accepted candidates and owns release and live artifact verification under the gates below. [Candidate handoff](docs/WORKFLOW.md#candidate-handoff)

## Challenge and joint review role

- Grok’s standing role includes constructive challenge of proposed model changes, added complexity, or data that does not improve usable 1v1 comparisons.
- When Grok believes a candidate does not meaningfully improve the simulator’s pragmatic insight, adds unsupported complexity, or that a simpler evidence-bounded approach exists, Grok must:
  1. Explain the concern clearly (what is weak, over-fitted, or lower-value), and
  2. Propose a concrete alternative or simplification when one is available.
- The concern triggers a short joint review (Codex + Grok, or user + both) before the candidate is accepted into the shared solver. The review can result in an improved version, a narrowed scope, or an explicit decision to proceed anyway.
- Adding well-sourced performance observations remains desirable even when their immediate model impact is unclear, provided they stay applicable to the overall goal (energy maneuvers, climb, turn, acceleration with similar pilots and starting conditions). Such data should be committed to the references or research notes with clear provenance rather than blocked.
- Codex remains the integrator of the verified production solver. The joint review exists to raise quality and keep the model pragmatic, not to create a veto.

## Git, autonomous merge, scientific release and delivery

- Use a feature branch and reviewable PR for substantial or experimental work. Keep `main` runnable, frozen import intact and previous tags recoverable. No force-push, hidden baseline changes or unvalidated stable release.
- For source-research-only documentation PRs, verify recorded facts, citations, source identity, data-format consistency and required repository CI before Codex merges. They do not require new model scoring or a stable-release gate when no solver, validation inputs or generated behavior changes; merging such a PR is not a scientific release.
- **Standing owner authorization:** for an authorized implementation milestone, **Codex autonomously merges the PR** when the scoped scientific acceptance checks and engineering release gates are verified. No separate GO is needed for routine in-scope completion. Do not treat an evidence-gathering-only task as authorization to change the solver.
- **Merge gates:** the four-aircraft scorecard, fit/held-out separation and uncertainty are reported; `npm run check` and applicable browser checks pass; source provenance, protected baselines, observed regressions and model plausibility have been reviewed; required GitHub CI checks pass on the exact PR revision; no unresolved **milestone-blocking** scientific or technical defect or unauthorized assumption change remains. Preserve a recoverable earlier commit and respect branch protection/reviews/permissions.
- **Stable release/publication gate is stricter than merge:** an accepted engineering or research milestone may merge without proving complete real-world historical accuracy. Only tag, publish or describe a **validated/stable flight-model release** when the separately documented historical accuracy and 5:1 evidence requirements are actually met for the claimed scope. Otherwise publish only the accurately labelled research/beta artifacts that the established workflow already generates; never invent a production deployment.
- After merging, verify the resulting main-branch CI run and accessible generated simulation artifact. For a stable release, additionally verify the actual tag, release artifacts and user-facing access path. If checks, approvals or evidence are unavailable, leave the PR ready and report exactly why merge or stable publication is blocked. Never bypass protections or change a frozen baseline to pass the gate.
- Use focused source retrieval and existing indexes rather than repeated broad searches or huge handover archives. If source research reveals relevant side evidence, record its provenance, then return to the assigned milestone.
- Report in compact form: accepted model change, **before/after per-aircraft metrics**, regressions, independent validation status, actual test/browser results, PR/merge/artifact status and unresolved source gaps. Do not present a merged research change as a validated flight-model release.
