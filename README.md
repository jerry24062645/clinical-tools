# Auto Clinical Lab v6.8.5

## 本版修正
- 修正 EKG OCR 顯示「完成 ✓ 已加入 summary」後，上方 summary 灰框仍空白。
- EKG OCR 成功寫入快取後會立即重新執行 `draw()`，直接把結果填入視窗。
- `storeECGText()` 本身也加入 UI refresh，避免其他 EKG OCR 路徑只寫資料、不更新畫面。
- EKG 日期仍以報告本身日期為主並轉民國年。
- Online / Offline 完全同步。
- 保留 v6.8.4 既有功能。

### 預期流程
貼入 EKG → OCR → 解析 → 寫入對應日期 → 立即刷新 summary → 上方灰框直接顯示 EKG 結果。

## GitHub 更新
將 `online/` 內同名檔案直接覆蓋到 `clinical-tools`。
更新後請刪除舊 Auto Clinical Lab 書籤，從新版安裝頁重新拖曳一次。
