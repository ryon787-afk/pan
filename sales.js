// 売上機能
function saveSale(){
  const data={id:Date.now(),date:sDate.value,amount:Number(sAmount.value||0),weather:sWeather.value,weatherNote:sWeatherNote.value.trim(),event:sEvent.value.trim(),note:sNote.value.trim(),updatedAt:new Date().toISOString()};
  if(!data.date){alert('日付を入力してください');return;}
  sales = sales.filter(x=>x.date!==data.date);
  sales.push(data);
  persist();
  toast('売上を保存しました');
}

function loadSaleForDate(){
  const s=sales.find(x=>x.date===sDate.value);
  if(!s)return;
  sAmount.value=s.amount;
  sWeather.value=s.weather;
  sWeatherNote.value=s.weatherNote||'';
  sEvent.value=s.event||'';
  sNote.value=s.note||'';
}

function removeSale(id){
  if(!confirm('この売上を削除しますか？'))return;
  sales=sales.filter(x=>x.id!==id);
  persist();
}

function saleHtml(s){
  return `<div class="list-item"><b>${s.date}</b><span class="pill">${escapeHtml(s.weather)}</span><br><span class="price">${yen(s.amount)}</span><div class="mini">天気メモ：${escapeHtml(s.weatherNote||'-')}<br>イベント：${escapeHtml(s.event||'-')}<br>備考：${escapeHtml(s.note||'-')}</div><button class="danger smallbtn" onclick="removeSale(${s.id})">削除</button></div>`;
}
