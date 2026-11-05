import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const FIELDS = ['slug', 'title', 'summary', 'category', 'difficulty', 'minutes', 'order', 'updated', 'prerequisites', 'objectives', 'sections', 'practice', 'quiz', 'references'];
const SECTION_IDS = ['overview', 'concepts', 'walkthrough', 'pitfalls'];
const CATEGORIES = ['start', 'encoding', 'web'];
const BLOCK_FIELDS = {
  paragraph: ['type', 'text'],
  list: ['type', 'items'],
  code: ['type', 'language', 'text'],
  callout: ['type', 'title', 'text'],
};

/** Validate the reusable content contract; editorial accuracy still needs review. */
export function validateNotes(notes) {
  const errors = [];
  const fail = (path, message) => errors.push(`${path}: ${message}`);
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const string = (value, path) => {
    if (typeof value !== 'string' || !value.trim()) fail(path, '必須是非空字串');
  };
  const object = (value, path, required, optional = []) => {
    if (!isObject(value)) { fail(path, '必須是物件'); return false; }
    for (const key of required) if (!Object.hasOwn(value, key)) fail(`${path}.${key}`, '缺少必填欄位');
    for (const key of Object.keys(value)) if (![...required, ...optional].includes(key)) fail(`${path}.${key}`, '未知欄位');
    return true;
  };
  const strings = (value, path) => {
    if (!Array.isArray(value) || value.length === 0) { fail(path, '必須是至少一項的陣列'); return; }
    value.forEach((item, i) => string(item, `${path}[${i}]`));
  };
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
  const slugs = new Set();
  const orders = new Set();
  if (!Array.isArray(notes) || notes.length === 0) throw new Error('內容驗證失敗：至少需要一篇筆記');

  notes.forEach((note, index) => {
    const path = `notes[${index}]${note?.slug ? ` (${note.slug})` : ''}`;
    if (!object(note, path, FIELDS, ['lab'])) return;
    for (const key of ['slug', 'title', 'summary']) string(note[key], `${path}.${key}`);
    if (typeof note.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(note.slug)) fail(`${path}.slug`, '必須是小寫英文 kebab-case');
    if (slugs.has(note.slug)) fail(`${path}.slug`, 'slug 重複');
    slugs.add(note.slug);
    if (typeof note.summary === 'string' && ([...note.summary].length < 20 || [...note.summary].length > 120)) fail(`${path}.summary`, '長度必須為 20–120 字元');
    if (!CATEGORIES.includes(note.category)) fail(`${path}.category`, '只接受 start、encoding、web');
    if (note.difficulty !== '入門') fail(`${path}.difficulty`, '必須是「入門」');
    if (!Number.isInteger(note.minutes) || note.minutes < 1 || note.minutes > 30) fail(`${path}.minutes`, '必須是 1–30 的整數');
    if (!Number.isInteger(note.order) || note.order < 1) fail(`${path}.order`, '必須是大於 0 的整數');
    if (orders.has(note.order)) fail(`${path}.order`, '排序值重複');
    orders.add(note.order);
    const parsedDate = typeof note.updated === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(note.updated)
      ? new Date(`${note.updated}T00:00:00.000Z`) : null;
    if (!parsedDate || !Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== note.updated) {
      fail(`${path}.updated`, '必須是有效的 YYYY-MM-DD 日期');
    } else if (note.updated > today) fail(`${path}.updated`, '不可填未來日期（以 Asia/Taipei 為準）');
    strings(note.prerequisites, `${path}.prerequisites`);
    strings(note.objectives, `${path}.objectives`);
    if (Object.hasOwn(note, 'lab') && note.lab !== 'base64') fail(`${path}.lab`, '只接受 base64；無實驗時請省略');

    if (!Array.isArray(note.sections) || note.sections.length !== SECTION_IDS.length) {
      fail(`${path}.sections`, '必須依序包含 overview、concepts、walkthrough、pitfalls 四節');
    }
    if (Array.isArray(note.sections)) note.sections.forEach((section, sectionIndex) => {
      const sectionPath = `${path}.sections[${sectionIndex}]`;
      if (!object(section, sectionPath, ['id', 'title', 'blocks'])) return;
      if (section.id !== SECTION_IDS[sectionIndex]) fail(`${sectionPath}.id`, `應為 ${SECTION_IDS[sectionIndex] ?? '無額外章節'}`);
      string(section.title, `${sectionPath}.title`);
      if (typeof section.title === 'string' && !/\p{Script=Han}/u.test(section.title)) fail(`${sectionPath}.title`, '標題必須包含中文');
      if (!Array.isArray(section.blocks) || section.blocks.length === 0) { fail(`${sectionPath}.blocks`, '至少需要一個內容區塊'); return; }
      section.blocks.forEach((block, blockIndex) => {
        const blockPath = `${sectionPath}.blocks[${blockIndex}]`;
        if (!isObject(block) || !Object.hasOwn(BLOCK_FIELDS, block.type)) { fail(blockPath, '未知的內容區塊類型'); return; }
        object(block, blockPath, BLOCK_FIELDS[block.type]);
        for (const field of BLOCK_FIELDS[block.type].filter(key => !['type', 'items'].includes(key))) string(block[field], `${blockPath}.${field}`);
        if (block.type === 'list') strings(block.items, `${blockPath}.items`);
      });
    });

    const practiceFields = ['prompt', 'hint', 'answer', 'explanation'];
    if (object(note.practice, `${path}.practice`, practiceFields)) for (const key of practiceFields) string(note.practice[key], `${path}.practice.${key}`);
    if (object(note.quiz, `${path}.quiz`, ['question', 'options', 'answer', 'explanation'])) {
      string(note.quiz.question, `${path}.quiz.question`);
      string(note.quiz.explanation, `${path}.quiz.explanation`);
      strings(note.quiz.options, `${path}.quiz.options`);
      if (!Array.isArray(note.quiz.options) || note.quiz.options.length !== 3 || new Set(note.quiz.options.map(value => typeof value === 'string' ? value.trim() : value)).size !== 3) fail(`${path}.quiz.options`, '必須有 3 個不同選項');
      if (!Number.isInteger(note.quiz.answer) || note.quiz.answer < 0 || note.quiz.answer > 2) fail(`${path}.quiz.answer`, '必須是 0–2 的選項索引');
    }
    if (!Array.isArray(note.references) || note.references.length === 0) fail(`${path}.references`, '至少需要一筆官方來源');
    if (Array.isArray(note.references)) note.references.forEach((reference, referenceIndex) => {
      const referencePath = `${path}.references[${referenceIndex}]`;
      if (!object(reference, referencePath, ['title', 'url'])) return;
      string(reference.title, `${referencePath}.title`);
      try {
        const url = new URL(reference.url);
        if (url.protocol !== 'https:' || url.username || url.password) fail(`${referencePath}.url`, '只接受不含登入資訊的 HTTPS 網址');
      } catch { fail(`${referencePath}.url`, '必須是有效的 HTTPS 網址'); }
    });
  });
  if (errors.length) throw new Error(`內容驗證失敗（${errors.length} 項）：\n${errors.join('\n')}`);
  return notes;
}

export function loadNotes(contentDir) {
  const files = readdirSync(contentDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.json'))
    .map(entry => entry.name).sort();
  const notes = files.map(file => {
    let note;
    try { note = JSON.parse(readFileSync(join(contentDir, file), 'utf8')); }
    catch (error) { throw new Error(`${file}: 無法讀取有效 JSON：${error.message}`); }
    if (note?.slug !== file.slice(0, -5)) throw new Error(`${file}: slug 必須與檔名相同`);
    return note;
  });
  validateNotes(notes);
  return notes.sort((a, b) => a.order - b.order);
}
