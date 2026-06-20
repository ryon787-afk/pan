function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    setupSheets_(ss);
    const data = JSON.parse(e.postData.contents || '{}');
    const action = data.action;

    if (action === 'addReservation') {
      const sheet = ss.getSheetByName('予約');
      sheet.appendRow([
        data.date || '',
        data.time || '',
        data.name || '',
        data.item || '',
        Number(data.qty || 0),
        Number(data.amount || 0),
        data.status || '未受取',
        data.note || '',
        new Date()
      ]);
      return json_({ ok: true });
    }

    if (action === 'saveSale') {
      const sheet = ss.getSheetByName('売上');
      const rows = sheet.getDataRange().getValues();
      const targetDate = data.date || '';
      let updated = false;
      for (let i = 1; i < rows.length; i++) {
        if (formatDate_(rows[i][0]) === targetDate) {
          sheet.getRange(i + 1, 1, 1, 7).setValues([[
            targetDate,
            Number(data.amount || 0),
            data.weather || '',
            data.weatherNote || '',
            data.event || '',
            data.note || '',
            new Date()
          ]]);
          updated = true;
          break;
        }
      }
      if (!updated) {
        sheet.appendRow([
          targetDate,
          Number(data.amount || 0),
          data.weather || '',
          data.weatherNote || '',
          data.event || '',
          data.note || '',
          new Date()
        ]);
      }
      return json_({ ok: true });
    }

    if (action === 'addProduct') {
      const sheet = ss.getSheetByName('商品');
      sheet.appendRow([
        data.name || '',
        Number(data.price || 0),
        data.note || ''
      ]);
      return json_({ ok: true });
    }

    if (action === 'list') {
      return json_({
        ok: true,
        reservations: getReservations_(ss),
        sales: getSales_(ss),
        products: getProducts_(ss)
      });
    }

    return json_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function setupSheets_(ss) {
  const defs = {
    '予約': ['日付','時間','お客様名','商品','個数','金額','状態','備考','登録日時'],
    '売上': ['日付','売上','天気','天気メモ','イベント','備考','登録日時'],
    '商品': ['商品名','価格','メモ']
  };
  Object.keys(defs).forEach(name => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    const first = sh.getRange(1,1,1,defs[name].length).getValues()[0];
    const empty = first.every(v => v === '');
    if (empty) sh.getRange(1,1,1,defs[name].length).setValues([defs[name]]);
  });
}

function getReservations_(ss) {
  const sh = ss.getSheetByName('予約');
  const values = sh.getDataRange().getValues().slice(1);
  return values.filter(r => r[0] || r[2] || r[3]).map(r => ({
    date: formatDate_(r[0]),
    time: formatTime_(r[1]),
    name: r[2] || '',
    item: r[3] || '',
    qty: Number(r[4] || 0),
    amount: Number(r[5] || 0),
    status: r[6] || '未受取',
    note: r[7] || ''
  }));
}

function getSales_(ss) {
  const sh = ss.getSheetByName('売上');
  const values = sh.getDataRange().getValues().slice(1);
  return values.filter(r => r[0]).map(r => ({
    date: formatDate_(r[0]),
    amount: Number(r[1] || 0),
    weather: r[2] || '',
    weatherNote: r[3] || '',
    event: r[4] || '',
    note: r[5] || ''
  }));
}

function getProducts_(ss) {
  const sh = ss.getSheetByName('商品');
  const values = sh.getDataRange().getValues().slice(1);
  return values.filter(r => r[0]).map(r => ({
    name: r[0] || '',
    price: Number(r[1] || 0),
    note: r[2] || ''
  }));
}

function formatDate_(v) {
  if (!v) return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(v).replace(/\//g, '-');
}

function formatTime_(v) {
  if (!v) return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'HH:mm');
  }
  return String(v).slice(0,5);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
