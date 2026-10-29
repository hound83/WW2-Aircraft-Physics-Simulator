# Next steps

## Setup completion

The local repository is prepared first. Publish it to the empty GitHub repository when that repository and authentication are available. Confirm the remote main commit and CI result before treating GitHub setup as complete. See [REMOTE_SETUP.md](REMOTE_SETUP.md).

## Next assignment: stall/weight/calibration gate

1. Start from latest remote state and a feature branch such as `physics/stall-calibration`.
2. Read current evidence and `references/stall_evidence_register.csv`. Seek only the missing matched low-speed calibration, actual stall weight and configuration data.
3. Keep unmatched variants, shutters, slats and takeoff/stall weights separate. If no defensible correction is found, preserve explicit bounds rather than invent corrected EAS or CLmax.
4. Audit the original NACA L4L07 Table I row 20-1 before using the claimed 0.779 correction. Correct active evidence separately from frozen v2.5 fixtures.
5. Implement supported corrections in the shared engine/data, rerun checks and compare numerical results against the baseline. Record source applicability and residual changes.
6. Update documentation, commit and push a meaningful milestone.

## Following assignments

- Improve CLmax and lift-/power-limited turns using the same solver, with structural G limits and explicit instantaneous/sustained distinction.
- Complete four-aircraft speed/climb/stall/turn validation, Greg and P-47 propeller fixtures, matched-condition differential errors and 5:1 scoring.
- Release v3.0 only when the acceptance report identifies measured passes, failures and unresolved cases honestly. An unresolved scientific gate must remain visible.

## Fresh-conversation prompt

Continue European Air War Physics from `hound83/WW2-Aircraft-Physics-Simulator`. Read README.md, AGENTS.md, docs/DECISIONS.md, docs/NEXT_STEPS.md, docs/KNOWN_LIMITATIONS.md and docs/CURRENT_VALIDATION.md. Inspect current branches/tags and run npm run check. Continue the next documented milestone, preserving the frozen v2.5 import and scientific evidence distinctions. Do not modify the Atlas repository.
