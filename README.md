# Auto Clinical Lab v6.8.6

## 本版修正
- 修正 QCheck / InBody OCR 已完成，但上方 summary 灰框仍空白。
- OCR 成功後改用強制 refresh，無論目前 HIS 是否有 active report body，都直接顯示截圖結果。
- `storeInBodyOCR()` 正式使用報告右上角日期參數。
- QCheck 日期：`2026/08/11` → `115/08/11`。
- 調整 QCheck 固定版型裁切區，降低 BMI / SMM / 骨骼肌量互相誤讀。
- Body composition 格式維持：
  `• Body composition: BW 61.6 kg; BMI 24.1 kg/m²; BMR 1174 kcal; PBF 37.1%; BFM 22.9 kg; SMM 36.5 kg; VFA 6`
- EKG OCR 成功後也同樣強制刷新 summary。
- Online / Offline 完全同步。

## GitHub 更新
將 `online/` 內同名檔案直接覆蓋到 `clinical-tools`。
更新後請刪除舊 Auto Clinical Lab 書籤，再從新版安裝頁重新拖曳。
