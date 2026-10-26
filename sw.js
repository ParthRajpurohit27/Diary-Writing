const V='diary-v3',SHELL=['./','index.html','style.css','app.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET'||!/^https?:$/.test(u.protocol))return;
 if(u.origin!==location.origin&&!/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com/.test(u.host))return;
 e.respondWith(caches.open(V).then(async c=>{const hit=await c.match(r,{ignoreSearch:true});const net=fetch(r).then(x=>{if(x&&(x.ok||x.type==='opaque'))c.put(r,x.clone());return x}).catch(()=>hit||(r.mode==='navigate'?c.match('index.html'):Response.error()));return hit||net}))});
