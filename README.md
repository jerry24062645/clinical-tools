# Auto Clinical Lab v6.8.4

## 本版修正
- 修正安裝頁仍顯示 v6.7.9：Online / Offline 全部統一為 v6.8.4。
- EKG OCR 改為 4 路辨識：原圖、上方報告區原色、二值化、窄版高對比。
- EKG 完報日期以報告本身印出的西元日期為主，再轉換民國年。
- 例如 `2026/8/17` → `115/08/17`。
- 加強讀取 HR / PR / QRS / QT / QTc、Sinus rhythm、Ventricular premature complex、Abnormal R-wave progression、Borderline ST elevation、Baseline wander。
- Online / Offline 完全同步。

## GitHub 更新
將 `online/` 內同名檔案直接覆蓋到 `clinical-tools`。
更新後請刪除舊 Auto Clinical Lab 書籤，再從新版安裝頁重新拖曳一次。
