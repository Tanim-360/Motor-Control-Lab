/* Installable app support: service worker, install button, iPhone hint */
if("serviceWorker" in navigator && /^https?:$/.test(location.protocol)){
  window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})});
}
var deferredInstall=null;
var standalone=window.matchMedia("(display-mode: standalone)").matches||navigator.standalone;
window.addEventListener("beforeinstallprompt",function(e){
  e.preventDefault(); deferredInstall=e;
  if(standalone||document.getElementById("installBtn")) return;
  var b=document.createElement("button");
  b.id="installBtn"; b.type="button"; b.className="runbtn"; b.textContent="Install app";
  b.addEventListener("click",function(){
    deferredInstall.prompt();
    deferredInstall.userChoice.then(function(){deferredInstall=null;b.remove()});
  });
  document.querySelector("header .bar").appendChild(b);
});
window.addEventListener("appinstalled",function(){var b=document.getElementById("installBtn");if(b)b.remove()});
if(!standalone && /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent)){
  var hint=document.querySelector("#v-home .lede");
  if(hint) hint.insertAdjacentHTML("afterend",'<p class="hint">To install on iPhone: tap the Share button, then Add to Home Screen.</p>');
}
