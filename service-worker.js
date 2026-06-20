const CACHE_NAME='kubochan-pan-v3.3.3';
const ASSETS=['./','index.html?v=3.3.3','style.css?v=3.3.3','storage.js?v=3.3.3','app.js?v=3.3.3','manifest.json?v=3.3.3','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request,{cache:'no-store'}).then(res=>{const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,copy));return res}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./'))))});
