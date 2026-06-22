// 起動処理
document.getElementById('todayText').textContent = new Date().toLocaleDateString('ja-JP',{year:'numeric',month:'long',day:'numeric',weekday:'long'});
['rDate','sDate','filterDate'].forEach(id=>document.getElementById(id).value=today());
document.getElementById('reportMonth').value = today().slice(0,7);
document.getElementById('reportYear').value = new Date().getFullYear();

localPersist();
render();
checkLogin();
initCloud();
