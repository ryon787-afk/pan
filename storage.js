const VERSION='3.2.0';
const DB_KEY='kubochanPanDB';
const defaultProducts=[['贅沢ミルク食パン',700,'食パン'],['ベーグルサンド',370,'ベーグル'],['クロワッサン',300,'菓子パン'],['ミルク屋さんのメロンパン',250,'菓子パン'],['塩バターベーグル',250,'ベーグル'],['ごほうびチーズケーキ',450,'スイーツ']];
const Store={load(){let d=JSON.parse(localStorage.getItem(DB_KEY)||'{}');d.reservations=d.reservations||[];d.sales=d.sales||[];d.products=d.products||defaultProducts.map((p,i)=>({id:Date.now()+i,name:p[0],price:p[1],category:p[2]}));d.settings=d.settings||{};return d},save(d){localStorage.setItem(DB_KEY,JSON.stringify(d))},today(){return new Date().toISOString().slice(0,10)},yen(n){return '¥'+Number(n||0).toLocaleString('ja-JP')},escape(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}};
let DB=Store.load();
