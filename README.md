# Auto Clinical Lab v6.9.7

## 新增：原發性高醛固酮症篩檢相關判讀
- PRA / Renin activity：`ng/mL/hr`
- PAC / Aldosterone：統一為 `ng/dL`
  - 若院外報告使用 `pg/mL`，自動除以 10 轉為 `ng/dL`
- ARR：
  `ARR = PAC (ng/dL) / PRA (ng/mL/hr)`
- 僅同一完報日期同時有 PAC + PRA 且 PRA > 0 時才計算 ARR。
- 使用本工具設定：
  - `ARR > 20` → `H`
  - `PAC > 15 ng/dL` → `H`
- 輸出固定順序：
  `• PAC 18.2 H ng/dL; PRA 0.5 ng/mL/hr; ARR H 36.4`
  （實際 H 標記格式依工具既有格式呈現。）

## 新增：Adrenal
- ACTH，pg/mL
- Cortisol(8AM)，ug/dL
- 依院內參考區間自動 H/L，例如：
  `• Adrenal: ACTH 8.7 pg/mL; Cortisol(8AM) H 23.75 ug/dL`

## 保留既有功能
保留 v6.9.6 全部功能，包括：
- 75 g OGTT
- HIV Ag/Ab Combo / RPR-VDRL / ABO blood grouping
- Tumor markers / pregnancy test / PTH-i
- Corrected calcium / calculated serum osmolality
- Ferritin / Reticulocyte / Hb electrophoresis
- TP / A-G ratio / Cockcroft-Gault CrCl
- UACR / UPCR / spot urine / urine routine
- EKG / InBody OCR
- Imaging / US / CT / endoscopy 等既有判讀

## 完整同步
Online / Offline / GitHub index / installer / screen_capture / README 全部同步為 v6.9.7。

## GitHub 更新
將 `online/` 內所有同名檔案完整覆蓋至 `clinical-tools`。
更新後刪除瀏覽器舊 Auto Clinical Lab 書籤，再由新版安裝頁重新拖曳。
