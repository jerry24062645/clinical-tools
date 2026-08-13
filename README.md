# Auto Clinical Lab v6.4.7

## 修正
- 修正「檢查報告」畫面反覆出現 `CXR: ----` 亂碼。
- 原因：舊版 parser 會讀到 Auto Clinical Lab 自己的結果面板；面板內已有 `CXR` 後，會把 PVR/Echo 等頁面的分隔線誤判成新的 CXR finding。
- v6.4.7 會排除自己的浮動面板文字，且 CXR / PVR / Echo / InBody 只有在「目前 HIS 診療項目列」符合該檢查時才解析。
- CXR 另加入有效文字檢查，純 `----- / #### / |||` 等分隔線不再收錄。
- 使用新的 v6.4.7 cache key，舊版已污染的 CXR cache 不會帶入。
- 保留 Windows 剪取工具、不同完報日累積、Lab / Urine / ABG/VBG / Echo / PVR/ABI / InBody 等功能。

## GitHub 更新
解壓縮後，將同名檔案直接覆蓋 GitHub 原檔即可。
