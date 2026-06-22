// 予約機能
function applyProductToReservation(){
  const p=products.find(x=>String(x.id)===String(rProduct.value));
  if(!p)return;
  rItem.value=p.name;
  rUnitPrice.value=p.price;
  calcReservationAmount();
}

function selectQuickProduct(id){
  rProduct.value=id;
  applyProductToReservation();
  window.scrollTo({top:80,behavior:'smooth'});
}

function calcReservationAmount(){
  rAmount.value = Number(rUnitPrice.value||0) * Number(rQty.value||1);
}

function addReservation(){
  const data={
    id:Date.now(),date:rDate.value,time:rTime.value,name:rName.value.trim(),item:rItem.value.trim(),
    unitPrice:Number(rUnitPrice.value||0),qty:Number(rQty.value||1),amount:Number(rAmount.value||0),
    status:rStatus.value,note:rNote.value.trim(),updatedAt:new Date().toISOString()
  };
  if(!data.date || !data.name || !data.item){alert('日付・名前・商品名を入力してください');return;}
  reservations.push(data);
  ['rName','rItem','rAmount','rUnitPrice','rTime','rNote'].forEach(id=>document.getElementById(id).value='');
  rProduct.value='';
  rQty.value=1;
  persist();
  toast('予約を保存しました');
}

function removeReservation(id){
  if(!confirm('この予約を削除しますか？'))return;
  reservations=reservations.filter(x=>x.id!==id);
  persist();
}

function reservationHtml(r){
  return `<div class="list-item"><b>${r.date} ${r.time||''}　${escapeHtml(r.name)}</b><br><span>${escapeHtml(r.item)} × ${r.qty}</span><span class="pill">${escapeHtml(r.status)}</span><br><span class="price">${yen(r.amount)}</span><div class="mini">単価 ${yen(r.unitPrice||0)}　${escapeHtml(r.note||'')}</div><button class="danger smallbtn" onclick="removeReservation(${r.id})">削除</button></div>`;
}
