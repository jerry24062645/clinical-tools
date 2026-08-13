# clinical-tools v6.3

- `index.html`: Clinical Tools landing page.
- `emr_lab_bookmarklet.html`: primary Auto Clinical Lab bookmarklet installer.
- `bookmarklet_source.js`: readable source used to generate the bookmarklet URL.
- `emr_lab_formatter.html`: manual / backup formatter.

## v6.3 changes

- Fixes blank-result false reads by mapping each row to the visible `檢驗值` column using screen geometry; blank result cells are ignored.
- Uses a new v6.3 session cache key so bad values cached by v6 are not carried forward.
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


## v6.3 修正
- 檢驗表格改用邏輯欄位位置，不再依畫面 x 座標猜欄位。
- 「診療項目」與「細項名稱」雙重核對；兩者若指向不同檢驗則跳過。
- HbA1c / eAG / Glu-AC / Glu-PC 加入合理數值範圍檢查，日期、診療碼、收件/完報文字不會被當成檢驗值。
- 使用新的 v6.3 session cache，避免舊版誤抓資料殘留。

- v6.3: recognizes `Microalbumin/Cr urine ratio` as UACR; decimal `Ratio` values are converted to `mg/g`.
