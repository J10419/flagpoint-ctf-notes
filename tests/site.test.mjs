import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync, cpSync, rmSync } from 'node:fs';
import { dirname, join, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { loadNotes, validateNotes } from '../scripts/validate.mjs';
import { build } from '../scripts/build.mjs';
import { filterNotes, decodeBase64, gradeQuiz } from '../src/assets/core.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content', 'notes');
const templatePath = join(root, 'templates', 'note.json');
const notes = loadNotes(contentDir);

function temporary(t) {
  const folder = mkdtempSync(join(tmpdir(), 'flagpoint-tests-'));
  t.after(() => {
    // This exact absolute directory was created by this test, never a project path.
    assert.equal(dirname(folder), resolve(tmpdir()));
    assert.ok(folder.startsWith(join(resolve(tmpdir()), 'flagpoint-tests-')));
    rmSync(folder, { recursive: true, force: true });
  });
  return folder;
}
function filesIn(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
    ? filesIn(join(folder, entry.name)) : [join(folder, entry.name)]).sort();
}
function snapshot(folder) {
  return Object.fromEntries(filesIn(folder).map(file => [relative(folder, file).split(sep).join('/'), readFileSync(file, 'utf8')]));
}
const decodeAttribute = value => value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
function assertLocalLinks(output) {
  for (const file of filesIn(output).filter(name => name.endsWith('.html'))) {
    const html = readFileSync(file, 'utf8');
    assert.match(html, /<html\b[^>]*lang=["']zh-Hant["']/i, `${file}: 繁體中文語言標記`);
    assert.equal([...html.matchAll(/<h1(?:\s|>)/gi)].length, 1, `${file}: 唯一 h1`);
    assert.match(html, /<main(?:\s|>)/i, `${file}: 語意 main`);
    const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, `${file}: id 不重複`);
    for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
      const link = decodeAttribute(match[1]);
      if (/^https:\/\//.test(link)) continue;
      assert.ok(!/^(?:[a-z]+:|\/)/i.test(link), `${file}: 站內連結須使用相對路徑：${link}`);
      const [pathPart, fragment] = link.split('#');
      const cleanPath = pathPart.split('?')[0];
      let destination = cleanPath ? resolve(dirname(file), decodeURIComponent(cleanPath)) : file;
      if (destination.endsWith(sep) || cleanPath.endsWith('/')) destination = join(destination, 'index.html');
      const rel = relative(output, destination);
      assert.ok(rel !== '..' && !rel.startsWith(`..${sep}`), `${file}: 連結不可跳出公開目錄：${link}`);
      assert.ok(existsSync(destination), `${file}: 找不到 ${link}`);
      if (fragment) {
        const target = readFileSync(destination, 'utf8');
        const targetIds = [...target.matchAll(/\bid=["']([^"']+)["']/g)].map(item => item[1]);
        assert.ok(targetIds.includes(decodeURIComponent(fragment)), `${file}: 找不到錨點 ${link}`);
      }
    }
  }
}

test('正式筆記與可複製範本均符合 AGENTS.md 內容契約', () => {
  assert.ok(notes.length >= 3);
  assert.doesNotThrow(() => validateNotes(notes));
  assert.doesNotThrow(() => validateNotes([JSON.parse(readFileSync(templatePath, 'utf8'))]));
});

test('建置拒絕將輸出寫入專案根目錄或來源目錄', () => {
  const before = readFileSync(join(contentDir, 'first-flag.json'), 'utf8');
  for (const outDir of [root, contentDir, join(root, 'src'), join(root, 'templates'), join(contentDir, 'generated')]) {
    assert.throws(() => build({ root, outDir }), /輸出目錄不可/);
  }
  assert.equal(readFileSync(join(contentDir, 'first-flag.json'), 'utf8'), before);
});

test('錯誤欄位、排序、日期、分類與結構會被拒絕並指出位置', () => {
  const cases = [
    [note => { note.slug = '../escape'; }, /slug/],
    [note => { note.extra = true; }, /未知欄位/],
    [note => { delete note.title; }, /title/],
    [note => { note.summary = '太短'; }, /summary/],
    [note => { note.category = 'unknown'; }, /category/],
    [note => { note.minutes = 1.5; }, /minutes/],
    [note => { note.order = 0; }, /order/],
    [note => { note.updated = '2026-02-30'; }, /有效/],
    [note => { note.updated = '2999-01-01'; }, /未來/],
    [note => { note.objectives = []; }, /objectives/],
    [note => { note.sections.reverse(); }, /sections/],
    [note => { note.sections[0].blocks = [{ type: 'html', text: '<b>bad</b>' }]; }, /區塊類型/],
    [note => { note.sections[0].blocks[0].unexpected = true; }, /未知欄位/],
    [note => { note.practice.answer = ''; }, /practice.answer/],
    [note => { note.quiz.options = ['一樣', '一樣', '不同']; }, /3 個不同/],
    [note => { note.quiz.answer = 3; }, /quiz.answer/],
    [note => { note.references[0].url = 'javascript:alert(1)'; }, /HTTPS/],
    [note => { note.references[0].url = 'https://user:pass@example.com'; }, /HTTPS/],
    [note => { note.lab = 'unknown'; }, /lab/],
  ];
  for (const [change, expected] of cases) {
    const note = structuredClone(notes[0]);
    change(note);
    assert.throws(() => validateNotes([note]), expected);
  }
  assert.throws(() => validateNotes([notes[0], structuredClone(notes[0])]), /重複/);
  assert.throws(() => validateNotes([]), /至少/);
});

test('來源檔名必須與 slug 一致，損壞的 JSON 有明確錯誤', t => {
  const folder = temporary(t);
  writeFileSync(join(folder, 'wrong-name.json'), JSON.stringify(notes[0]));
  assert.throws(() => loadNotes(folder), /slug 必須與檔名相同/);
  writeFileSync(join(folder, 'wrong-name.json'), '{invalid');
  assert.throws(() => loadNotes(folder), /wrong-name.json.*JSON/);
});

test('建置產生完整靜態頁面、資源、有效相對連結與錨點', async t => {
  const outDir = join(temporary(t), 'site');
  await build({ root, outDir, contentDir });
  assert.ok(existsSync(join(outDir, '.nojekyll')));
  const home = readFileSync(join(outDir, 'index.html'), 'utf8');
  for (const note of notes) {
    assert.ok(home.includes(`notes/${note.slug}.html`));
    const html = readFileSync(join(outDir, 'notes', `${note.slug}.html`), 'utf8');
    for (const section of note.sections) assert.ok(html.includes(`id="${section.id}"`));
    assert.ok(html.includes(note.title));
    assert.ok(html.includes(note.practice.prompt));
    assert.match(html, /<details(?:\s|>)/i, '提示與解答有無 JS 可用的 details');
  }
  assertLocalLinks(outDir);
});

test('同樣的來源建置兩次得到完全相同的網站', async t => {
  const folder = temporary(t);
  const first = join(folder, 'first');
  const second = join(folder, 'second');
  await build({ root, outDir: first, contentDir });
  await build({ root, outDir: second, contentDir });
  assert.deepEqual(snapshot(first), snapshot(second));
});

test('只新增一份範本內容，即自動新增首頁項目與獨立文章', async t => {
  const folder = temporary(t);
  const extendedContent = join(folder, 'content');
  cpSync(contentDir, extendedContent, { recursive: true });
  const template = JSON.parse(readFileSync(templatePath, 'utf8'));
  assert.ok(!notes.some(note => note.slug === template.slug || note.order === template.order));
  writeFileSync(join(extendedContent, `${template.slug}.json`), `${JSON.stringify(template, null, 2)}\n`);
  const outDir = join(folder, 'site');
  const result = await build({ root, outDir, contentDir: extendedContent });
  assert.equal(result.notes.length, notes.length + 1);
  assert.ok(readFileSync(join(outDir, 'index.html'), 'utf8').includes(`notes/${template.slug}.html`));
  assert.ok(existsSync(join(outDir, 'notes', `${template.slug}.html`)));
  assertLocalLinks(outDir);
});

test('文章文字與屬性中像 HTML 的內容會被跳脫', async t => {
  const folder = temporary(t);
  const customContent = join(folder, 'content');
  mkdirSync(customContent);
  const note = structuredClone(notes[0]);
  note.title = '<img src=x onerror=alert(1)> "測試"';
  note.sections[0].blocks = [{ type: 'paragraph', text: '<script>alert("demo")</script> & 文字' }];
  writeFileSync(join(customContent, `${note.slug}.json`), JSON.stringify(note));
  const outDir = join(folder, 'site');
  await build({ root, outDir, contentDir: customContent });
  const html = readFileSync(join(outDir, 'notes', `${note.slug}.html`), 'utf8');
  assert.ok(!html.includes('<img src=x'));
  assert.ok(!html.includes('<script>alert('));
  assert.ok(html.includes('&lt;img'));
  assert.ok(html.includes('&lt;script&gt;'));
});

const searchFixture = [
  { title: 'Base64 編碼', summary: '讀懂 flag 的基礎', category: 'encoding', slug: 'base64' },
  { title: 'HTTP 基礎', summary: '請求與回應', category: 'web', slug: 'http' },
  { title: '第一面旗', summary: '入門解題筆記', category: 'start', slug: 'first' },
];
test('搜尋支援大小寫、中文、空白、分類與無結果', () => {
  assert.equal(filterNotes(searchFixture, 'base64', 'all').length, 1);
  assert.equal(filterNotes(searchFixture, '  HTTP  ', 'all')[0].slug, 'http');
  assert.equal(filterNotes(searchFixture, '回應', 'all')[0].slug, 'http');
  assert.equal(filterNotes(searchFixture, '', 'encoding')[0].slug, 'base64');
  assert.equal(filterNotes(searchFixture, '   ', 'all').length, 3);
  assert.equal(filterNotes(searchFixture, 'base64', 'web').length, 0);
  assert.equal(filterNotes(searchFixture, '不存在的關鍵字', 'all').length, 0);
});

test('Base64 正確處理教學範例、ASCII 空白與 UTF-8 中文', () => {
  assert.equal(decodeBase64('ZmxhZ3tmaXJzdF9zdGVwfQ=='), 'flag{first_step}');
  assert.equal(decodeBase64('ZmxhZ3trZWVwX25vdGVzfQ=='), 'flag{keep_notes}');
  assert.equal(decodeBase64('  T W\nFu\t'), 'Man');
  assert.equal(decodeBase64(Buffer.from('旗點').toString('base64')), '旗點');
});

test('Base64 拒絕錯誤格式、非 canonical padding、無效 UTF-8 與超長內容', () => {
  for (const input of ['', '!', 'TWE', 'TQ===', '====', 'AB==', 'AAB=', '/w==', 'SGVsbG8_', 'A'.repeat(4100)]) {
    assert.throws(() => decodeBase64(input), Error, `應拒絕 ${input.slice(0, 20)}`);
  }
});

test('單選題依答案索引判斷正確與錯誤', () => {
  for (let correct = 0; correct < 3; correct++) {
    for (let selected = 0; selected < 3; selected++) assert.equal(gradeQuiz(selected, correct), selected === correct);
  }
});
