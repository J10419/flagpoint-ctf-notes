# 實際驗證紀錄

日期：2026-11-05（Asia/Taipei）。執行環境：Windows、Node.js v24.15.0，無第三方套件。

## 已完成

- `npm test`：12 組測試通過，0 失敗。包含內容規格、非法資料、來源檔名、輸出路徑保護、HTML 語意與連結／錨點、可重現建置、範本擴充、文字跳脫、搜尋、Base64 正常與異常輸入、測驗判定。
- `npm run build`：產生首頁及 3 篇獨立內容頁。產物包含 `.nojekyll` 與全部共用 CSS、JavaScript、SVG。
- `npm run serve`：本地預覽伺服器正常啟動。以 HTTP 請求檢查 `index.html`、3 篇文章、CSS、2 個 JavaScript module 與 SVG，共 8 個網址均回應 HTTP 200，Content-Type 符合用途。
- 擴充測試在暫存目錄複製 `templates/note.json`，僅新增一份文章資料，成功產生第 4 篇 `url-encoding.html` 與首頁卡片；不修改正式網站內容。
- 教學資料已核對：`ZmxhZ3tmaXJzdF9zdGVwfQ==` 解為 `flag{first_step}`；`ZmxhZ3trZWVwX25vdGVzfQ==` 解為 `flag{keep_notes}`。HTTP 示例的 `flag{read_headers}` 為 18 bytes，不含尾端換行。
- 原創例子與官方來源分開標示。已查閱 RFC 4648、MDN HTTP 文件、CMU 及 picoCTF 現有官方入口。來源可由各篇文章末端核對。
- 獨立規則審查已修正 CSS 規則文字與實作的落差，並加入建置輸出目錄保護。

## 尚未完成，不能視為通過

- 瀏覽器視覺檢查、實際鍵盤操作、窄螢幕溢位、停用 JavaScript 操作，以及事件綁定的互動檢查尚未完成。瀏覽器控制工具因無法可靠識別 Windows 當前網址而停止；已通過的邏輯與 HTML 測試不代表這些項目已通過。
- GitHub repository 尚待使用者建立；GitHub Pages 尚未發布，沒有已驗證的公開網站 URL。

## 發布後待檢查清單

- [ ] repository 公開，包含來源、AGENTS.md、README、範本與測試。
- [ ] Pages 設定為 `main` / `/docs`，部署成功。
- [ ] 公開首頁及三篇文章、CSS/JS 皆可載入。
- [ ] 桌機與窄版無關鍵遮擋或整頁水平溢位。
- [ ] 搜尋／分類、無結果重設、Base64 成功與失敗、測驗未選／正確／錯誤皆可操作。
- [ ] 鍵盤可到達導覽與表單，提示／答案可展開；停用 JavaScript 仍可閱讀。
- [ ] 更新 README 與 SUBMISSION 的真實網址及狀態，填妥個人繳交資訊。

本紀錄只說明明列項目的證據，不是全面安全稽核、完整無障礙認證或成績保證。
