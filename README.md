# clinical-tools v5

- `index.html`: Clinical Tools landing page.
- `emr_lab_bookmarklet.html`: primary Auto Clinical Lab bookmarklet installer.
- `bookmarklet_source.js`: readable source used to generate the bookmarklet URL.
- `emr_lab_formatter.html`: manual / backup formatter.

## v5 changes

- AUTO detects `OPD`, `ER`, or `Inpatient` from the current lab page, with manual override in the overlay.
- ER / Inpatient output is grouped by date.
- Expanded parsing for CBC differential, renal/electrolytes, liver tests, CRP/PCT, lactate, hs-TnT, coagulation, HbA1c/eAG, urinalysis, stool tests, ABG/VBG, and bedside glucose trends.
- Duplicate rows are collapsed by test + date + time + value.
- Culture is handled interactively: the row under the cursor / clicked row becomes the active culture context. When the final-result panel is opened, the visible `結果值` is bound only to that active culture and specimen (Blood / Urine / Tip) is cross-checked.
- Session-only cache remains in `sessionStorage`.
- Automatic age detection remains available for FIB-4.

## Culture workflow

1. Move the cursor onto the intended culture row (or click it).
2. Confirm the overlay shows the correct `Culture focus`.
3. Open the culture final result.
4. The visible result is captured and attached to that focused culture only.

This reduces the risk of pairing a blood/urine/tip culture result with the wrong culture row when multiple cultures are present.
