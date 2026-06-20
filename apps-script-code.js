function doGet(e) {
  const action = (e.parameter.action || 'list').toString();
  const callback = e.parameter.callback;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getReservationSheet_(ss);

  let result = {};
  if (action === 'list') {
    result = { result: 'success', reservations: getReservations_(sheet) };
  } else {
    result = { result: 'error', message: 'unknown action' };
  }

  const json = JSON.stringify(result);
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getReservationSheet_(ss);
  const data = JSON.parse(e.postData.contents || '{}');

  sheet.appendRow([
    data.date || '',
    data.time || '',
    data.name || '',
    data.item || '',
    data.qty || '',
    data.amount || '',
    data.status || '',
    data.note || '',
    new Date()
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getReservationSheet_(ss) {
  let sheet = ss.getSheetByName('予約');
  if (!sheet) sheet = ss.insertSheet('予約');
  const firstRow = sheet.getRange(1, 1, 1, 9).getValues()[0];
  if (!firstRow[0]) {
    sheet.getRange(1, 1, 1, 9).setValues([['日付', '時間', 'お客様名', '商品', '個数', '金額', '状態', '備考', '登録日時']]);
  }
  return sheet;
}

function getReservations_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  return values.slice(1).filter(r => r[0] || r[2] || r[3]).map((r, i) => ({
    row: i + 2,
    date: formatCell_(r[0]),
    time: formatCell_(r[1]),
    name: r[2] || '',
    item: r[3] || '',
    qty: r[4] || '',
    amount: r[5] || '',
    status: r[6] || '',
    note: r[7] || '',
    createdAt: formatCell_(r[8])
  })).reverse();
}

function formatCell_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
  }
  return value || '';
}
