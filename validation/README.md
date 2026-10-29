# Validation records

- `baseline/`: frozen imported diagnostic JSON and the setup numerical snapshot.
- `diagnostics/`: inherited audit modules with paths adjusted to this repository layout. Scientific behavior is unchanged.
- `current/`: regenerated script outcomes, numerical diagnostics, pointwise numerical differences and build metadata.
- `../docs/CURRENT_VALIDATION.md`: compact generated report.

Use `npm run validate`. Diagnostic `--write` options are inherited research utilities and may overwrite their mapped output snapshots; do not use them to refresh frozen baselines. Use the central validation command for current records instead.

Tests cover physics invariants, Greg arithmetic, regression expectations, source caveats and static HTML. Known scientific misses are deliberately tested and retained. This is not independent historical certification or completed 5:1 scoring.
