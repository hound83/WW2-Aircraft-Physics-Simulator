# Next steps

## Completed cohesive milestone: four-aircraft stall evidence review

Use [the consolidated review](FOUR_AIRCRAFT_STALL_REVIEW.md) as the entry point, with [machine-readable readiness](../validation/current/stall-readiness.json) and [validation](CURRENT_VALIDATION.md). It includes the executable gate, sensitivity comparisons, P-51 installation audit, original P-47B observation/loading audit, bounded F-4 review and Spitfire clipped-wing/stores correction.

No target has a complete corrected historical stall chain. No default coefficient changed and no 5:1 claim is justified. These are completed evidence-review tasks with explicit blockers, not a validated v3.0 release. One cumulative PR against main supersedes the four small stacked PRs; their branches/commits preserve the intermediate history.

## Next cohesive milestone: matched-condition speed and climb validation

Build one four-aircraft validation package that classifies fit versus withheld points, verifies source condition/weight/rating/airspeed compatibility, and reports signed/absolute residuals with explicit exclusions and pairwise uncertainty requirements. Reuse the existing solver and source registers. Fix only supported implementation defects and quantify every numerical change. Complete tests, source/decision updates and one reviewable PR without repeated approval requests for routine substeps.

Acceptance: all four target aircraft represented; IAS/EAS/TAS and loading mismatches cannot be scored silently; known Mustang climb and controlled P-47 power cases remain visible; npm run check passes; no imported/frozen fixture rewritten; unresolved historical uncertainty remains unresolved. Stop with that complete validation deliverable.

Do not repeat the blocked stall searches as standalone milestones. Reopen them only with new matched original evidence. The Spitfire BF.274 A&AEE/692,m third-part citation is retained as a specific unverified retrieval lead. Keep Atlas changes, additional aircraft, propeller OCR correction and UI redesign outside this next milestone.
