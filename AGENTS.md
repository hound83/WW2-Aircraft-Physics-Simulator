# European Air War development instructions

## Scope and continuity

- GitHub repository `hound83/WW2-Aircraft-Physics-Simulator` is the authoritative project history once the local setup is pushed.
- At each assignment start inspect git status, remote branches, latest commits/tags, README.md, docs/DECISIONS.md, docs/NEXT_STEPS.md and current validation results.
- Fetch remote state when connected; inspect divergence and preserve uncommitted user work. Never overwrite it or force-push.
- Continue the same Work conversation across assignments where practical. A new conversation must be able to continue from repository records alone.
- Do not modify `hound83/ww2-airwar` without explicit user permission.
- Do not make new handover ZIPs per assignment. Keep source, tests, decisions and results in Git.

## Work and commits

- Use feature branches for substantial or experimental physics changes. Keep main runnable.
- Preserve the imported baseline, Greg's original numerical material and negative tests. Do not rewrite `references/import/` or frozen baseline records to make new results pass.
- Run `npm run check`. Inspect failures and numerical differences, not only the exit code.
- Update README, decisions, known limitations, next priorities and validation records with each meaningful change.
- Commit completed, tested milestones with descriptive messages and push when authentication is available. Disclose local-only commits.
- Tag and publish major stable releases only when the milestone's documented acceptance gates are met. Never tag this setup as v3.0.
- Git tags permit source rollback. Avoid altering history or deleting prior accepted results.

## Scientific rules

- One shared physical solver with aircraft-specific source-bounded input states. No silent variant fudge factors.
- Keep shaft horsepower, propulsive horsepower and thrust separate.
- IAS needs aircraft/configuration-specific calibration; CAS, EAS and TAS are distinct. Never extrapolate a high-speed calibration to stall as verified evidence or double-correct.
- Derive measured CLmax only from matched corrected stall EAS, actual mass, wing area and configuration. Label bounded assumptions as assumptions.
- Separate historical observations, internal Greg arithmetic, fitted points, withheld observations and simulator comparisons.
- Preserve the controlled P-47 2000/2600 hp case as a sensitivity experiment; do not call 2600 hp a verified P-47B rating.
- Report absolute residuals and matched-condition pairwise differential errors. Mark unsupported 5:1 matchups unresolved.
- The imported P-47C run 20-1 OCR says 0.799; the handover reports the scan correction as 0.779. Preserve the original fixture and audit the original table before updating active evidence. Do not report its passing regression as scan verification.

## Adaptive reasoning and subscription efficiency

- User's preferred default: GPT-6.1 Sol, Medium reasoning, standard speed. The agent cannot switch these settings itself.
- Medium: routine research, extraction, coding, calculations and regression testing.
- Recommend High before complex aerodynamic calculations, conflicting historical evidence, difficult debugging or significant model-design decisions when it would materially improve accuracy or avoid wasted iterations.
- Explain briefly why Medium may be insufficient, the recommended level and the specific expected benefit.
- Extra High only for particularly difficult scientific/mathematical problems that cannot reasonably be resolved at High.
- Do not recommend an increase for routine work. Prioritize meaningful validated milestones over exhaustive research and minor releases.
