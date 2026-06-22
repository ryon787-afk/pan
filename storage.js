// ローカル保存・自動同期
function localPersist(){
  localStorage.setItem(LOCAL_KEYS.reservations, JSON.stringify(reservations));
  localStorage.setItem(LOCAL_KEYS.sales, JSON.stringify(sales));
  localStorage.setItem(LOCAL_KEYS.products, JSON.stringify(products));
}

function makeCloudPayload(){
  return {reservations, sales, products, updatedAt:new Date().toISOString(), version:'supabase-auto-sync-no-refresh-button-split-files'};
}

function persist(){
  localPersist();
  render();
  if(syncTimer) clearTimeout(syncTimer);
  syncTimer=setTimeout(()=>saveCloudNow(false),300);
}

window.addEventListener('beforeunload',()=>localPersist());
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden') localPersist();});
