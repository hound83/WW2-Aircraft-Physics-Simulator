# European Air War development instructions

## Scope and continuity

- GitHub repository `hound83/WW2-Aircraft-Physics-Simulator` is the authoritative project history.
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

## Standing scope and subscription rules for every Work run

These rules apply to **every future Work assignment and generated handover/export**, not just the current milestone. The user's objective is a meaningful, tested result within their standard approximately €20/month ChatGPT Plus allowance.

1. **Agree and obey the scope:** state the one assigned deliverable, explicit out-of-scope work, acceptance tests and stop condition at the start. Deliver the assignment instead of starting open-ended research, extra features, additional aircraft, architectural rewrites or another project's work. Log tangent discoveries for later; do not act on them now.
2. **Budget-aware execution:** default to an economical available model at Medium reasoning; read only relevant sources and files. Prefer existing source indexes, tests and earlier research over large repeated searches. Do not load or paste huge archives, entire repositories, all screenshots or lengthy test output into the chat. The agent may not know the user's remaining allowance and must not promise a precise cost.
3. **Escalate only if it matters:** recommend High reasoning in one or two sentences only when a specific difficult scientific, historical or technical blocker warrants it. The user must select a different effort level; never auto-escalate or recommend Extra High for routine work.
4. **Keep Work sessions short:** long sessions caused size errors after roughly two assignments. Use a fresh Work run for each next substantial milestone; use current GitHub commits, PRs and documented next steps for continuity rather than a growing conversation transcript.
5. **Stop with a deliverable:** record what actually changed, before/after impact, tests actually run, PR/commit link, unresolved issues and exactly one suggested next milestone. Do not claim unrun tests passed or an unmerged branch is deployed. Stop after completing the task.
6. **Handover filenames:** use descriptive, human-readable names like `Project_Component_Milestone_Handover_YYYY-MM-DD.md`, **not `ZZZ_` prefixes** (those were a temporary file-finding trick). Future handovers should be short Markdown links to GitHub and the shared Hobby research Library, not duplicate multi-gigabyte ZIP exports unless explicitly requested.

## Chat-based research and source discovery (deliberate exception)

The strict scope, stop-condition and Plus-usage rules above govern **Work execution**, not normal **Chat** discussions or deliberately assigned document/source research in Chat. Do not transfer the Work budgeting constraints into Chat handovers.

- In Chat, when asked to research historical evidence, **actively follow relevant new leads**: footnotes, bibliographies, archival catalog references, scanned reports, citations to other original documents and meaningful contradictions. Continue expanding the search while the newly found material remains relevant and has a reasonable prospect of improving the answer or source coverage. Do not impose an arbitrary document count, search-depth cap, or requirement to stop at the first answer.
- A research trail may reveal a better primary source or a necessary related question; investigate it, explain why it matters and keep the provenance clear. Preserve original dates, variants/configurations, archival identifiers, exact report pages and evidence levels where available; distinguish verified scans from secondary transcriptions or speculation.
- **Relevant cross-aircraft branching and return:** for example, while researching Bf 109 stall speeds, if a historical report references stall speeds of other relevant fighters, follow and verify those leads too. Save *all* useful original figures, test configurations, citations/page numbers, correction status, reliability and unresolved conflicts in a durable research register and/or the shared Hobby research Library. Label side discoveries so they can be reused later. Then explicitly return to the original Bf 109 investigation and complete its findings. Do not silently import other variants' values into the Bf 109 model. For the Atlas, use `research/` source ledgers; for Physics, use `references/` registers and relevant `docs/` notes. If you cannot persist a finding, report that limitation and provide a copyable, sourced register instead.
- Chat exploration need **not** produce a GitHub code change or a Work-style milestone. Its natural stopping point is when relevant leads are reasonably exhausted, no longer productive or the user redirects the inquiry.
- Keep Work different: if source research is necessary to implement an agreed Work milestone, research only what is needed for that deliverable. Record additional promising sources and return to implementation rather than expanding into a new unassigned investigation.

## Cohesive milestone authorization (30 October 2026)

- Batch related research, evidence updates, shared-solver fixes, tests and documentation into one useful end-to-end milestone. Do not require another user GO for each small audit, commit or routine step within the agreed scope.
- The current authorized deliverable is a consolidated four-aircraft stall review, including the Spitfire audit and one cumulative review PR. Preserve existing physics assumptions unless matched evidence supports a change.
- Interrupt only for a material scope/goal decision or an action that lacks authorization. Report progress while continuing routine work in the background; do not change the user's desktop view.
- The next substantial assignment should also be a complete deliverable with stated acceptance checks, rather than a sequence of permission requests for small substeps.
