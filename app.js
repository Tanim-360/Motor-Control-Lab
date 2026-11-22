/* ---------- Router (Stage 1: navigation) ---------- */
var STUBS={
};
Object.keys(STUBS).forEach(function(k){
  var s=STUBS[k];
  document.getElementById("v-"+k).innerHTML='<h1>'+s[0]+'</h1><div class="stub"><h3>Coming in '+s[1]+'</h3><p>'+s[2]+'</p><a href="#home">Back to home</a></div>';
});
function route(){
  var v=(location.hash||"#home").slice(1);
  if(!document.getElementById("v-"+v)) v="home";
  document.querySelectorAll(".view").forEach(function(e){e.classList.toggle("active",e.id==="v-"+v)});
  document.querySelectorAll("nav a").forEach(function(a){
    var nv=v.indexOf("quiz")===0?v.slice(4):v;
    if(a.dataset.v===nv) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current");
  });
  window.scrollTo(0,0);
}
window.addEventListener("hashchange",route); route();

