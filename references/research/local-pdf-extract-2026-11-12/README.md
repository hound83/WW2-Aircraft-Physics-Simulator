# Local PDF extraction

Grok indexed 247 archive files and recorded 5,801 candidate entries. The original GitHub handoff at `99edb9fd` included the inventory, processing notes and empty family JSON files. The populated export from the same run supplies the records below. Its grade totals match the handoff. [Original handoff](https://github.com/hound83/WW2-Aircraft-Physics-Simulator/tree/99edb9fdeb8eca3011c5f4dfee427ce3157f7220/references/research/local-pdf-extract-2026-11-12)

| Family | Candidate records | JSON |
| --- | ---: | --- |
| Other | 61 | [performance_other.json](performance_other.json) |
| P-51 and Mustang | 2,660 | [performance_p-51.json](performance_p-51.json) |
| Bf 109 | 134 | [performance_bf_109.json](performance_bf_109.json) |
| Fw 190 | 424 | [performance_fw_190.json](performance_fw_190.json) |
| He 177 | 145 | [performance_he_177.json](performance_he_177.json) |
| Il-2 | 141 | [performance_il-2.json](performance_il-2.json) |
| La-7 | 61 | [performance_la-7.json](performance_la-7.json) |
| Mosquito | 65 | [performance_mosquito.json](performance_mosquito.json) |
| P-47 | 1,238 | [performance_p-47.json](performance_p-47.json) |
| Propeller reports | 603 | [performance_props.json](performance_props.json) |
| Ta 152 | 85 | [performance_ta_152.json](performance_ta_152.json) |
| XP-42 | 80 | [performance_xp-42.json](performance_xp-42.json) |
| P-38 | 104 | [performance_p-38.json](performance_p-38.json) |
| **Total** | **5,801** | |

Original extraction grades comprise 1,979 observed, 189 derived, 3,537 estimated and 96 missing entries. The candidate grade and notes travel with each row. Reviewed catalog entries carry their own source class and scope.

Each JSON array contains documents with a source filename, report title, source type and rows. Read the row column order from `row_fields` in the index. When a field has a dictionary in the document, look up the row value as a zero-based index. PDF and printed page numbers retain their original values. The index carries the original export and decoded-record hashes. The family Markdown files record the original handoff state.

[Extraction index](extraction-index.json) · [Source inventory](sources.md) · [Reviewed input release](../../../docs/research/WW2_PDF_INPUT_DATA_V1_9.md)
