# Bf 109 F-4 stall evidence audit

This bounded audit did not establish a verified original F-4 stall observation or measured CLmax. The existing 154-171 km/h IAS range and 2,890 kg standard weight remain simulator evidence. They do not establish historical stall EAS or instantaneous test weight.

| Candidate | Inspection and limit |
|---|---|
| [D.(Luft)T.2109 catalog](https://www.museumalkmaar40-45.nl/voorschriften-manuals/d-luftt/d-luftt-2109) | Lists F-1 to F-4 handbook parts. Catalog inspected; original stall/loading pages unavailable. |
| [May 1941 handbook attachment listing](https://ww2aircraft.net/forum/threads/me-109-engine-swaps.36408/) | Attachment filename visible; document contents and F-4 applicability not verified. |
| [US Bf 109F evaluation PDF](https://stephentaylorhistorian.com/wp-content/uploads/2020/04/bf-109f-evaluation.pdf) | Eight-page candidate discovered; no readable text or visual inspection. No values accepted from snippets. |
| [Spanish Trop adaptation](https://www.patrulla-azul.com/descargas/Manual_Bf_109_Trop.pdf) | Text read. F-4 title conflicts with DB 605 A-1 on page 3; provenance unresolved. Excluded from target calibration. |
| [IL-2 developer specification](https://forum.il2sturmovik.com/applications/core/interface/file/attachment.php?id=39971) | Simulation source; retained separately. |

The machine-readable [audit](../references/bf109f4-stall-audit.json) records these access limits and missing conditions. No original scan verification is claimed for this milestone.

The executable gate now rejects two matching unknown/unspecified specimen identities. F-4 evidence also requires a documented slat state; IAS calibration must match that state. This closes acceptance loopholes even if other metadata is supplied. Synthetic tests demonstrate both acceptance with complete conditions and rejection for missing slat evidence, conflicting calibration, F-2 identity and simulation provenance. They are not historical fixtures.

Default CLmax 1.5, weight 6,371 lb and all numerical predictions remain unchanged. Reopen numerical calibration only with an original F-4 observation establishing specimen, clean one-g power-off configuration/slat state, instantaneous weight/altitude and matched near-stall airspeed correction. Power-off to powered-turn transfer remains unverified.
