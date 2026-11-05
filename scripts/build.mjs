import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, copyFileSync } from 'node:fs';
import { dirname, resolve, join, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadNotes } from './validate.mjs';

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const categories = { start: '入門起步', encoding: '編碼解碼', web: 'Web 基礎' };
export const escapeHTML = (text) => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e = escapeHTML;
const mark = '<span class="brand-mark" aria-hidden="true">⚑</span>';
function shell(title, description, body, prefix = '', active = 'home') {
  return `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${e(description)}"><meta name="theme-color" content="#172c3b"><title>${e(title)}｜旗點 Flagpoint</title><link rel="icon" href="${prefix}assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${prefix}assets/style.css"><script type="module" src="${prefix}assets/app.mjs"></script></head>
<body><a class="skip-link" href="#main">跳至主要內容</a>
<header class="site-header"><div class="container header-inner"><a class="brand" href="${prefix}index.html" aria-label="旗點首頁">${mark}<span>旗點 <small>FLAGPOINT</small></span></a><nav aria-label="主要導覽"><a href="${prefix}index.html#notes" ${active === 'note' ? 'aria-current="page"' : ''}>探索筆記</a><a href="${prefix}index.html#path">學習路線</a><a href="${prefix}index.html#method">關於旗點</a></nav><span class="header-label">CTF FIELD NOTES / 入門篇</span></div></header>
${body}
<footer class="site-footer"><div class="container footer-inner"><a class="brand" href="${prefix}index.html">${mark}<span>旗點 <small>FLAGPOINT</small></span></a><p>從第一個線索，到第一面旗。<br><small>原創教學示例 · 僅在本地或明確授權的環境練習</small></p><a href="#main">回到頂端 ↑</a></div></footer></body></html>\n`;
}
function card(n, i) {
  return `<article class="note-card" data-note data-category="${e(n.category)}" data-search="${e(`${n.title} ${n.summary} ${categories[n.category]}`)}"><div class="card-top"><span class="note-number">${String(i+1).padStart(2,'0')}</span><span class="tag tag-${n.category}">${categories[n.category]}</span></div><h3><a href="notes/${n.slug}.html">${e(n.title)}</a></h3><p>${e(n.summary)}</p><div class="card-bottom"><span>入門 · 約 ${n.minutes} 分鐘</span><a href="notes/${n.slug}.html" aria-label="閱讀：${e(n.title)}">閱讀筆記 <span aria-hidden="true">↗</span></a></div></article>`;
}
function homepage(notes) {
  return shell('CTF 初學者筆記站', '繁體中文 CTF 初學者筆記。從觀察線索、辨認編碼到讀懂 HTTP，用短篇筆記與本地練習跨出第一步。', `<main id="main">
<section class="hero container" aria-labelledby="hero-title"><div class="hero-copy"><div class="eyebrow"><span class="small-dot"></span> 給第一次接觸資安的你</div><h1 id="hero-title">拆解線索，<br>留下你的<span class="underline">第一面旗。</span></h1><p class="hero-description">不用一開始就懂所有工具。<br>一次讀懂一個觀念，再用一個小練習驗證。</p><div class="hero-actions"><a class="button primary" href="notes/${notes[0].slug}.html">從第一篇開始 <span aria-hidden="true">↗</span></a><a class="text-link" href="#notes">瀏覽全部筆記 ↓</a></div><div class="hero-meta"><span><b>${String(notes.length).padStart(2,'0')}</b> 篇起步筆記</span><span><b>0</b> 付費工具需求</span><span><b>100%</b> 瀏覽器內練習</span></div></div>
<div class="field-note" aria-label="從線索到旗標的示範"><div class="field-note-head"><span>FIELD NOTE / 001</span><span class="status-dot">練習模式</span></div><div class="terminal"><div class="terminal-top"><i></i><i></i><i></i><span>first-clue.txt</span></div><p class="terminal-comment"># 每面旗，都從一個問題開始。</p><p><span class="prompt">❯</span> observe the clue</p><div class="clue">ZmxhZ3tmaXJzdF9zdGVwfQ==</div><div class="decode-line"><span></span> Base64 解碼 <span></span></div><p class="flag-result">⚑ flag{first_step}</p><p class="terminal-comment"># 看懂過程，比記住答案更重要。</p></div><div class="field-note-caption"><span>01 觀察 → 02 假設 → 03 驗證</span><span class="handwritten">從這裡開始 ↗</span></div></div></section>
<section id="path" class="path-section"><div class="container path-inner"><div><span class="eyebrow">YOUR FIRST ROUTE</span><h2>先走一條短路線。</h2></div><ol class="route">${notes.slice(0,3).map((n,i)=>`<li><span class="route-number">${String(i+1).padStart(2,'0')}</span><a href="notes/${n.slug}.html">${e(categories[n.category])}<span>${e(n.title)}</span></a></li>`).join('')}</ol></div></section>
<section id="notes" class="container notes-section"><div class="section-heading"><div><span class="eyebrow">THE NOTEBOOK</span><h2>把「不懂」變成一頁筆記。</h2></div><p>短篇觀念、可重現的例子、能自己核對的答案。</p></div>
<div class="filter-bar" data-enhanced hidden><div class="filter-buttons" role="group" aria-label="依筆記分類篩選"><button type="button" data-filter="all" aria-pressed="true">全部筆記 <span>${notes.length}</span></button>${Object.entries(categories).map(([key,label])=>`<button type="button" data-filter="${key}" aria-pressed="false">${label}</button>`).join('')}</div><div class="search-wrap"><label for="note-search">搜尋筆記</label><input id="note-search" type="search" placeholder="搜尋觀念，例如 Base64" autocomplete="off"></div></div><p class="result-count" id="result-count" role="status" data-enhanced hidden>共 ${notes.length} 篇筆記</p><div class="notes-grid">${notes.map(card).join('')}</div><div id="empty-state" class="empty-state" hidden><h3>還沒有符合的筆記。</h3><p>試試「編碼」或「HTTP」，或清除搜尋與分類。</p><button type="button" class="button secondary" id="reset-filters">顯示全部筆記</button></div><noscript><p class="notice">目前未啟用 JavaScript；所有筆記仍可閱讀，搜尋功能需啟用 JavaScript。</p></noscript></section>
<section id="method" class="container method-section"><div><span class="eyebrow">LEARN. TRY. WRITE.</span><h2>不是背答案，<br>是留下下次能用的方法。</h2><p>旗點是一份會長大的學習筆記。每篇都沿用相同結構，讓你知道從哪裡開始，也知道如何確認自己真的理解。</p></div><ol class="method-list"><li><span>01</span><div><h3>先理解</h3><p>用白話建立觀念，知道線索代表什麼。</p></div></li><li><span>02</span><div><h3>動手驗證</h3><p>只用原創本地範例；卡住時，先看提示。</p></div></li><li><span>03</span><div><h3>寫下發現</h3><p>用自我檢查與官方來源，修正自己的理解。</p></div></li></ol></section></main>`);
}
function block(b) {
  if(b.type==='paragraph') return `<p>${e(b.text)}</p>`;
  if(b.type==='list') return `<ul>${b.items.map(x=>`<li>${e(x)}</li>`).join('')}</ul>`;
  if(b.type==='code') return `<div class="code-block"><span class="code-label">${e(b.language)}</span><pre><code>${e(b.text)}</code></pre></div>`;
  if(b.type==='callout') return `<aside class="callout"><h3>${e(b.title)}</h3><p>${e(b.text)}</p></aside>`;
  throw new Error(`Unsupported block: ${b.type}`);
}
const lab = `<div class="lab" data-enhanced hidden><div class="eyebrow">LOCAL LAB / 本地實驗</div><h3>試著解開這段線索</h3><p>只接受標準 Base64 編碼的 UTF-8 文字（最多 4,096 字元，空白會忽略）。所有運算留在此瀏覽器，不傳送輸入。</p><form id="decoder-form"><label for="base64-input">Base64 線索</label><textarea id="base64-input" rows="2" maxlength="4096" spellcheck="false">ZmxhZ3tmaXJzdF9zdGVwfQ==</textarea><button class="button primary" type="submit">解碼線索 ↗</button><p id="decoder-output" class="lab-output" role="status" aria-live="polite">輸入線索後，按下解碼。</p></form></div>`;
function article(n, notes) {
  const index=notes.findIndex(x=>x.slug===n.slug);
  const toc=[...n.sections.map(s=>[s.id,s.title]),['practice','動手練習'],['check','自我檢查'],['references','參考來源']];
  return shell(n.title,n.summary,`<main id="main" class="container article-main"><nav class="breadcrumb" aria-label="麵包屑"><a href="../index.html">首頁</a><span aria-hidden="true">/</span><a href="../index.html#notes">${categories[n.category]}</a><span aria-hidden="true">/</span><span>筆記 ${String(index+1).padStart(2,'0')}</span></nav><header class="article-header"><div class="eyebrow">FIELD NOTE / ${String(index+1).padStart(3,'0')} <span class="tag tag-${n.category}">${categories[n.category]}</span></div><h1>${e(n.title)}</h1><p class="article-summary">${e(n.summary)}</p><div class="article-meta"><span>難度：入門</span><span>約 ${n.minutes} 分鐘</span><span>更新 <time datetime="${n.updated}">${n.updated}</time></span></div></header><div class="article-layout"><aside class="toc"><nav aria-label="本篇目錄"><p class="eyebrow">ON THIS PAGE</p><h2>這篇筆記</h2><ol>${toc.map(([id,title])=>`<li><a href="#${id}">${e(title)}</a></li>`).join('')}</ol></nav><p class="toc-note">先自己試一次，<br>再展開提示與答案。</p></aside><article class="article-body"><section class="objectives" aria-labelledby="objectives-title"><h2 id="objectives-title">讀完這篇，你可以</h2><ul>${n.objectives.map(x=>`<li>${e(x)}</li>`).join('')}</ul><p><strong>先備知識</strong> ${e(n.prerequisites.join('；'))}</p></section>${n.sections.map(s=>`<section id="${s.id}" class="lesson-section"><h2>${e(s.title)}</h2>${s.blocks.map(block).join('')}${s.id==='walkthrough'&&n.lab==='base64'?lab:''}</section>`).join('')}
<section id="practice" class="lesson-section"><span class="eyebrow">YOUR TURN</span><h2>動手練習</h2><p>${e(n.practice.prompt)}</p><details><summary>需要一點提示？</summary><p>${e(n.practice.hint)}</p></details><details><summary>核對答案與解題思路</summary><pre><code>${e(n.practice.answer)}</code></pre><p>${e(n.practice.explanation)}</p></details></section>
<section id="check" class="lesson-section"><h2>自我檢查</h2><form class="quiz" data-quiz data-answer="${n.quiz.answer}"><fieldset><legend>${e(n.quiz.question)}</legend>${n.quiz.options.map((o,i)=>`<label class="quiz-option"><input type="radio" name="quiz-answer" value="${i}"><span>${e(o)}</span></label>`).join('')}</fieldset><button class="button primary" type="submit" data-enhanced hidden>確認答案</button><p class="quiz-feedback" role="status" aria-live="polite"></p><p class="quiz-explanation" hidden>${e(n.quiz.explanation)}</p></form><noscript><details><summary>顯示自我檢查答案</summary><p>${e(n.quiz.options[n.quiz.answer])}。${e(n.quiz.explanation)}</p></details></noscript></section>
<section id="references" class="lesson-section references"><h2>參考來源</h2><p>本文例子為原創教學示範；以下官方文件用來核對技術觀念。</p><ul>${n.references.map(r=>`<li><a href="${e(r.url)}">${e(r.title)} ↗</a></li>`).join('')}</ul></section><nav class="article-pagination" aria-label="文章導覽">${index>0?`<a href="${notes[index-1].slug}.html"><small>← 上一篇</small>${e(notes[index-1].title)}</a>`:'<a href="../index.html#notes">← 返回全部筆記</a>'}${index<notes.length-1?`<a class="next-note" href="${notes[index+1].slug}.html"><small>繼續下一篇 →</small>${e(notes[index+1].title)}</a>`:'<a class="next-note" href="../index.html#notes">已完成這條起步路線 ⚑<small>回到筆記目錄 →</small></a>'}</nav></article></div></main>`, '../','note');
}
export function build({root=projectRoot,outDir=join(root,'docs'),contentDir=join(root,'content','notes')}={}) {
  root=resolve(root);outDir=resolve(outDir);contentDir=resolve(contentDir);
  const within=(child,parent)=>{const rel=relative(parent,child);return rel===''||(!rel.startsWith('..')&&!isAbsolute(rel));};
  const protectedPaths=[contentDir,...['content','src','scripts','templates','tests','evidence'].map(name=>join(root,name))];
  if(within(root,outDir)||protectedPaths.some(path=>within(outDir,path)||within(path,outDir))) throw new Error('輸出目錄不可與專案根目錄或來源目錄重疊');
  const notes=loadNotes(contentDir).sort((a,b)=>a.order-b.order);
  if(!notes.length) throw new Error('至少需要一篇筆記');
  mkdirSync(join(outDir,'notes'),{recursive:true}); mkdirSync(join(outDir,'assets'),{recursive:true});
  // Only remove obsolete generated article HTML, never source files or arbitrary directories.
  for(const name of readdirSync(join(outDir,'notes'))) if(/^[a-z0-9]+(?:-[a-z0-9]+)*\.html$/.test(name)&&!notes.some(n=>`${n.slug}.html`===name)) unlinkSync(join(outDir,'notes',name));
  writeFileSync(join(outDir,'index.html'),homepage(notes));
  for(const n of notes) writeFileSync(join(outDir,'notes',`${n.slug}.html`),article(n,notes));
  for(const name of readdirSync(join(root,'src','assets'))) copyFileSync(join(root,'src','assets',name),join(outDir,'assets',name));
  writeFileSync(join(outDir,'.nojekyll'),'');
  return {notes,outDir};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const result=build();console.log(`Built ${result.notes.length} notes → ${result.outDir}`);}
