// アプリ全体の状態
const LOCAL_KEYS = {reservations:'bakeryReservations', sales:'bakerySales', products:'bakeryProducts'};
let reservations = readLocal(LOCAL_KEYS.reservations, []);
let sales = readLocal(LOCAL_KEYS.sales, []);
let products = readLocal(LOCAL_KEYS.products, []);

if(products.length===0){products=[
  {id:1,name:'食パン',price:320,note:'基本商品'},
  {id:2,name:'塩パン',price:180,note:''},
  {id:3,name:'あんぱん',price:200,note:''},
  {id:4,name:'メロンパン',price:220,note:''}
];}
