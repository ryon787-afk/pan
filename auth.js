// 権限ログイン
// スマホ・GitHub PagesでIDの自動グローバル参照が効かない場合でも動くように修正
const DEFAULT_ADMIN_PASSWORD = '7878';

function $(id){
  return document.getElementById(id);
}

function getSavedPassword(){
  try{
    return localStorage.getItem('bakeryAdminPassword') || DEFAULT_ADMIN_PASSWORD;
  }catch(e){
    return DEFAULT_ADMIN_PASSWORD;
  }
}

function checkLogin(){
  const lock = $('lockScreen');
  const input = $('loginPass');
  if(!lock) return;

  try{
    if(localStorage.getItem('bakeryAdminLoggedIn') === 'yes'){
      lock.classList.add('hidden');
      return;
    }
  }catch(e){}

  lock.classList.remove('hidden');
  setTimeout(()=>{ if(input) input.focus(); }, 100);
}

function login(){
  const input = $('loginPass');
  const lock = $('lockScreen');
  const typed = (input?.value || '').trim();
  const savedPass = getSavedPassword();

  // 保存済みパスワード、または初期パスワード7878でログイン可能
  // 以前の端末に古いパスワードが残っていても入れるようにする
  if(typed === savedPass || typed === DEFAULT_ADMIN_PASSWORD){
    try{ localStorage.setItem('bakeryAdminLoggedIn','yes'); }catch(e){}
    if(lock) lock.classList.add('hidden');
    if(input) input.value = '';
    if(typeof toast === 'function') toast('ログインしました');
    return;
  }

  if(typeof toast === 'function'){
    toast('パスワードが違います。初期パスワードは7878です','err');
  }else{
    alert('パスワードが違います。初期パスワードは7878です');
  }
}

function logout(){
  try{ localStorage.removeItem('bakeryAdminLoggedIn'); }catch(e){}
  checkLogin();
}

function changePassword(){
  const input = $('newPassword');
  const v = (input?.value || '').trim();
  if(!v){ alert('新しいパスワードを入力してください'); return; }
  try{ localStorage.setItem('bakeryAdminPassword', v); }catch(e){}
  if(input) input.value = '';
  if(typeof toast === 'function') toast('パスワードを変更しました');
}

// HTMLのonclickから確実に呼べるように明示
window.checkLogin = checkLogin;
window.login = login;
window.logout = logout;
window.changePassword = changePassword;

document.addEventListener('DOMContentLoaded', () => {
  const input = $('loginPass');
  if(input){
    input.addEventListener('keydown', (e) => {
      if(e.key === 'Enter') login();
    });
  }
});
