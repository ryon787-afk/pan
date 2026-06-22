// 商品管理
function updateProductSelect(){
  rProduct.innerHTML='<option value="">商品を選択</option>'+products.map(p=>`<option value="${p.id}">${escapeHtml(p.name)} / ${yen(p.price)}</option>`).join('');
  quickProducts.innerHTML=products.length?products.map(p=>`<button onclick="selectQuickProduct(${p.id})"><b>${escapeHtml(p.name)}</b><br><span class="mini">${yen(p.price)} ${escapeHtml(p.note||'')}</span></button>`).join(''):'<div class="empty">商品登録から商品を追加してください</div>';
}

function addProduct(){
  const name=pName.value.trim();
  const price=Number(pPrice.value||0);
  if(!name){alert('商品名を入力してください');return;}
  products.push({id:Date.now(),name,price,note:pNote.value.trim(),updatedAt:new Date().toISOString()});
  pName.value='';
  pPrice.value='';
  pNote.value='';
  persist();
  toast('商品を登録しました');
}

function removeProduct(id){
  if(!confirm('この商品を削除しますか？'))return;
  products=products.filter(x=>x.id!==id);
  persist();
}

function productHtml(p){
  return `<div class="list-item"><b>${escapeHtml(p.name)}</b><br><span class="price">${yen(p.price)}</span><div class="mini">${escapeHtml(p.note||'')}</div><button class="danger smallbtn" onclick="removeProduct(${p.id})">削除</button></div>`;
}
