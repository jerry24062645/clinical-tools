# clinical-tools v6

- `index.html`: Clinical Tools landing page.
- `emr_lab_bookmarklet.html`: primary Auto Clinical Lab bookmarklet installer.
- `bookmarklet_source.js`: readable source used to generate the bookmarklet URL.
- `emr_lab_formatter.html`: manual / backup formatter.

## v6 changes

- Keeps v5 AUTO detection for `OPD`, `ER`, and `Inpatient`.
- Automatically prefixes numeric results with `H` / `L` when outside the report's normal reference range.
- Adds 75 g OGTT 2-hour glucose recognition and outputs `Glu-PC 2h`.
- Keeps UACR / UPCR output in `mg/g`.
- Adds PAC / PRA / ARR parsing; PAC >15 ng/dL and ARR >20 ng/dL/(ng/mL/hr) are flagged `H` when the report does not provide a usable reference range.
- `Clear cache` now stays blank on the same page instead of immediately re-importing the same visible labs. Automatic capture resumes after the source page data changes.
- Culture remains cursor/click-context bound.
- Surgical Pathology now uses the same cursor/click focus concept because the final report must be opened before its content can be read.
- ER / Inpatient output remains grouped by date; duplicate rows remain collapsed.

## Culture / Surgical Pathology workflow

1. Move the cursor onto the intended Culture or Surgical Pathology row (or click it).
2. Confirm the overlay `Focus` shows the intended item.
3. Open the final result.
4. The visible final-result content is attached only to the active focus.

This is intended to reduce accidental pairing when multiple cultures or pathology reports are present on the same page.
