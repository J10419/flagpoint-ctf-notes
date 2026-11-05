# 實際驗證紀錄

日期：2026-11-05（Asia/Taipei）。執行環境：Windows、Node.js v24.15.0，無第三方套件。

## 已完成

- `npm test`：12 組測試通過，0 失敗。包含內容規格、非法資料、來源檔名、輸出路徑保護、HTML 語意與連結／錨點、可重現建置、範本擴充、文字跳脫、搜尋、Base64 正常與異常輸入、測驗判定。
- `npm run build`：產生首頁及 3 篇獨立內容頁。產物包含 `.nojekyll` 與全部共用 CSS、JavaScript、SVG。
- `npm run serve`：本地預覽伺服器正常啟動。以 HTTP 請求檢查 `index.html`、3 篇文章、CSS、2 個 JavaScript module 與 SVG，共 8 個網址均回應 HTTP 200，Content-Type 符合用途。
- 擴充測試在暫存目錄複製 `templates/note.json`，成功產生第 4 篇 `url-encoding.html` 與首頁卡片；再使用相同範本配上唯一 slug/order，成功產生第 5 篇。測試不保留正式文章名稱，未來真正新增 URL 編碼筆記後仍可繼續執行；不修改正式網站內容。
- 教學資料已核對：`ZmxhZ3tmaXJzdF9zdGVwfQ==` 解為 `flag{first_step}`；`ZmxhZ3trZWVwX25vdGVzfQ==` 解為 `flag{keep_notes}`。HTTP 示例的 `flag{read_headers}` 為 18 bytes，不含尾端換行。
- 原創例子與官方來源分開標示。已查閱 RFC 4648、MDN HTTP 文件、CMU 及 picoCTF 現有官方入口。來源可由各篇文章末端核對。
- 獨立規則審查已修正 CSS 規則文字與實作的落差，並加入建置輸出目錄保護。

## GitHub 與公開網站

- Repository：[J10419/flagpoint-ctf-notes](https://github.com/J10419/flagpoint-ctf-notes)，已確認公開，完整原始碼已上傳。
- 網站：[旗點](https://j10419.github.io/flagpoint-ctf-notes/)。使用者設定 `main` / `/docs` 後，GitHub Pages [首次部署紀錄](https://github.com/J10419/flagpoint-ctf-notes/actions/runs/41960560801) 回報 `completed / success`。
- 首次網站來源 commit：`985ada7c61c5709c86f2e65f3ac6efc6420d712c`；後續更新測試、文件與驗證截圖。
- 公開首頁、三篇文章、CSS、兩個 JavaScript module、SVG 共 8 個 URL 均回應 HTTP 200。檢查並非僅依據預期網址推測發布成功。

## 真實瀏覽器檢查

改由應用程式內建瀏覽器完成公開網站檢查，先前 Windows 瀏覽器控制的限制已不影響這些檢查。

| 項目 | 觀察結果 |
| --- | --- |
| 搜尋 `base64` | 只顯示 1 篇 Base64 筆記 |
| 相同搜尋加上 Web 分類 | 顯示 0 篇及無結果提示 |
| 按「顯示全部筆記」 | 回到 3 篇，清除搜尋及分類 |
| Base64 實驗 | 正確顯示 `flag{first_step}` |
| 輸入 `!not-base64` | 顯示格式錯誤，不造成頁面故障 |
| 鍵盤操作 | 從文字區按 Tab 到解碼按鈕，再按 Enter 可執行 |
| 測驗未選答案 | 顯示請先選擇答案 |
| 選錯／選對 | 分別顯示重試提示／答對回饋及說明 |
| 展開練習答案 | 顯示 `flag{keep_notes}` 與解釋 |
| 導覽 | 首頁 → Base64 → HTTP → 首頁 → 第一面旗皆正常 |
| 桌機 1280 × 900 | 首頁雙欄及三張卡片正常，文件寬度與捲動寬度皆 1265px（扣除捲軸） |
| 手機 390 × 844 | 首頁及三篇文章無整頁水平溢位，文件寬度與捲動寬度皆 375px（扣除捲軸） |
| 瀏覽器錯誤紀錄 | 檢查時無 error 訊息 |

截圖：[桌機首頁](home-desktop.jpg)、[手機首頁](home-mobile.jpg)、[手機版 Base64 練習](base64-mobile.jpg)。

## 驗證範圍與繳交前事項

- 完整正文已直接包含於靜態 HTML，且無 JavaScript 的答案後備內容已建立；未在瀏覽器實際切換「停用 JavaScript」設定。
- 鍵盤已抽查表單流程，未做完整輔助科技或螢幕閱讀器稽核。
- README 與 SUBMISSION 已填入真實連結；使用者仍須填寫學校、學號、系級及姓名，並閱讀自己的作業內容。

本紀錄只說明明列項目的證據，不是全面安全稽核、完整無障礙認證或成績保證。
