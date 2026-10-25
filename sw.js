// مصحف الأمة – service worker: makes the site installable and keeps the app shell and page images cached.
const V='v1', SHELL='shell-'+V, IMG='pages-'+V;
const CORE=['./','index.html','manifest.json','icons/icon-192.png','icons/icon-512.png','icons/favicon-64.png','icons/logo-240.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(SHELL).then(c=>c.addAll(CORE)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>!k.endsWith(V)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;          // recitations from archive.org go straight to the network
  if(/\.mp3$/i.test(u.pathname))return;                                     // audio uses range requests: never intercept
  if(u.pathname.includes('/pages/')){                                       // mushaf page images: cache first
    e.respondWith(caches.open(IMG).then(c=>c.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r}))));return}
  // page, data and notes: network first so updates appear at once, cache when offline
  e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(SHELL).then(c=>c.put(e.request,cp))}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})));
});
