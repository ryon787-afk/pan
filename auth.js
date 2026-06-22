// 権限ログイン
function checkLogin(){
  if(localStorage.getItem('bakeryAdminLoggedIn')==='yes') return;
  document.getElementById('lockScreen').classList.remove('hidden');
  setTimeout(()=>loginPass.focus(),100);
}

function login(){
  const pass=localStorage.getItem('bakeryAdminPassword') || '7878';
  if(loginPass.value===pass){
    localStorage.setItem('bakeryAdminLoggedIn','yes');
    document.getElementById('lockScreen').classList.add('hidden');
    toast('ログインしました');
  }else{
    toast('パスワードが違います','err');
  }
}

function changePassword(){
  const v=newPassword.value.trim();
  if(!v){alert('新しいパスワードを入力してください');return;}
  localStorage.setItem('bakeryAdminPassword',v);
  newPassword.value='';
  toast('パスワードを変更しました');
}
