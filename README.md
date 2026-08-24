# Auto Clinical Lab v6.9.1

## 新增判讀
- Ferritin
  - 例如：`Ferritin H 563 ng/mL`
- Reticulocyte count
  - 例如：`Reticulocyte 0.82%`

## EKG / InBody OCR 閃退修正
問題原因是 OCR 完成後，預覽圖片與狀態文字的 DOM 變化會再次觸發 MutationObserver。
舊版接著用一般模式重新 draw，在「目前沒有 active HIS report body」時會把 summary 清空，因此會出現「結果閃一下就消失」。

v6.9.1 修正：
- OCR 成功後將結果設為 `OCR_PIN`。
- OCR 結果會持續保留在 summary 灰框，直到 Clear cache 或關閉視窗。
- MutationObserver 忽略 Auto Clinical Lab 自己視窗內的 DOM 變化。
- Scroll / HIS 頁面其他變動時，只會重新渲染已釘選的 OCR summary，不會清空。
- OCR 完成後可直接按 Copy。

## 保留既有功能
- Total protein / A-G ratio
- Cockcroft-Gault CrCl（Age/Sex 自動抓取、BW 手動輸入，CrCl 接在 eGFR 後）
- SI / TIBC / UIBC / SI-TIBC(%)
- Folic acid / Vitamin B12 / CPK
- Chlamydia pneumoniae IgM
- Legionella / Pneumococcus urine antigen
- Mycoplasma IgG / IgM Rapid Test
- EKG / InBody-QCheck OCR 與既有 Lab / imaging / endoscopy 判讀

## 完整同步
- GitHub `index.html`
- Bookmarklet 安裝頁
- Bookmarklet source
- Online / Offline
- README

全部同步為 v6.9.1。
