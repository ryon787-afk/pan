// 画面表示
function showTab(id, btn){
  document.querySelectorAll('.tab').forEach(x=>x.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');
  render();
}

function render(){
  updateProductSelect();
  const t=today();
  const todaysR=reservations.filter(r=>r.date===t).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
  const todaySale=sales.find(s=>s.date===t)||{};
  todayReserveCount.textContent=todaysR.length+'件';
  todaySales.textContent=yen(todaySale.amount);
  todayReserveAmount.textContent=yen(todaysR.reduce((a,r)=>a+Number(r.amount||0),0));
  todayWeather.textContent=todaySale.weather||'未入力';
  todayReservations.innerHTML=todaysR.length?todaysR.map(reservationHtml).join(''):'<div class="empty">今日の予約はまだありません</div>';

  const fd=filterDate.value;
  const list=reservations.filter(r=>!fd||r.date===fd).sort((a,b)=>(b.date+(b.time||'')).localeCompare(a.date+(a.time||'')));
  reservationList.innerHTML=list.length?list.map(reservationHtml).join(''):'<div class="empty">予約がありません</div>';

  const sl=[...sales].sort((a,b)=>b.date.localeCompare(a.date));
  salesList.innerHTML=sl.length?sl.map(saleHtml).join(''):'<div class="empty">売上データがありません</div>';
  productList.innerHTML=products.length?products.map(productHtml).join(''):'<div class="empty">商品がありません</div>';
  renderReport();
}
