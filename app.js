// 起動処理
function startApp(){
  try{
    document.getElementById('todayText').textContent = new Date().toLocaleDateString('ja-JP',{year:'numeric',month:'long',day:'numeric',weekday:'long'});
    ['rDate','sDate','filterDate'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=today(); });
    const rm=document.getElementById('reportMonth'); if(rm) rm.value = today().slice(0,7);
    const ry=document.getElementById('reportYear'); if(ry) ry.value = new Date().getFullYear();

    localPersist();
    render();
    checkLogin();
    initCloud();
  }catch(e){
    console.error('起動エラー:', e);
    alert('起動エラーが出ました。GitHubに全ファイルがアップロードされているか確認してください。\n' + (e && e.message ? e.message : e));
    try{ checkLogin(); }catch(_){}
  }
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', startApp);
}else{
  startApp();
}
