const APP_VERSION='3.3.3';
const APP_KEYS={reservations:'kp_reservations',sales:'kp_sales',products:'kp_products',settings:'kp_settings',update:'kp_update_state'};
function loadJSON(k,f){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch(e){return f}}
function saveJSON(k,v){localStorage.setItem(k,JSON.stringify(v))}
function today(){return new Date().toISOString().slice(0,10)}
function yen(n){return '¥'+Number(n||0).toLocaleString('ja-JP')}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
const DEFAULT_PRODUCTS=[
  {name:'贅沢ミルク食パン',price:700,category:'食パン'},
  {name:'ベーグルサンド',price:370,category:'サンド'},
  {name:'クロワッサン',price:300,category:'パン'},
  {name:'あんバター',price:330,category:'菓子パン'},
  {name:'あんフロマージュ',price:330,category:'菓子パン'},
  {name:'ミルク屋さんのメロンパン',price:250,category:'菓子パン'},
  {name:'ミルク屋さんのクリームパン',price:250,category:'菓子パン'},
  {name:'ツナチーズベーグル',price:250,category:'ベーグル'},
  {name:'ブルーベリーチーズベーグル',price:250,category:'ベーグル'},
  {name:'チョコカスタードベーグル',price:250,category:'ベーグル'},
  {name:'まんまるあんぱん',price:250,category:'菓子パン'},
  {name:'明太ベーコンエピ',price:250,category:'惣菜パン'},
  {name:'明太フランス',price:250,category:'惣菜パン'},
  {name:'塩バターベーグル',price:250,category:'ベーグル'},
  {name:'ごほうびチーズケーキ',price:450,category:'チーズケーキ'}
];
function withIds(list){return list.map(p=>({id:p.id||uid(),name:p.name||'',price:Number(p.price||0),category:p.category||'その他',active:p.active!==false}))}
let loadedProducts=loadJSON(APP_KEYS.products,null);
let state={reservations:loadJSON(APP_KEYS.reservations,[]),sales:loadJSON(APP_KEYS.sales,[]),products:withIds(Array.isArray(loadedProducts)&&loadedProducts.length?loadedProducts:DEFAULT_PRODUCTS),settings:loadJSON(APP_KEYS.settings,{password:''})};
function persist(){saveJSON(APP_KEYS.reservations,state.reservations);saveJSON(APP_KEYS.sales,state.sales);saveJSON(APP_KEYS.products,state.products);saveJSON(APP_KEYS.settings,state.settings)}
function addDefaultProducts(){const names=new Set(state.products.map(p=>p.name));DEFAULT_PRODUCTS.forEach(p=>{if(!names.has(p.name))state.products.push({...p,id:uid(),active:true})});persist()}
