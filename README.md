# Auto Clinical Lab v6.9.0

## 新增：Total protein / A-G ratio
- 新增 Total protein (TP) 判讀。
- 同一完報日期若同時有 Albumin + Total protein，自動計算：
  `A/G ratio = Albumin / (Total protein - Albumin)`
- 任一項缺少時，不顯示 A/G ratio。

## 新增：Cockcroft-Gault CrCl
- Age 自動讀取 HIS 的 `(xx歲)`。
- Sex 自動讀取：`男 = Male`、`女 = Female`。
- 體重由 Auto Clinical Lab 視窗中的 `Cockcroft-Gault BW` 手動輸入，單位 kg。
- 公式：
  `CrCl = (140 - age) × weight × (0.85 if female) / (72 × Cr)`
- 使用同日期 Serum Cr (mg/dL)。
- CrCl 直接顯示在 eGFR 後方：
  `• BUN 18/Cr 1.2/eGFR 62.5/CrCl 58.4 mL/min`
- Age / Sex / BW / Cr 任一缺少時不顯示 CrCl。
- BW 僅保留於目前開啟的 Auto Clinical Lab 視窗，不會混入下一位病人。

## 保留 v6.8.9 全部功能
- SI / TIBC / UIBC / SI-TIBC(%)
- Folic acid / Vitamin B12 / CPK
- Chlamydia pneumoniae IgM
- Legionella Ag (Urine) / Pneumococcus Ag (Urine)
- Mycoplasma IgG / IgM Rapid Test
- EKG / InBody-QCheck OCR
- 既有 Lab / Urine / X-ray / US / CT / Endoscopy 等判讀

## 完整同步
- GitHub `index.html`、Bookmarklet 安裝頁、彈出視窗、README：v6.9.0
- Online / Offline 使用完全相同的 `bookmarklet_source.js`

## GitHub 更新
將 `online/` 內所有同名檔案直接覆蓋至 `clinical-tools`。
更新後刪除瀏覽器舊 Auto Clinical Lab 書籤，再從新版安裝頁重新拖曳。
