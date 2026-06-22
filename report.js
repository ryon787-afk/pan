// 実績画面
function renderReport(){
  const ym=reportMonth.value;
  const yr=String(reportYear.value||new Date().getFullYear());
  const monthSales=sales.filter(s=>s.date.startsWith(ym));
  const yearSales=sales.filter(s=>s.date.startsWith(yr));
  const monthSum=monthSales.reduce((a,s)=>a+Number(s.amount||0),0);
  const yearSum=yearSales.reduce((a,s)=>a+Number(s.amount||0),0);
  monthTotal.textContent=yen(monthSum);
  monthAvg.textContent=yen(monthSales.length?Math.round(monthSum/monthSales.length):0);
  yearTotal.textContent=yen(yearSum);
  reserveTotal.textContent=reservations.filter(r=>r.date.startsWith(ym)).length+'件';

  const by={};
  monthSales.forEach(s=>{by[s.weather]=(by[s.weather]||{sum:0,count:0});by[s.weather].sum+=Number(s.amount||0);by[s.weather].count++;});
  weatherReport.innerHTML=Object.keys(by).length?Object.entries(by).map(([w,v])=>`<div class="list-item"><b>${escapeHtml(w)}</b>　${v.count}日　平均 ${yen(Math.round(v.sum/v.count))}　合計 ${yen(v.sum)}</div>`).join(''):'<div class="empty">対象月の売上データがありません</div>';

  const pb={};
  reservations.filter(r=>r.date.startsWith(ym)).forEach(r=>{pb[r.item]=(pb[r.item]||{sum:0,qty:0,count:0});pb[r.item].sum+=Number(r.amount||0);pb[r.item].qty+=Number(r.qty||0);pb[r.item].count++;});
  productReport.innerHTML=Object.keys(pb).length?Object.entries(pb).sort((a,b)=>b[1].sum-a[1].sum).map(([name,v])=>`<div class="list-item"><b>${escapeHtml(name)}</b>　予約${v.count}件　数量${v.qty}個<br><span class="price">${yen(v.sum)}</span></div>`).join(''):'<div class="empty">対象月の予約データがありません</div>';
}
