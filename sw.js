/* Motor Control Lab service worker. Bump V when you change any file. */
var V="mcl-v1", RT="mcl-fonts";
var CORE=["./", "index.html", "style.css", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png", "app.js", "engine.js", "selftest.js", "home.js", "dol.js", "dol-explainer.js", "fwdrev.js", "stardelta.js", "plc.js", "learn.js", "faults.js", "pwa.js"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(V).then(function(c){return c.addAll(CORE)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k!==V&&k!==RT}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});
self.addEventListener("fetch",function(e){
  var r=e.request; if(r.method!=="GET") return;
  var u=new URL(r.url);
  if(u.origin===location.origin){
    e.respondWith(caches.match(r).then(function(hit){
      var net=fetch(r).then(function(res){
        if(res.ok){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp)})}
        return res;
      }).catch(function(){return hit||(r.mode==="navigate"?caches.match("index.html"):undefined)});
      return hit||net;
    }));
  }else if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.open(RT).then(function(c){
      return c.match(r).then(function(hit){
        var net=fetch(r).then(function(res){c.put(r,res.clone());return res}).catch(function(){return hit});
        return hit||net;
      });
    }));
  }
});
