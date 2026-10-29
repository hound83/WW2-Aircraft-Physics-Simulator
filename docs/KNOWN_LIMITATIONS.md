# Known limitations

- **v3.0 is not built or historically validated.** Passing tests preserve behavior and evidence guardrails.
- No verified, aircraft-matched low-speed IAS-to-CAS correction currently supports a precise clean historical CLmax for any of the four benchmark aircraft. Sensitivity offsets are hypothetical, not measurements.
- P-51B at 2,200 ft: candidate C predicts about 3,401 and 3,979 ft/min versus reported 3,820 and 4,380, a deficit of approximately 419 and 401 ft/min. Reported climb airspeed is missing; do not silently treat optimized model speed as matched.
- Bf 109 F-4's optional/default UI scenario is conditioned on IL-2 turn specifications. It is not an independently measured historical polar.
- P-47C source run 20-1 is still 0.799 in the frozen OCR fixture; the newer handover reports 0.779 from the actual scan. The source audit and its passing coefficient-consistency assertion do not verify that OCR. Resolve the complete Table I row before changing the active reference.
- Candidate C does not reproduce the P-47C measured power-loading efficiency loss. NACA chart transfers are research options with blade-family and Cp-domain limits.
- P-47 2,600 hp remains a controlled case, not a verified P-47B rating.
- The 5:1 aircraft discrimination target is unresolved until matched historical observations and a defensible differential-error budget exist.
- The build has static JavaScript/data checks. Preserved Playwright browser tests have not been rerun in this environment.
- Two large scans and nine nested archives are excluded from Git. The per-file manifest lists their exact identity and recovery paths. Links are preserved evidence pointers; their live availability was not rechecked during setup.

See [the full inherited limitations](KNOWN_LIMITATIONS_LEGACY.md) and [stall gate](STALL_WEIGHT_GATE.md).
