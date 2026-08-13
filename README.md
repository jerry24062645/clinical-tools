# Auto Clinical Lab v6.4.5

以 **v6.4.4** 為基底，只新增以下功能：

- 保留原本 Auto Clinical Lab 自動讀取與依完報日累積。
- 新增 **CXR** 自動讀取。
- 新增 **PVR / ABI** 自動讀取，以下兩個診療名稱視為同一檢查：
  - `心內動脈分段血流及壓力之測定PUR(Pulse volume recording)`
  - `四肢血流探測, 壓力測量並記錄`
- `Capture screen` 改為 **Windows 剪取工具** 工作流程：`Win+Shift+S` → 截圖 → 回 HIS `Ctrl+V`，避免瀏覽器直接擷取整個螢幕。
- Auto Clinical Lab 自己的浮動視窗不參與頁面資料解析，避免結果反覆被自己讀回。

## GitHub 上傳
解壓縮後，直接覆蓋 `clinical-tools` 內同名檔案：

- `emr_lab_bookmarklet.html`
- `bookmarklet_source.js`
- `screen_capture.html`
- `README.md`

更新後請刪除瀏覽器書籤列舊版 Auto Clinical Lab，再從新的 `emr_lab_bookmarklet.html` 重新拖曳一次。
