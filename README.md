# Auto Clinical Lab v6.9.2

## 本版重點
- Ferritin
- Reticulocyte count
- Total protein / A-G ratio
- Cockcroft-Gault CrCl
- EKG / InBody-QCheck OCR summary 固定保留，不再閃退

## screen_capture.html 同步修正
舊版 `screen_capture.html` 會：
- 自己載入 Tesseract
- OCR ECG
- 再用 `window.opener.postMessage()` 把文字送回 Auto Clinical Lab

v6.9.2 改為：
- EKG / InBody 截圖直接在 HIS 頁面的 Auto Clinical Lab 視窗按 Ctrl+V
- OCR、日期解析、summary 更新全部由主 Bookmarklet 處理
- `screen_capture.html` 僅保留為相容導引頁
- 不再依賴 `window.opener`
- 避免舊 helper 造成 OCR 回傳失敗、無法連線或 summary 狀態不同步

## 完整同步
以下全部同步為 v6.9.2：
- online/bookmarklet_source.js
- offline/bookmarklet_source.js
- online/emr_lab_bookmarklet.html
- offline/emr_lab_bookmarklet.html
- online/index.html
- online/screen_capture.html
- offline/screen_capture.html
- README.md

## GitHub 更新
請將 `online/` 內所有同名檔案完整覆蓋到 `clinical-tools`。
更新後刪除瀏覽器舊 Auto Clinical Lab 書籤，再由新版安裝頁重新拖曳。
