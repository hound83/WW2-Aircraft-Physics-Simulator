# What has improved so far

Assessment at research v2.7.0, 30 October 2026.

**No demonstrated improvement in the default historical performance predictions yet.** All 3,628 existing baseline values remain unchanged. Historical stall calibration and 5:1 comparative accuracy remain unresolved. The work has materially improved source correctness, input traceability and the ability to detect invalid comparisons.

| Area | Starting point | Current result | Meaning |
|---|---|---|---|
| Historical accuracy | Provisional model with known Mustang climb shortfall | Default values unchanged; shortfall retained | No accuracy gain claimed |
| Performance comparisons | Existing checkpoints mixed fitted and unmatched conditions | 69 records expose conditions, native-unit errors, fit/dependence roles and exclusions | Makes misleading accuracy scores harder to produce |
| P-47B stall provenance | Generic manual figure dominated the register | Specimen-specific 105 mph IAS report retained, with loading/calibration limits | Better evidence; still no corrected stall EAS/CLmax |
| Spitfire stall provenance | Wing/loading figures described too loosely | Clipped-wing and drop-tank applicability corrected | Prevents applying the wrong conditions to BS.543 |
| Stall/correction safeguards | Several source-transfer assumptions required manual review | Variant/specimen, slat/configuration, pressure-installation and correction-convention checks | Rejects mismatched and double-corrected evidence |
| Mustang climb diagnosis | Cause of roughly 400 ft/min shortfall unclear | About 114-119 useful hp quantified under original assumptions; positive added cooling drag has the wrong sign | Narrows specific explanations without inventing a correction |
| Original-chart reconstruction | Weight/power curves lacked usable coordinates | Five weight and five power brackets tied to native pixels and scan hashes | Reproducible sparse source readings; not uncertainty bounds |
| Propeller candidates | Generic alternatives could look better on one metric | Coupled speed-anchor/Figure 5/climb tests show D/N/M worsen sampled climb after reanchoring | Rejects an unsupported default replacement |
| Source-chart input mode | Level-flight/ram proxy stops before some readable climb-chart states | Explicit exact-node calculations at 8,000 and 12,000 ft, with required scenario/polar/provenance | Better diagnostic coverage, not verified historical predictions |
| Reproducibility | Initial assignment baseline passed 31 scripts | Current suite and CI check the accumulated changes; see current validation | More meaningful guardrails, not an accuracy score |

The new mode does not make the default climb numbers better. At 4,000 ft it uses lower chart BHP than the old proxy, which lowers predicted climb. At 2,200 ft the chart midpoint still underpredicts the report. See the [numerical before/after table](SOURCE_CHART_CLIMB_MODE.md).

Candidate propeller profiles reduced the Figure 5 diagnostic BHP mean absolute residual from about 64 to 50-54, but moved the speed anchor unless the polar was changed, and worsened sampled climb after that reanchor. That isolated diagnostic improvement was therefore not adopted as a physical accuracy improvement.

The next meaningful numerical improvement needs independently supported power, drag or installed-propeller inputs. More passing tests cannot supply those missing measurements. [Current validation](CURRENT_VALIDATION.md) and [release notes](../releases/v2.7.0.md) separate completed engineering work from the unresolved scientific goal.
