const APP_VERSION='3.3.1';
const APP_KEYS={reservations:'kp_reservations',sales:'kp_sales',products:'kp_products',settings:'kp_settings',update:'kp_update_state'};
function loadJSON(k,f){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch(e){return f}}
function saveJSON(k,v){localStorage.setItem(k,JSON.stringify(v))}
function today(){return new Date().toISOString().slice(0,10)}
function yen(n){return '¥'+Number(n||0).toLocaleString('ja-JP')}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
let state={reservations:loadJSON(APP_KEYS.reservations,[]),sales:loadJSON(APP_KEYS.sales,[]),products:loadJSON(APP_KEYS.products,[{id:uid(),name:'贅沢ミルク食パン',price:700,category:'食パン'},{id:uid(),name:'クロワッサン',price:300,category:'パン'},{id:uid(),name:'ミルク屋さんのメロンパン',price:250,category:'菓子パン'},{id:uid(),name:'塩バターベーグル',price:250,category:'ベーグル'}]),settings:loadJSON(APP_KEYS.settings,{password:''})};
function persist(){saveJSON(APP_KEYS.reservations,state.reservations);saveJSON(APP_KEYS.sales,state.sales);saveJSON(APP_KEYS.products,state.products);saveJSON(APP_KEYS.settings,state.settings)}
