// 共通関数
const yen = n => '¥' + Number(n||0).toLocaleString('ja-JP');
const today = () => new Date().toLocaleDateString('sv-SE');

function readLocal(key, fallback){
  try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}
  catch(e){return fallback;}
}

function toast(msg,type='ok'){
  const old=document.querySelector('.toast');
  if(old) old.remove();
  const d=document.createElement('div');
  d.className='toast '+(type==='err'?'err':type==='warn'?'warn':'');
  d.textContent=msg;
  document.body.appendChild(d);
  setTimeout(()=>d.remove(),2600);
}

function setSync(text,type='warn'){
  const el=document.getElementById('syncStatus');
  if(!el) return;
  el.textContent=text;
  el.className='sync '+(type==='ok'?'okline':type==='err'?'errline':'warnline');
}

function escapeHtml(str){
  return String(str).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
