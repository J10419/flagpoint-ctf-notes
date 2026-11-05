import {filterNotes,decodeBase64,gradeQuiz} from './core.mjs';
document.querySelectorAll('[data-enhanced]').forEach(el=>{el.hidden=false;});
const cards=[...document.querySelectorAll('[data-note]')];
const search=document.querySelector('#note-search');
if(search){
  let category='all';
  const entries=cards.map((el)=>({el,category:el.dataset.category,text:el.dataset.search}));
  function refresh(){
    const visible=new Set(filterNotes(entries,search.value,category).map(x=>x.el));
    cards.forEach(el=>{el.hidden=!visible.has(el);});
    document.querySelector('#result-count').textContent=`共 ${visible.size} 篇筆記`;
    document.querySelector('#empty-state').hidden=visible.size!==0;
    document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));
  }
  search.addEventListener('input',refresh);
  document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.filter;refresh();}));
  document.querySelector('#reset-filters').addEventListener('click',()=>{search.value='';category='all';refresh();search.focus();});
}
document.querySelector('#decoder-form')?.addEventListener('submit',event=>{
  event.preventDefault();const output=document.querySelector('#decoder-output');
  try{output.textContent=decodeBase64(document.querySelector('#base64-input').value);output.classList.remove('is-error');}
  catch(error){output.textContent=error.message;output.classList.add('is-error');}
});
document.querySelectorAll('[data-quiz]').forEach(form=>{
  form.addEventListener('change',()=>{form.querySelector('.quiz-feedback').textContent='';form.querySelector('.quiz-explanation').hidden=true;});
  form.addEventListener('submit',event=>{
    event.preventDefault();const selected=form.querySelector('input:checked');const feedback=form.querySelector('.quiz-feedback');
    if(!selected){feedback.textContent='請先選擇一個答案。';return;}
    const correct=gradeQuiz(Number(selected.value),Number(form.dataset.answer));
    feedback.textContent=correct?'答對了！你已掌握這個觀念。':'再想一下：可以回到概念段落，或參考下方說明。';
    form.querySelector('.quiz-explanation').hidden=false;
  });
});
