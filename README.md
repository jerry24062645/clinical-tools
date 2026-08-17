# Auto Clinical Lab v6.8.3

## 本版修正
- EKG OCR 改為原圖 + 上方報告區原色 + 上方報告區二值化，共三份 OCR 結果合併。
- EKG 日期以報告本身印出的西元日期為主，再換算民國年。
- `2026/8/17` → `115/08/17`。
- 加強 Rate / PR / QRS / QT / QTc。
- 加強 Sinus rhythm、Ventricular premature complex、Abnormal R-wave progression、Borderline ST elevation、Baseline wander。
- Online / Offline 完全同步。
- 保留 v6.8.2 既有功能。

### 本張 EKG 預期摘要
`115/08/17`
`• EKG: HR 65 bpm; PR 187 ms; QRS 92 ms; QT 420 ms; QTc 437 ms; Sinus rhythm; Ventricular premature complex; Abnormal R-wave progression, early transition; Borderline ST elevation, anterolateral leads; Baseline wander`

## GitHub 更新
將 `online/` 內同名檔案覆蓋到 `clinical-tools`，並重新安裝 Auto Clinical Lab 書籤。
