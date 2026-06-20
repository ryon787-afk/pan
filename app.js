const STORAGE_KEY = 'bakeryAppDataV2';
const today = () => new Date().toISOString().slice(0, 10);
const yen = value => `${Number(value || 0).toLocaleString()}円`;

let data = loadData();

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  return {
    products: [
      { id: crypto.randomUUID(), name: '食パン', price: 320, category: '食パン' },
      { id: crypto.randomUUID(), name: 'あんぱん', price: 180, category: '菓子パン' },
      { id: crypto.randomUUID(), name: 'クロワッサン', price: 260, category: 'デニッシュ' }
    ],
    reservations: [],
    sales: []
  };
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  render();
}

function setDefaultDates() {
  reservationDate.value = today();
  salesDate.value = today();
}

function switchScreen(id) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.screen === id));
  document.querySelectorAll('.screen').forEach(screen => screen.classList.toggle('active-screen', screen.id === id));
}

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => switchScreen(tab.dataset.screen)));

productForm.addEventListener('submit', event => {
  event.preventDefault();
  data.products.push({
    id: crypto.randomUUID(),
    name: productName.value.trim(),
    price: Number(productPrice.value),
    category: productCategory.value.trim()
  });
  productForm.reset();
  saveData();
});

reservationForm.addEventListener('submit', event => {
  event.preventDefault();
  const product = data.products.find(item => item.id === reservationProduct.value);
  if (!product) return;
  const quantity = Number(reservationQuantity.value);
  data.reservations.push({
    id: crypto.randomUUID(),
    date: reservationDate.value,
    customerName: customerName.value.trim(),
    productId: product.id,
    productName: product.name,
    unitPrice: product.price,
    quantity,
    total: product.price * quantity,
    pickupTime: pickupTime.value,
    status: reservationStatus.value,
    note: reservationNote.value.trim()
  });
  reservationForm.reset();
  setDefaultDates();
  updateReservationPreview();
  saveData();
});

salesForm.addEventListener('submit', event => {
  event.preventDefault();
  const existing = data.sales.find(item => item.date === salesDate.value);
  const payload = {
    id: existing?.id || crypto.randomUUID(),
    date: salesDate.value,
    amount: Number(salesAmount.value),
    weather: weather.value,
    weatherNote: weatherNote.value.trim(),
    note: salesNote.value.trim()
  };
  if (existing) Object.assign(existing, payload); else data.sales.push(payload);
  salesForm.reset();
  setDefaultDates();
  saveData();
});

function deleteItem(type, id) {
  data[type] = data[type].filter(item => item.id !== id);
  saveData();
}

function updateReservationPreview() {
  const product = data.products.find(item => item.id === reservationProduct.value);
  const quantity = Number(reservationQuantity.value || 0);
  reservationTotalPreview.textContent = yen(product ? product.price * quantity : 0);
}
reservationProduct.addEventListener('change', updateReservationPreview);
reservationQuantity.addEventListener('input', updateReservationPreview);

function renderProductSelect() {
  reservationProduct.innerHTML = data.products.map(product => `<option value="${product.id}">${escapeHtml(product.name)}（${yen(product.price)}）</option>`).join('');
  updateReservationPreview();
}

function renderProducts() {
  productList.innerHTML = data.products.map(product => `
    <div class="item">
      <div class="item-title"><span>${escapeHtml(product.name)}</span><span>${yen(product.price)}</span></div>
      <div class="item-meta">カテゴリ：${escapeHtml(product.category || '未設定')}</div>
      <div class="item-actions"><button class="delete" onclick="deleteItem('products','${product.id}')">削除</button></div>
    </div>
  `).join('') || '<p>商品がまだありません。</p>';
}

function renderReservations() {
  const sorted = [...data.reservations].sort((a, b) => b.date.localeCompare(a.date));
  reservationList.innerHTML = sorted.map(res => reservationHtml(res)).join('') || '<p>予約がまだありません。</p>';
  const todays = data.reservations.filter(res => res.date === today());
  todayReservationCount.textContent = todays.length;
  todayReservations.innerHTML = todays.map(res => reservationHtml(res, false)).join('') || '<p>今日の予約はありません。</p>';
}

function reservationHtml(res, actions = true) {
  return `
    <div class="item">
      <div class="item-title"><span>${escapeHtml(res.customerName)}</span><span>${yen(res.total)}</span></div>
      <div class="item-meta">
        ${res.date} ${res.pickupTime ? res.pickupTime + '受取' : ''}<br>
        ${escapeHtml(res.productName)} × ${res.quantity} / ${res.status}<br>
        備考：${escapeHtml(res.note || 'なし')}
      </div>
      ${actions ? `<div class="item-actions"><button class="delete" onclick="deleteItem('reservations','${res.id}')">削除</button></div>` : ''}
    </div>
  `;
}

function renderSales() {
  const sorted = [...data.sales].sort((a, b) => b.date.localeCompare(a.date));
  salesList.innerHTML = sorted.map(sale => `
    <div class="item">
      <div class="item-title"><span>${sale.date}</span><span>${yen(sale.amount)}</span></div>
      <div class="item-meta">天気：${escapeHtml(sale.weather)} ${escapeHtml(sale.weatherNote || '')}<br>備考：${escapeHtml(sale.note || 'なし')}</div>
      <div class="item-actions"><button class="delete" onclick="deleteItem('sales','${sale.id}')">削除</button></div>
    </div>
  `).join('') || '<p>売上データがまだありません。</p>';
  const todaySale = data.sales.find(item => item.date === today());
  todaySalesTotal.textContent = yen(todaySale?.amount || 0);
}

function renderReports() {
  const now = new Date();
  const ym = now.toISOString().slice(0, 7);
  const y = String(now.getFullYear());
  const monthSales = data.sales.filter(s => s.date.startsWith(ym));
  const yearSales = data.sales.filter(s => s.date.startsWith(y));
  const monthTotal = monthSales.reduce((sum, s) => sum + Number(s.amount), 0);
  const yearTotal = yearSales.reduce((sum, s) => sum + Number(s.amount), 0);
  const average = monthSales.length ? Math.round(monthTotal / monthSales.length) : 0;
  monthAverageSales.textContent = yen(average);
  reportMonthSales.textContent = yen(monthTotal);
  reportYearSales.textContent = yen(yearTotal);
  reportAverageSales.textContent = yen(average);

  const weatherTotals = {};
  data.sales.forEach(s => weatherTotals[s.weather] = (weatherTotals[s.weather] || 0) + Number(s.amount));
  weatherReport.innerHTML = Object.entries(weatherTotals).map(([name, total]) => `<div class="item"><div class="item-title"><span>${escapeHtml(name)}</span><span>${yen(total)}</span></div></div>`).join('') || '<p>天気別データがまだありません。</p>';

  const productTotals = {};
  data.reservations.forEach(r => productTotals[r.productName] = (productTotals[r.productName] || 0) + Number(r.quantity));
  productReport.innerHTML = Object.entries(productTotals).map(([name, count]) => `<div class="item"><div class="item-title"><span>${escapeHtml(name)}</span><span>${count}個</span></div></div>`).join('') || '<p>商品別予約実績がまだありません。</p>';
}

exportButton.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bakery-backup-${today()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

importFile.addEventListener('change', event => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    data = JSON.parse(reader.result);
    saveData();
  };
  reader.readAsText(file);
});

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function render() {
  renderProductSelect();
  renderProducts();
  renderReservations();
  renderSales();
  renderReports();
}

setDefaultDates();
render();
