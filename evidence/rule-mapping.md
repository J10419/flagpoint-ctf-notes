# 規則與實作對照

本表說明 [AGENTS.md](../AGENTS.md) 的規則如何落在專案中，以及應以什麼證據檢查。**這是驗證對照表，不是測試通過紀錄**；實際日期、命令、結果與限制請看 [verification.md](verification.md)。

| 規則 | 實作位置 | 驗證方式與預期結果 |
| --- | --- | --- |
| 一篇只教一個核心觀念，使用繁體中文原創示例 | `content/notes/*.json` | 人工閱讀三篇筆記，確認目標、示例與練習一致；來源不冒稱個人經驗 |
| 一篇一份資料，slug 與檔名一致 | `content/notes/`、`scripts/validate.mjs` | 驗證合法資料可讀取；重複 slug、不合法命名與檔名不符應被拒絕 |
| 固定欄位、日期、分類與排序 | `AGENTS.md`、`templates/note.json`、`scripts/validate.mjs` | 缺欄位、未知分類、未來日期、重複 order 等非法輸入應有明確錯誤 |
| 正文固定四節，練習與測驗完整 | `content/notes/*.json`、`scripts/build.mjs` | 資料驗證章節順序；HTML 檢查標題與必要內容，練習提示及答案預設收合 |
| 不手動維護第二份文章目錄 | `scripts/build.mjs` | 建置同一份文章資料，自動產生首頁卡片與獨立內容頁 |
| 新內容能依規則擴充 | `templates/note.json`、`tests/site.test.mjs` | 在暫存目錄加入範本後建置，應出現第四篇文章與對應首頁入口；不修改正式內容 |
| 共用視覺規格 | `src/assets/style.css` | 人工比較首頁與三篇文章，確認色彩、字型、間距、焦點及章節版面一致 |
| 支援 repository 子路徑 | `scripts/build.mjs`、`docs/` | HTML 中站內連結及 CSS/JS 使用相對路徑，連結檔案與頁內錨點均存在 |
| 不依賴 JavaScript 才能閱讀 | `scripts/build.mjs`、`docs/*.html`、`docs/notes/*.html` | 檢查產物內含完整正文；停用 JavaScript 後以瀏覽器確認閱讀與導覽 |
| 搜尋、分類與無結果提示 | `src/assets/` | 邏輯測試包含中文、大小寫、空白與無結果；瀏覽器實際操作搜尋與分類 |
| Base64 是編碼，實驗只處理本地文字 | `content/notes/base64-basics.json`、`src/assets/` | 核對已知字串、非法格式、UTF-8 錯誤與輸入上限；確認輸入不發送至外部服務 |
| 使用者輸入不可作 HTML 執行 | `scripts/build.mjs`、`src/assets/` | 產生器測試特殊字元跳脫；互動以 `textContent` 輸出，無以輸入拼接的 `innerHTML` |
| 語意結構與鍵盤可用 | `scripts/build.mjs`、`src/assets/style.css` | 自動檢查語言屬性與唯一 h1；人工檢查 label、焦點、Tab 操作與即時回饋 |
| 手機不出現整頁水平溢位 | `src/assets/style.css` | 以窄螢幕檢查首頁與內容頁；長程式碼僅在自身區塊捲動 |
| 建置可重現，來源與產物一致 | `scripts/build.mjs`、`tests/site.test.mjs`、`docs/` | 相同輸入兩次建置的檔案內容應一致；提交前重新建置並檢視差異 |
| 真實回報測試與發布狀態 | `README.md`、`SUBMISSION.md`、`evidence/verification.md` | 記錄實際執行結果；公開首頁與文章可開啟後，才將網址列為已驗證 |

## 為什麼這套規則能繼續使用

`AGENTS.md` 定義目的、格式與修改邊界，`templates/note.json` 提供可以複製的完整例子，驗證器將重要欄位要求轉成可執行檢查，產生器統一頁面與目錄。AI 新增內容時能沿用同一條流程；若漏填、命名不符或破壞連結，測試提供具體錯誤，讓它在發布前修正。

技術事實是否準確、說明是否適合初學者、畫面是否易讀仍需人工確認。自動檢查只覆蓋測試明確列出的條件，不代表全面無障礙認證或完整安全稽核。
