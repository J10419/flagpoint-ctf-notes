export function filterNotes(notes, query = '', category = 'all') {
  const needle=query.trim().toLocaleLowerCase();
  const labels={start:'入門起步',encoding:'編碼解碼',web:'Web 基礎'};
  return notes.filter(note=>(category==='all'||note.category===category)&&`${note.title||''} ${note.summary||''} ${note.text||''} ${labels[note.category]||note.category||''}`.toLocaleLowerCase().includes(needle));
}
export function decodeBase64(text) {
  if(typeof text!=='string'||text.length>4096) throw new Error('請將輸入控制在 4,096 字元以內。');
  const input=text.replace(/[\t\n\r ]/g,'');
  if(!input) throw new Error('請先輸入 Base64 線索。');
  if(!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(input)) throw new Error('格式不正確：請使用標準 Base64 字元及完整的 = 補位。');
  const binary=atob(input);
  if(btoa(binary)!==input) throw new Error('格式不正確：Base64 的補位位元必須為零。');
  try {return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(binary,c=>c.charCodeAt(0)));}
  catch {throw new Error('解碼結果不是有效的 UTF-8 文字；Base64 也可以表示圖片或其他二進位資料。');}
}
export const gradeQuiz=(index,correct)=>Number.isInteger(index)&&index===correct;
