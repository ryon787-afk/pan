const GAS_URL = 'https://script.google.com/macros/s/AKfycbyFvvItuhnpViipxC_vhTtWk5REmQEF-Xgdo0U9WAM4fMzVXrn31Zk63OqjtgoGIJba/exec';

const products = [
  ['贅沢ミルク食パン', 700],
  ['ベーグルサンド', 370],
  ['クロワッサン', 300],
  ['あんバター', 330],
  ['あんフロマージュ', 330],
  ['ミルク屋さんのメロンパン', 250],
  ['ミルク屋さんのクリームパン', 250],
  ['塩バターベーグル', 250]
];

const $ = id => document.getElementById(id);
const today = () => new Date().toISOString().slice(0, 10);
const yen = n => '¥' + Number(n || 0).toLocaleString('ja-JP');

$('todayText').textContent = new Date().toLocaleDateString('ja-JP', { year:'numeric', month:'long', day:'numeric', weekday:'long' });
$('date').value = today();

function calcAmount() {
  $('amount').value = Number($('unitPrice').value || 0) * Number($('qty').value || 1);
}
$('unitPrice').addEventListener('input', calcAmount);
$('qty').addEventListener('input', calcAmount);

function renderQuickProducts() {
  $('quickProducts').innerHTML = products.map(([name, price]) => `
    <button type="button" data-name="${escapeHtml(name)}" data-price="${price}">
      <b>${escapeHtml(name)}</b><span>${yen(price)}</span>
    </button>
  `).join('');
  document.querySelectorAll('.quick button').forEach(btn => {
    btn.addEventListener('click', () => {
      $('item').value = btn.dataset.name;
      $('unitPrice').value = btn.dataset.price;
      calcAmount();
      window.scrollTo({top: 80, behavior: 'smooth'});
    });
  });
}

async function saveReservation() {
  const data = {
    date: $('date').value,
    time: $('time').value,
    name: $('name').value.trim(),
    item: $('item').value.trim(),
    qty: $('qty').value,
    amount: $('amount').value,
    status: $('status').value,
    note: $('note').value.trim()
  };
  if (!data.date || !data.name || !data.item) {
    alert('日付・お客様名・商品名を入力してください');
    return;
  }

  $('saveBtn').disabled = true;
  $('syncStatus').textContent = '保存中…';
  try {
    await fetch(GAS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    });
    $('syncStatus').textContent = '保存しました。再読み込みします…';
    ['time', 'name', 'item', 'note'].forEach(id => $(id).value = '');
    $('qty').value = 1;
    calcAmount();
    setTimeout(loadReservations, 1200);
  } catch (err) {
    alert('保存エラー：' + err.message);
    $('syncStatus').textContent = '保存エラー';
  } finally {
    $('saveBtn').disabled = false;
  }
}

function loadReservations() {
  $('syncStatus').textContent = '共有データを読み込み中…';
  const callbackName = 'jsonp_' + Date.now();
  const script = document.createElement('script');
  const timeout = setTimeout(() => {
    cleanup();
    $('syncStatus').textContent = '読み込みエラー';
    alert('読み込みエラー：Apps Scriptの再デプロイ、またはURLを確認してください');
  }, 10000);

  window[callbackName] = (res) => {
    cleanup();
    if (!res || res.result !== 'success') {
      $('syncStatus').textContent = '読み込みエラー';
      alert('読み込みエラー：データ形式を確認してください');
      return;
    }
    renderList(res.reservations || []);
    $('syncStatus').textContent = '共有データを読み込みました';
  };

  function cleanup() {
    clearTimeout(timeout);
    delete window[callbackName];
    script.remove();
  }

  script.onerror = () => {
    cleanup();
    $('syncStatus').textContent = '読み込みエラー';
    alert('読み込みエラー：Load failed');
  };
  script.src = GAS_URL + '?action=list&callback=' + callbackName + '&t=' + Date.now();
  document.body.appendChild(script);
}

function renderList(rows) {
  if (!rows.length) {
    $('list').innerHTML = '<div class="empty">予約はまだありません</div>';
    return;
  }
  $('list').innerHTML = rows.map(r => `
    <div class="item">
      <b>${escapeHtml(r.date)} ${escapeHtml(r.time)}　${escapeHtml(r.name)}</b>
      <p>${escapeHtml(r.item)} × ${escapeHtml(r.qty)} <span>${escapeHtml(r.status)}</span></p>
      <strong>${yen(r.amount)}</strong>
      <small>${escapeHtml(r.note || '')}</small>
    </div>
  `).join('');
}

function escapeHtml(v) {
  return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'}[c]));
}

$('saveBtn').addEventListener('click', saveReservation);
$('reloadBtn').addEventListener('click', loadReservations);
renderQuickProducts();
loadReservations();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').catch(() => {});
}
