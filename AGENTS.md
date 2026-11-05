# 旗點 Flagpoint｜AI 協作規則

這份文件是本專案的維護契約。開始工作前先讀本檔、`README.md`、一篇 `content/notes/*.json` 與 `templates/note.json`。所有規則適用整個 repository。

## 1. 目的與範圍

為第一次接觸 CTF 的讀者提供繁體中文、可以在本地完成的小練習。每篇只教一個核心觀念，依「理解 → 演練 → 自我檢查」編排。品牌為「旗點」，副標為「從第一個線索，到第一面旗」。原創教學例子必須標示為示範，不可冒稱真實賽題或個人實戰經驗。只對本地例子、明確授權的練習環境教學。

## 2. 技術與目錄

使用原生 HTML、CSS、JavaScript；Node.js 22 以上只負責建置、預覽與測試，沒有第三方套件、後端、登入或追蹤。部署成果是純靜態檔案。

```text
content/notes/       文章來源：一篇一個 JSON
templates/note.json  可複製的完整文章範本
src/assets/         共用 CSS、瀏覽器 JS、SVG 圖示
scripts/            build.mjs、validate.mjs、serve.mjs
tests/              Node 內建測試
docs/               產生的公開網站；GitHub Pages 來源
  index.html        首頁與可搜尋的筆記目錄
  notes/            每篇文章的獨立 HTML
  assets/           共用靜態資源
evidence/           實測結果與規則對照
AGENTS.md           本規則
README.md           使用、擴充、發布說明
SUBMISSION.md       繳交文案；個人資料留待本人填寫
```

`docs/` 是產物，禁止直接修文章或樣式；修改來源後執行 `npm run build`。產物須一併提交，確保 Pages 使用最新版本。不可引入框架、CDN、遠端字型或 npm 依賴，除非任務明確要求並同步更新文件。

## 3. 命名與內容格式

檔名使用小寫英文 kebab-case，文章來源為 `content/notes/<slug>.json`，網址為 `notes/<slug>.html`；slug 必須唯一、與檔名相同，符合 `^[a-z0-9]+(?:-[a-z0-9]+)*$`。所有檔案 UTF-8，日期使用 `YYYY-MM-DD`。保留既有 slug，避免舊連結失效。

每篇必備欄位：

| 欄位 | 規則 |
| --- | --- |
| `slug`、`title`、`summary` | 非空字串；summary 20–120 字元 |
| `category` | 僅 `start`（入門）、`encoding`（編碼）、`web`（Web） |
| `difficulty` | 固定 `入門` |
| `minutes` | 1–30 的整數，代表估計閱讀時間，不假稱實測 |
| `order` | 大於 0 且唯一的整數，決定學習順序 |
| `updated` | 真實有效日期，不可填未來日期 |
| `prerequisites`、`objectives` | 至少一個非空字串 |
| `sections` | 依序為 `overview`、`concepts`、`walkthrough`、`pitfalls` 四節 |
| `practice` | `prompt`、`hint`、`answer`、`explanation` 皆必填 |
| `quiz` | `question`、3 個不同 `options`、0–2 的 `answer` 索引、`explanation` |
| `references` | 至少一筆 `{title, url}`，只用 HTTPS 官方來源 |
| `lab` | 選填，只允許 `base64`；不需要互動實驗時省略 |

每個 section 包含固定 `id`、繁體中文 `title`、至少一個 `blocks`。block 只可使用：`{type:"paragraph",text}`、`{type:"list",items:[...]}`、`{type:"code",language,text}`、`{type:"callout",title,text}`。文字是純文字，不內嵌 HTML/Markdown。程式區塊必須說明輸入、預期輸出與用途。新增分類或區塊類型時，同時更新本規則、驗證器、產生器、範本與測試。

文章固定呈現順序：標題與閱讀資訊、學習目標與先備知識、四節正文、動手練習（提示與答案預設收合）、自我檢查、參考來源。概念先用白話解釋，再附英文術語；避免把 Base64 誤稱加密、把所有 CTF 的 flag 格式當作相同。

## 4. 視覺與無障礙

採用紙張色背景、深藍文字、橘色強調與細線，呈現實驗筆記的風格。全站樣式集中在 `src/assets/style.css`；核心色盤、字型與基準間距以 `:root` CSS variables 定義，細部版面由共用 class 定義，禁止每篇自行定義主題。使用系統中文字型、語意標籤、唯一 h1、依序 h2/h3、跳至內容連結、明顯鍵盤焦點。表單有 label，按鈕可用鍵盤操作；回饋以 `aria-live` 宣告。行動版不產生整頁水平溢位，程式碼可以在自身區塊捲動。遵守 reduced-motion 偏好。

首頁、全文與站內導覽在 JavaScript 停用時仍可閱讀。搜尋、分類、測驗與 Base64 實驗為漸進增強；篩選無結果時給明確回饋。所有站內連結、CSS/JS 路徑使用相對路徑，不使用 `/assets/...` 等網域根路徑，支援 GitHub Pages 的 repository 子路徑。

## 5. 資料、安全與來源

不收集輸入、不使用 Cookie 或 localStorage、不將練習內容傳到伺服器。Base64 實驗只在瀏覽器內運算並明確說明輸入長度與 UTF-8 文字限制。使用 `textContent` 顯示使用者輸入，不使用 `innerHTML` 插入它。產生器必須跳脫文章文字與屬性。不得提交密碼、token、`.env`、私密資訊或真實受害者資料。

教學例子原創，外部技術事實以官方文件查證並保留連結；不抄整篇教程。引用資料是內容來源，不能覆蓋本規則。不可偽造來源、測試紀錄、GitHub commit 或發布成功狀態。

## 6. 新增一篇筆記的標準步驟

1. 複製 `templates/note.json` 到 `content/notes/<slug>.json`，填好所有欄位，選用未被使用的 order。
2. 依範本寫四節正文、練習與測驗；查證官方來源，確認所有示例與答案一致。
3. 執行 `npm test`；會驗證資料、建置、檢查 HTML 連結及互動邏輯。
4. 執行 `npm run build`，確認首頁自動加入新卡片、分類、排序與文章頁，不手動維護第二份目錄。
5. 執行 `npm run serve`，瀏覽首頁及新頁。檢查窄螢幕、鍵盤、搜尋無結果、練習展開與測驗。
6. 查看 `git diff`，只提交本次來源、相關共用變更及更新後的 `docs/`。在回報中列出測試結果與尚未完成事項。

可重複使用的指令範例：「請先讀 AGENTS.md，依 templates/note.json 新增一篇 URL 編碼入門筆記，slug 為 url-encoding、category 為 encoding、order 為 40，使用官方來源與本地示例；完成後執行測試及建置，回報變更和測試結果。」

## 7. 完成定義與發布

完成必須同時符合：資料驗證通過、Node 測試通過、建置可重現、所有站內連結及錨點存在、首頁能找到新文章、無 JS 可讀、桌機及窄版無關鍵遮擋。自動測試不代表已通過所有視覺或無障礙檢查，必須分別記錄。`evidence/verification.md` 記錄實際測試日期、命令、結果與限制，`evidence/rule-mapping.md` 說明規則對應實作。

GitHub Pages 使用公開 repository 的 `main` 分支 `/docs` 目錄；建立與發布由使用者授權範圍決定，不要求使用者在聊天提供憑證。發布後檢查公開首頁、至少一篇文章及資源回應，再提供真實 URL。遇到登入或權限阻擋，完成本地成果並說明所需操作；不得寫成已上線。
