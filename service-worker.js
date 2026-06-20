const CACHE='kubochan-pan-v3.2.0';
const ASSETS=['./','./index.html?v=3.2.0','./style.css?v=3.2.0','./app.js?v=3.2.0','./storage.js?v=3.2.0','./reservation.js?v=3.2.0','./sales.js?v=3.2.0','./production.js?v=3.2.0','./analytics.js?v=3.2.0','./backup.js?v=3.2.0','./settings.js?v=3.2.0','./manifest.json?v=3.2.0'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request,{cache:'no-store'}).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res}).catch(()=>caches.match(e.request)))})
