let editingReservationId=null;
document.addEventListener('DOMContentLoaded',init);
function dateOffset(base,days){return addDaysLocal(base||today(),days)}
function tomorrow(){return dateOffset(today(),1)}
function normalizeDateValue(v){if(!v)return ''; if(typeof v==='string'){const m=v.match(/^(\d{4}-\d{2}-\d{2})/); if(m)return m[1]; const slash=v.match(/^(\d{4})[\/年](\d{1,2})[\/月](\d{1,2})/); if(slash)return `${slash[1]}-${String(slash[2]).padStart(2,'0')}-${String(slash[3]).padStart(2,'0')}`;} const d=new Date(v); return isNaN(d)?String(v):formatLocalDate(d)}
function sameDate(a,b){return normalizeDateValue(a)===normalizeDateValue(b)}
function init(){setDates();bindNav();bindForms();checkLock();renderAll();registerSW();checkUpdateNotice();}
function setDates(){document.getElementById('todayLabel').textContent=new Date().toLocaleDateString('ja-JP',{year:'numeric',month:'long',day:'numeric',weekday:'long'});['rDate','filterDate','productionDate','saleDate'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=today()});document.getElementById('analyticsMonth').value=today().slice(0,7);document.getElementById('analyticsYear').value=new Date().getFullYear();document.getElementById('versionLabel').textContent=APP_VERSION}
function bindNav(){document.querySelectorAll('.bottom-nav button').forEach(b=>b.onclick=()=>showPage(b.dataset.page));}
function showPage(id){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.getElementById(id).classList.add('active');document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===id));renderAll();}
function bindForms(){document.getElementById('addItemBtn').onclick=()=>addItemRow();document.getElementById('saveReserveBtn').onclick=saveReservation;document.getElementById('cancelEditBtn').onclick=cancelEditReservation;document.getElementById('filterDate').oninput=renderReservations;document.getElementById('filterName').oninput=renderReservations;document.getElementById('productionDate').oninput=renderProduction;document.getElementById('analyticsMonth').oninput=renderAnalytics;document.getElementById('analyticsYear').oninput=renderAnalytics;document.getElementById('saveSaleBtn').onclick=saveSale;document.getElementById('lineProductionBtn').onclick=shareProduction;document.getElementById('printProductionBtn').onclick=()=>window.print();document.getElementById('backupBtn').onclick=backup;document.getElementById('restoreFile').onchange=restore;document.getElementById('savePasswordBtn').onclick=savePassword;document.getElementById('removePasswordBtn').onclick=removePassword;document.getElementById('unlockBtn').onclick=unlock;document.getElementById('forceUpdateBtn').onclick=forceUpdate;document.getElementById('refreshBtn').onclick=forceUpdate;document.getElementById('clearCacheBtn').onclick=clearCaches;document.getElementById('applyUpdateBtn').onclick=applyUpdate;document.getElementById('laterUpdateBtn').onclick=dismissUpdate;document.getElementById('saveProductBtn').onclick=saveProduct;document.getElementById('cancelProductEditBtn').onclick=cancelProductEdit;document.getElementById('resetDefaultProductsBtn').onclick=()=>{addDefaultProducts();renderProducts();toast('定番商品を追加しました')};addItemRow();}
function productOptions(){return state.products.filter(p=>p.active!==false).map(p=>`<option value="${esc(p.id)}">${esc(p.name)} / ${yen(p.price)}</option>`).join('')}
function addItemRow(item={}){const wrap=document.getElementById('itemRows');const div=document.createElement('div');div.className='item-row';div.innerHTML=`<div class="item-grid"><label>商品<select class="itemProduct"><option value="">選択</option>${productOptions()}</select></label><label>個数<input class="itemQty" type="number" min="1" value="${item.qty||1}"></label><label>金額<input class="itemAmount" type="number" min="0" value="${item.amount||0}"></label><button class="ghost removeItem">削除</button></div>`;wrap.appendChild(div);const sel=div.querySelector('.itemProduct');const qty=div.querySelector('.itemQty');const amt=div.querySelector('.itemAmount');if(item.productId)sel.value=item.productId;sel.onchange=()=>{const p=state.products.find(x=>x.id===sel.value);if(p)amt.value=Number(p.price)*Number(qty.value||1)};qty.oninput=()=>{const p=state.products.find(x=>x.id===sel.value);if(p)amt.value=Number(p.price)*Number(qty.value||1)};div.querySelector('.removeItem').onclick=()=>div.remove();}
function collectReservationItems(){return [...document.querySelectorAll('.item-row')].map(r=>{const p=state.products.find(x=>x.id===r.querySelector('.itemProduct').value);return p?{productId:p.id,name:p.name,category:p.category||'',qty:Number(r.querySelector('.itemQty').value||1),amount:Number(r.querySelector('.itemAmount').value||0)}:null}).filter(Boolean)}
function clearReservationForm(options={}){
  const keepDate=options.keepDate!==false;
  const currentDate=document.getElementById('rDate').value||today();
  editingReservationId=null;
  document.getElementById('rDate').value=keepDate?currentDate:today();
  document.getElementById('rName').value='';
  document.getElementById('rTime').value='';
  document.getElementById('rStatus').value='未受取';
  document.getElementById('rNote').value='';
  document.getElementById('itemRows').innerHTML='';
  addItemRow();
  document.getElementById('saveReserveBtn').textContent='予約を保存';
  document.getElementById('cancelEditBtn').classList.add('hidden');
}
function resetReservationAfterSave(){
  clearReservationForm({keepDate:true});
  setTimeout(()=>{
    const nameInput=document.getElementById('rName');
    if(nameInput){nameInput.focus({preventScroll:true});}
  },80);
}
function saveReservation(){const rows=collectReservationItems();if(!rName.value||!rows.length){alert('お客様名と商品を入力してください');return}const data={id:editingReservationId||uid(),date:rDate.value,time:rTime.value,name:rName.value,items:rows,status:rStatus.value,note:rNote.value};if(editingReservationId){const idx=state.reservations.findIndex(r=>r.id===editingReservationId);if(idx>=0)state.reservations[idx]=data;toast('予約内容を変更しました')}else{state.reservations.push(data);toast('保存しました')}persist();resetReservationAfterSave();renderAll();showPage('reservation')}
function editReservation(id){const r=state.reservations.find(x=>x.id===id);if(!r)return;editingReservationId=id;rDate.value=r.date||today();rTime.value=r.time||'';rName.value=r.name||'';rStatus.value=r.status||'未受取';rNote.value=r.note||'';itemRows.innerHTML='';(r.items&&r.items.length?r.items:[{}]).forEach(item=>addItemRow(item));saveReserveBtn.textContent='変更を保存';cancelEditBtn.classList.remove('hidden');showPage('reservation');window.scrollTo({top:0,behavior:'smooth'})}
function cancelEditReservation(){clearReservationForm();toast('編集をキャンセルしました')}
function duplicateReservation(id){const r=state.reservations.find(x=>x.id===id);if(!r)return;const copy=JSON.parse(JSON.stringify(r));copy.id=uid();copy.date=today();copy.status='未受取';state.reservations.push(copy);persist();toast('今日の日付で予約を複製しました');renderAll()}
function renderReservations(){const fd=filterDate.value, fn=filterName.value.trim();const list=state.reservations.filter(r=>(!fd||r.date===fd)&&(!fn||r.name.includes(fn))).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));reserveList.innerHTML=list.map(r=>`<div class="list-card"><b>${esc(r.time||'')} ${esc(r.name)}</b> <span class="status">${esc(r.status)}</span><div class="soft-text">${r.items.map(i=>`${esc(i.name)}×${i.qty}`).join(' / ')}<br>合計 ${yen(r.items.reduce((a,i)=>a+i.amount,0))}</div><select onchange="changeStatus('${r.id}',this.value)"><option ${r.status==='未受取'?'selected':''}>未受取</option><option ${r.status==='受取済み'?'selected':''}>受取済み</option><option ${r.status==='キャンセル'?'selected':''}>キャンセル</option></select><div class="action-grid"><button class="primary small" onclick="editReservation('${r.id}')">編集</button><button class="ghost small" onclick="duplicateReservation('${r.id}')">複製</button><button class="ghost small danger-text" onclick="deleteReservation('${r.id}')">削除</button></div></div>`).join('')||'<p class="soft-text">予約はありません</p>'}
function changeStatus(id,v){const r=state.reservations.find(x=>x.id===id);if(r){r.status=v;persist();renderAll()}}
function deleteReservation(id){if(confirm('削除しますか？')){state.reservations=state.reservations.filter(r=>r.id!==id);persist();renderAll()}}
function productionFor(date){
  const target=normalizeDateValue(date);
  const map={};
  state.reservations
    .filter(r=>sameDate(r.date,target)&&r.status!=='キャンセル')
    .forEach(r=>(r.items||[]).forEach(i=>{
      map[i.name]??={qty:0,category:i.category||'その他',details:[]};
      map[i.name].qty+=Number(i.qty||0);
      map[i.name].details.push(`${r.time||''} ${r.name}：${i.qty}`);
    }));
  return map;
}
function productionHtml(map,emptyText='製造予定はありません'){const entries=Object.entries(map);return entries.map(([name,v])=>`<div class="list-card"><div class="prod-line"><b>${esc(name)}</b><b>${v.qty}個</b></div><div class="prod-detail">${v.details.map(esc).join('<br>')}</div></div>`).join('')||`<p class="soft-text">${emptyText}</p>`;}
function productionSummaryHtml(map,limit=6){const entries=Object.entries(map);return entries.slice(0,limit).map(([n,v])=>`<div class="prod-line"><span>${esc(n)}</span><b>${v.qty}個</b></div><div class="prod-detail home-prod-detail">${v.details.slice(0,3).map(esc).join('<br>')}</div>`).join('')||'<p class="soft-text">製造予定はありません</p>';}
function renderProduction(){
  const d=productionDate.value||today();
  const t=tomorrow();
  productionList.innerHTML=`<p class="soft-text">${d} の予約だけを集計しています</p>`+productionHtml(productionFor(d));
  const tomorrowEl=document.getElementById('productionTomorrowList');
  if(tomorrowEl)tomorrowEl.innerHTML=`<p class="soft-text">${t} の予約だけを集計しています</p>`+productionHtml(productionFor(t),'明日の製造予定はありません');
}
function renderHome(){const d=today();const rs=state.reservations.filter(r=>sameDate(r.date,d));const reserveSales=rs.filter(r=>r.status!=='キャンセル').reduce((a,r)=>a+r.items.reduce((s,i)=>s+i.amount,0),0);const sale=state.sales.find(s=>s.date===d)||{};homeReserveCount.textContent=rs.length+'件';homeReserveSales.textContent=yen(reserveSales);homeShopSales.textContent=yen(sale.shop||0);homeTotalSales.textContent=yen(reserveSales+Number(sale.shop||0));const map=productionFor(d);homeProduction.innerHTML=productionSummaryHtml(map,6);const tomorrowEl=document.getElementById('homeTomorrowProduction');if(tomorrowEl)tomorrowEl.innerHTML=productionSummaryHtml(productionFor(tomorrow()),6);const [yy,mm,dd]=d.split('-').map(Number);const ly=new Date(yy-1,mm-1,dd);const lys=formatLocalDate(ly);const last=state.sales.find(s=>s.date===lys);lastYearBox.innerHTML=last?`${lys}<br>天気：${esc(last.weather||'-')}<br>売上：${yen(last.shop||0)}<br>メモ：${esc(last.memo||'-')}`:'去年の今日のデータはまだありません';}
function saveSale(){const data={date:saleDate.value,shop:Number(shopSale.value||0),weather:weather.value,visitors:Number(visitors.value||0),memo:saleMemo.value};state.sales=state.sales.filter(s=>s.date!==data.date);state.sales.push(data);persist();toast('売上を保存しました');renderAll();}
function renderSales(){salesList.innerHTML=state.sales.sort((a,b)=>b.date.localeCompare(a.date)).map(s=>`<div class="list-card"><b>${s.date}</b><br>販売売上 ${yen(s.shop)} / 天気 ${esc(s.weather||'')}</div>`).join('')||'<p class="soft-text">売上データはありません</p>'}
function weekdayLabel(dateStr){const [y,m,d]=String(dateStr).split('-').map(Number);return new Date(y,(m||1)-1,d||1).toLocaleDateString('ja-JP',{weekday:'short'})}
function productTotalsForReservations(list){const prod={};list.filter(r=>r.status!=='キャンセル').forEach(r=>(r.items||[]).forEach(i=>{prod[i.name]??={qty:0,sales:0};prod[i.name].qty+=Number(i.qty||0);prod[i.name].sales+=Number(i.amount||0)}));return prod}
function dailyAnalysisCard(dateStr){
  const rs=state.reservations.filter(r=>sameDate(r.date,dateStr));
  const validRs=rs.filter(r=>r.status!=='キャンセル');
  const sale=state.sales.find(s=>sameDate(s.date,dateStr))||{};
  const prod=productTotalsForReservations(validRs);
  const reservationSales=validRs.reduce((a,r)=>a+(r.items||[]).reduce((s,i)=>s+Number(i.amount||0),0),0);
  const shop=Number(sale.shop||0);
  const total=reservationSales+shop;
  const memo=String(sale.memo||'').trim();
  const prodLines=Object.entries(prod).sort((a,b)=>b[1].qty-a[1].qty).map(([n,v])=>`<div class="prod-line"><span>${esc(n)} ${v.qty}個</span><b>${yen(v.sales)}</b></div>`).join('')||'<p class="soft-text">予約販売の商品データはありません</p>';
  const top=Object.entries(prod).sort((a,b)=>b[1].qty-a[1].qty)[0];
  return `<div class="daily-analysis-card">
    <div class="daily-analysis-head"><b>${esc(dateStr)}（${weekdayLabel(dateStr)}）</b>${memo?'<span class="badge memo">📝 メモあり！</span>':''}</div>
    <div class="daily-badges">
      <span class="badge">🌤 ${esc(sale.weather||'未入力')}</span>
      <span class="badge">🛒 販売売上 ${yen(shop)}</span>
      <span class="badge">📅 予約 ${validRs.length}件</span>
      <span class="badge">💰 合計 ${yen(total)}</span>
    </div>
    <div class="soft-text">一番売れたパン：${top?`${esc(top[0])} ${top[1].qty}個`:'データなし'}</div>
    <div class="daily-products">${prodLines}</div>
    ${memo?`<details class="memo-box"><summary>メモを読む</summary><div>${esc(memo).replace(/
/g,'<br>')}</div></details>`:''}
  </div>`;
}
function datesInMonth(ym){if(!ym)return[];const [y,m]=ym.split('-').map(Number);const last=new Date(y,m,0).getDate();return Array.from({length:last},(_,i)=>`${y}-${String(m).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`)}
function renderAnalytics(){
  const ym=analyticsMonth.value;
  const monthRs=state.reservations.filter(r=>normalizeDateValue(r.date).startsWith(ym));
  const prod=productTotalsForReservations(monthRs);
  analyticsBox.innerHTML=Object.entries(prod).sort((a,b)=>b[1].sales-a[1].sales).map(([n,v])=>`<div class="prod-line"><span>${esc(n)} ${v.qty}個</span><b>${yen(v.sales)}</b></div>`).join('')||'<p class="soft-text">データはありません</p>';
  const dates=datesInMonth(ym).filter(d=>state.reservations.some(r=>sameDate(r.date,d))||state.sales.some(s=>sameDate(s.date,d)));
  const box=document.getElementById('dailyAnalysisBox');
  if(box)box.innerHTML=dates.length?`<div class="daily-analysis-grid">${dates.map(dailyAnalysisCard).join('')}</div>`:'<p class="soft-text day-empty">対象月の日別データはありません</p>';
}
function shareProduction(){const d=productionDate.value||today();const map=productionFor(d);const text=`${d} 製造リスト\n`+Object.entries(map).map(([n,v])=>`${n} ${v.qty}個`).join('\n');location.href='https://line.me/R/msg/text/?'+encodeURIComponent(text)}
function backup(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='kubochan-pan-backup-'+today()+'.json';a.click();}
function restore(e){const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{const data=JSON.parse(rd.result);Object.assign(state,data);if(!Array.isArray(state.products)||!state.products.length){state.products=withIds(DEFAULT_PRODUCTS)}else{state.products=withIds(state.products)}persist();refreshItemProductOptions();renderAll();toast('復元しました')}catch(err){alert('復元できませんでした')}};rd.readAsText(f)}
function savePassword(){state.settings.password=newPassword.value;persist();toast('パスワードを設定しました')}
function removePassword(){state.settings.password='';persist();toast('パスワードを解除しました')}
function checkLock(){if(state.settings.password)passwordScreen.classList.remove('hidden')}
function unlock(){if(passwordInput.value===state.settings.password)passwordScreen.classList.add('hidden');else alert('パスワードが違います')}

function renderProducts(){
  if(!document.getElementById('productList'))return;
  const list=[...state.products].sort((a,b)=>(a.category||'').localeCompare(b.category||'')||(a.name||'').localeCompare(b.name||''));
  productList.innerHTML=list.map(p=>`<div class="list-card product-card ${p.active===false?'inactive-product':''}"><b>${esc(p.name)}</b> <span class="status">${esc(p.category||'その他')}</span><div class="soft-text">価格 ${yen(p.price)} / ${p.active===false?'非表示':'販売中'}</div><div class="action-grid"><button class="primary small" onclick="editProduct('${p.id}')">編集</button><button class="ghost small" onclick="toggleProductActive('${p.id}')">${p.active===false?'表示':'非表示'}</button><button class="ghost small danger-text" onclick="deleteProduct('${p.id}')">削除</button></div></div>`).join('')||'<p class="soft-text">商品がありません</p>';
}
function clearProductForm(){productEditId.value='';pName.value='';pCategory.value='';pPrice.value='';pActive.value='on';saveProductBtn.textContent='商品を登録';cancelProductEditBtn.classList.add('hidden')}
function saveProduct(){const name=pName.value.trim();if(!name){alert('商品名を入力してください');return}const data={id:productEditId.value||uid(),name,category:pCategory.value.trim()||'その他',price:Number(pPrice.value||0),active:pActive.value!=='off'};const idx=state.products.findIndex(p=>p.id===data.id);if(idx>=0){state.products[idx]=data;toast('商品を変更しました')}else{state.products.push(data);toast('商品を登録しました')}persist();clearProductForm();refreshItemProductOptions();renderAll();showPage('settings')}
function editProduct(id){const p=state.products.find(x=>x.id===id);if(!p)return;productEditId.value=p.id;pName.value=p.name||'';pCategory.value=p.category||'';pPrice.value=p.price||0;pActive.value=p.active===false?'off':'on';saveProductBtn.textContent='商品を変更';cancelProductEditBtn.classList.remove('hidden');showPage('settings');setTimeout(()=>pName.scrollIntoView({behavior:'smooth',block:'center'}),50)}
function cancelProductEdit(){clearProductForm();toast('商品編集をキャンセルしました')}
function toggleProductActive(id){const p=state.products.find(x=>x.id===id);if(!p)return;p.active=p.active===false;persist();refreshItemProductOptions();renderProducts();toast(p.active?'予約選択に表示しました':'予約選択から非表示にしました')}
function deleteProduct(id){const p=state.products.find(x=>x.id===id);if(!p)return;if(!confirm(`${p.name} を削除しますか？\n過去の予約データは残ります。`))return;state.products=state.products.filter(x=>x.id!==id);persist();refreshItemProductOptions();renderProducts();toast('商品を削除しました')}
function refreshItemProductOptions(){document.querySelectorAll('.itemProduct').forEach(sel=>{const current=sel.value;sel.innerHTML='<option value="">選択</option>'+productOptions();if([...sel.options].some(o=>o.value===current))sel.value=current;})}

function renderAll(){renderHome();renderReservations();renderProduction();renderSales();renderAnalytics();renderProducts()}
function toast(msg){const el=document.createElement('div');el.className='update-card';el.innerHTML=`<div class="update-icon">✅</div><div><b>${esc(msg)}</b></div>`;document.body.appendChild(el);setTimeout(()=>el.remove(),1600)}
async function registerSW(){if('serviceWorker'in navigator){try{await navigator.serviceWorker.register('service-worker.js?v='+APP_VERSION)}catch(e){}}}
async function clearCaches(){if('caches'in window){const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)))}localStorage.setItem(APP_KEYS.update,JSON.stringify({lastDismiss:Date.now(),version:APP_VERSION}));toast('キャッシュを削除しました')}
async function forceUpdate(){await clearCaches();location.href=location.pathname+'?v='+Date.now()}
function dismissUpdate(){saveJSON(APP_KEYS.update,{lastDismiss:Date.now(),version:APP_VERSION});updateNotice.classList.add('hidden')}
function applyUpdate(){dismissUpdate();forceUpdate()}
function checkUpdateNotice(){const info=loadJSON(APP_KEYS.update,{lastDismiss:0,version:''});const eight=8*60*60*1000;if(Date.now()-Number(info.lastDismiss||0)<eight&&info.version===APP_VERSION)return; if(info.version&&info.version!==APP_VERSION){updateText.textContent=`Ver.${APP_VERSION} を取得できます。`;updateNotice.classList.remove('hidden')} saveJSON(APP_KEYS.update,{lastDismiss:Date.now(),version:APP_VERSION});}
