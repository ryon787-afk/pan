// ★ここにApps ScriptのWebアプリURLを入れてください
const GAS_URL = "https://script.google.com/macros/s/AKfycbyFvv%7CtuhnpViipxC_vhTtWk5REmQEF-Xgdo0U9WAM4fMzVXrn31Zk630qjtgoG/exec";

const yen = n => '¥' + Number(n||0).toLocaleString('ja-JP');
const today = () => new Date().toISOString().slice(0,10);
const $ = id => document.getElementById(id);
let reservations = [];
let sales = [];
let products = [];

const defaultProducts = [
  {name:'贅沢ミルク食パン',price:700,note:''},
  {name:'ベーグルサンド',price:370,note:''},
  {name:'クロワッサン',price:300,note:''},
  {name:'あんバター',price:330,note:''},
  {name:'あんフロマージュ',price:330,note:''},
  {name:'ミルク屋さんのメロンパン',price:250,note:''},
  {name:'ミルク屋さんのクリームパン',price:250,note:''},
  {name:'ツナチーズベーグル',price:250,note:''},
  {name:'ブルーベリーチーズベーグル',price:250,note:''},
  {name:'チョコカスタードベーグル',price:250,note:''},
  {name:'まんまるあんぱん',price:250,note:''},
  {name:'明太ベーコンエピ',price:250,note:''},
  {name:'明太フランス',price:250,note:''},
  {name:'塩バターベーグル',price:250,note:''},
  {name:'ごほうびチーズケーキ',price:450,note:''}
];

function isGasReady(){return GAS_URL && GAS_URL.startsWith('https://script.google.com/');}
function setStatus(text){$('syncStatus').textContent = text;}
async function api(action, payload={}){
  if(!isGasReady()) throw new Error('Apps Script URLが未設定です');
  const res = await fetch(GAS_URL, {method:'POST', body: JSON.stringify({action, ...payload})});
  const json = await res.json();
  if(!json.ok) throw new Error(json.error || '保存に失敗しました');
  return json;
}

async function loadAll(){
  if(!isGasReady()){
    setStatus('共有モード：Apps Script URL未設定');
    products = defaultProducts;
    render();
    return;
  }
  try{
    setStatus('共有データを読み込み中...');
    const json = await api('list');
    reservations = json.reservations || [];
    sales = json.sales || [];
    products = (json.products && json.products.length) ? json.products : defaultProducts;
    setStatus('共有モード：接続中');
    render();
  }catch(err){
    setStatus('共有エラー：' + err.message);
    alert('読み込みエラー：' + err.message);
    products = defaultProducts;
    render();
  }
}

function showTab(id, btn){
  document.querySelectorAll('.tab').forEach(x=>x.classList.add('hidden'));
  $(id).classList.remove('hidden');
  document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');
  render();
}
function updateProductSelect(){
  $('rProduct').innerHTML='<option value="">商品を選択</option>'+products.map((p,i)=>`<option value="${i}">${escapeHtml(p.name)} / ${yen(p.price)}</option>`).join('');
  $('quickProducts').innerHTML=products.length?products.map((p,i)=>`<button type="button" onclick="selectQuickProduct(${i})"><b>${escapeHtml(p.name)}</b><br><span class="mini">${yen(p.price)} ${escapeHtml(p.note||'')}</span></button>`).join(''):'<div class="empty">商品登録から商品を追加してください</div>';
}
function applyProductToReservation(){
  const p=products[Number($('rProduct').value)];
  if(!p)return;
  $('rItem').value=p.name;
  $('rUnitPrice').value=p.price;
  calcReservationAmount();
}
function selectQuickProduct(i){$('rProduct').value=i;applyProductToReservation();window.scrollTo({top:80,behavior:'smooth'});}
function calcReservationAmount(){$('rAmount').value = Number($('rUnitPrice').value||0) * Number($('rQty').value||1);}
async function addReservation(){
  const data={date:$('rDate').value,time:$('rTime').value,name:$('rName').value.trim(),item:$('rItem').value.trim(),unitPrice:Number($('rUnitPrice').value||0),qty:Number($('rQty').value||1),amount:Number($('rAmount').value||0),status:$('rStatus').value,note:$('rNote').value.trim()};
  if(!data.date || !data.name || !data.item){alert('日付・お客様名・商品名を入力してください');return;}
  try{
    await api('addReservation', data);
    ['rName','rItem','rAmount','rUnitPrice','rTime','rNote'].forEach(id=>$(id).value='');
    $('rProduct').value=''; $('rQty').value=1;
    await loadAll();
    alert('予約を保存しました');
  }catch(err){alert('保存エラー：' + err.message);}
}
async function saveSale(){
  const data={date:$('sDate').value,amount:Number($('sAmount').value||0),weather:$('sWeather').value,weatherNote:$('sWeatherNote').value.trim(),event:$('sEvent').value.trim(),note:$('sNote').value.trim()};
  if(!data.date){alert('日付を入力してください');return;}
  try{await api('saveSale', data); await loadAll(); alert('売上を保存しました');}catch(err){alert('保存エラー：' + err.message);}
}
async function addProduct(){
  const data={name:$('pName').value.trim(),price:Number($('pPrice').value||0),note:$('pNote').value.trim()};
  if(!data.name){alert('商品名を入力してください');return;}
  try{await api('addProduct', data); $('pName').value='';$('pPrice').value='';$('pNote').value=''; await loadAll(); alert('商品を登録しました');}catch(err){alert('保存エラー：' + err.message);}
}
function reservationHtml(r){return `<div class="list-item"><b>${r.date} ${r.time||''}　${escapeHtml(r.name)}</b><br><span>${escapeHtml(r.item)} × ${r.qty}</span><span class="pill">${r.status}</span><br><span class="price">${yen(r.amount)}</span><div class="mini">単価 ${yen(r.unitPrice||0)}　${escapeHtml(r.note||'')}</div></div>`}
function saleHtml(s){return `<div class="list-item"><b>${s.date}</b><span class="pill">${s.weather}</span><br><span class="price">${yen(s.amount)}</span><div class="mini">天気メモ：${escapeHtml(s.weatherNote||'-')}<br>イベント：${escapeHtml(s.event||'-')}<br>備考：${escapeHtml(s.note||'-')}</div></div>`}
function productHtml(p){return `<div class="list-item"><b>${escapeHtml(p.name)}</b><br><span class="price">${yen(p.price)}</span><div class="mini">${escapeHtml(p.note||'')}</div></div>`}
function render(){
  updateProductSelect();
  const t=today();
  const todaysR=reservations.filter(r=>r.date===t).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
  const todaySale=sales.find(s=>s.date===t)||{};
  $('todayReserveCount').textContent=todaysR.length+'件';
  $('todaySales').textContent=yen(todaySale.amount);
  $('todayReserveAmount').textContent=yen(todaysR.reduce((a,r)=>a+Number(r.amount||0),0));
  $('todayWeather').textContent=todaySale.weather||'未入力';
  $('todayReservations').innerHTML=todaysR.length?todaysR.map(reservationHtml).join(''):'<div class="empty">今日の予約はまだありません</div>';
  const fd=$('filterDate').value;
  const list=reservations.filter(r=>!fd||r.date===fd).sort((a,b)=>(b.date+(b.time||'')).localeCompare(a.date+(a.time||'')));
  $('reservationList').innerHTML=list.length?list.map(reservationHtml).join(''):'<div class="empty">予約がありません</div>';
  const sl=[...sales].sort((a,b)=>b.date.localeCompare(a.date));
  $('salesList').innerHTML=sl.length?sl.map(saleHtml).join(''):'<div class="empty">売上データがありません</div>';
  $('productList').innerHTML=products.length?products.map(productHtml).join(''):'<div class="empty">商品がありません</div>';
  renderReport();
}
function renderReport(){
  const ym=$('reportMonth').value; const yr=String($('reportYear').value||new Date().getFullYear());
  const monthSales=sales.filter(s=>s.date.startsWith(ym)); const yearSales=sales.filter(s=>s.date.startsWith(yr));
  const monthSum=monthSales.reduce((a,s)=>a+Number(s.amount||0),0); const yearSum=yearSales.reduce((a,s)=>a+Number(s.amount||0),0);
  $('monthTotal').textContent=yen(monthSum); $('monthAvg').textContent=yen(monthSales.length?Math.round(monthSum/monthSales.length):0); $('yearTotal').textContent=yen(yearSum); $('reserveTotal').textContent=reservations.filter(r=>r.date.startsWith(ym)).length+'件';
  const by={}; monthSales.forEach(s=>{by[s.weather]=(by[s.weather]||{sum:0,count:0});by[s.weather].sum+=Number(s.amount||0);by[s.weather].count++;});
  $('weatherReport').innerHTML=Object.keys(by).length?Object.entries(by).map(([w,v])=>`<div class="list-item"><b>${w}</b>　${v.count}日　平均 ${yen(Math.round(v.sum/v.count))}　合計 ${yen(v.sum)}</div>`).join(''):'<div class="empty">対象月の売上データがありません</div>';
  const pb={}; reservations.filter(r=>r.date.startsWith(ym)).forEach(r=>{pb[r.item]=(pb[r.item]||{sum:0,qty:0,count:0});pb[r.item].sum+=Number(r.amount||0);pb[r.item].qty+=Number(r.qty||0);pb[r.item].count++;});
  $('productReport').innerHTML=Object.keys(pb).length?Object.entries(pb).sort((a,b)=>b[1].sum-a[1].sum).map(([name,v])=>`<div class="list-item"><b>${escapeHtml(name)}</b>　予約${v.count}件　数量${v.qty}個<br><span class="price">${yen(v.sum)}</span></div>`).join(''):'<div class="empty">対象月の予約データがありません</div>';
}
function escapeHtml(str){return String(str).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

document.addEventListener('DOMContentLoaded',()=>{
  $('todayText').textContent = new Date().toLocaleDateString('ja-JP',{year:'numeric',month:'long',day:'numeric',weekday:'long'});
  ['rDate','sDate','filterDate'].forEach(id=>$(id).value=today());
  $('reportMonth').value=today().slice(0,7); $('reportYear').value=new Date().getFullYear();
  document.querySelectorAll('.tabs button').forEach(btn=>btn.addEventListener('click',()=>showTab(btn.dataset.tab,btn)));
  $('rProduct').addEventListener('change',applyProductToReservation); $('rUnitPrice').addEventListener('input',calcReservationAmount); $('rQty').addEventListener('input',calcReservationAmount);
  $('filterDate').addEventListener('input',render); $('reportMonth').addEventListener('input',renderReport); $('reportYear').addEventListener('input',renderReport);
  $('addReservationBtn').addEventListener('click',addReservation); $('saveSaleBtn').addEventListener('click',saveSale); $('addProductBtn').addEventListener('click',addProduct); $('reloadBtn').addEventListener('click',loadAll);
  if('serviceWorker' in navigator){navigator.serviceWorker.register('service-worker.js').catch(()=>{});} loadAll(); setInterval(loadAll,30000);
});
