/* ---------- Forward-reverse module (Stage 5) ---------- */
function frSpec(){
  function r(c,o,b){return {coil:c,logic:["and",["nc","ol"],["nc","stop"],["nc",o],["or",["no",b],["no",c]]]}}
  return {inputs:["fwd","rev","stop","ol"],rungs:[r("F","R","fwd"),r("R","F","rev")]};
}
var FR={fwd:false,rev:false,stop:false,ol:false}, feng=new Engine(frSpec());
var fcw=[], fsym="";
function rung(p,a,btn,lbl,oth){
  var b=a+38;
  function d(x,y){return '<circle class="dot" cx="'+x+'" cy="'+y+'" r="3.5"/>'}
  function ln(id,x1,y1,x2,y2){return '<line id="'+id+p+'" class="sym" x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'"/>'}
  function tx(x,y,t){return '<text class="lbl" x="'+x+'" y="'+y+'">'+t+'</text>'}
  fsym+=d(40,a)+d(70,a)+ln("stp",40,a,70,a)+tx(38,a-24,"Stop")
    +d(85,a)+d(115,a)+ln("olp",85,a,115,a)+tx(88,a-24,"OL")
    +d(145,a)+d(175,a)+ln("sta",145,a,173,a-12)+tx(145,a-24,lbl)
    +d(145,b)+d(175,b)+ln("aux",145,b,173,b-12)+tx(140,b+16,p+" aux (NO)")
    +d(205,a)+d(235,a)+ln("ilk",205,a,235,a)+tx(196,a+22,oth+" aux (NC)")
    +'<circle id="c'+p+'" class="coil" cx="290" cy="'+a+'" r="16"/><text class="coiltxt" x="290" y="'+(a+5)+'" text-anchor="middle">'+p+'</text>';
  var K=function(){return feng.s[p]}, A=function(){return !FR.stop}, B=function(){return !FR.stop&&!FR.ol}, P=function(){return FR[btn]};
  fcw.push([14,a,40,a,ON],[70,a,85,a,A],[115,a,145,a,B],[128,a,128,b,B],[128,b,145,b,B],
    [175,a,190,a,function(){return B()&&P()}],[175,b,190,b,function(){return B()&&K()}],[190,b,190,a,function(){return B()&&K()}],
    [190,a,205,a,function(){return B()&&(P()||K())}],[235,a,265,a,K],[306,a,346,a,K]);
}
rung("F",50,"fwd","Fwd","R"); rung("R",150,"rev","Rev","F");
document.getElementById("frSym").innerHTML=fsym;
var FF=function(){return feng.s.F}, RR=function(){return feng.s.R};
var fpw=[[70,40,290,40,FF],[70,140,290,140,FF],[70,90,290,90,function(){return FF()||RR()}],[70,40,290,140,RR],[70,140,290,40,RR]];
mkW("frCtl",fcw); mkW("frPwr",fpw);
function frSolve(){["fwd","rev","stop","ol"].forEach(function(k){feng.set(k,FR[k])});feng.solve()}
function frDraw(){
  [fcw,fpw].forEach(function(L){L.forEach(function(s){s[5].classList.toggle("on",!!s[4]())})});
  var F=feng.s.F,R=feng.s.R;
  ["F","R"].forEach(function(p){
    var oth=p==="F"?"R":"F", btn=p==="F"?"fwd":"rev", a=p==="F"?50:150, b=a+38;
    document.getElementById("c"+p).classList.toggle("on",feng.s[p]);
    sy("stp"+p,FR.stop?a-18:a); sy("olp"+p,FR.ol?a-18:a); sy("sta"+p,FR[btn]?a:a-12);
    sy("aux"+p,feng.s[p]?b:b-12); sy("ilk"+p,feng.s[oth]?a-16:a);
  });
  var fan=document.getElementById("frFan");
  fan.classList.toggle("spin",F||R); fan.classList.toggle("rev",R);
  document.getElementById("frPhase").textContent=F?"Forward: L1→U  L2→V  L3→W":R?"Reverse: L3→U  L2→V  L1→W":"Stopped";
  var blocked=(FR.fwd&&R)||(FR.rev&&F);
  document.getElementById("frStatus").textContent=blocked
    ? "Interlock! The other contactor’s auxiliary contact is open, so this coil cannot energize. Press Stop first."
    : FR.ol ? "Overload tripped. Both contactors are off. Reset it, then choose a direction."
    : F ? "Forward. F is closed: L1→U, L2→V, L3→W."
    : R ? "Reverse. R is closed and two phases are swapped: L3→U, L2→V, L1→W."
    : "Stopped. Press Fwd or Rev.";
  document.getElementById("frOl").textContent=FR.ol?"Reset overload":"Trip overload";
}
function fHold(id,key){
  var b=document.getElementById(id);
  function dn(e){e.preventDefault();FR[key]=true;b.classList.add("down");frSolve();frDraw()}
  function up(){if(!FR[key])return;FR[key]=false;b.classList.remove("down");frSolve();frDraw()}
  b.addEventListener("pointerdown",dn);
  ["pointerup","pointerleave","pointercancel"].forEach(function(t){b.addEventListener(t,up)});
  b.addEventListener("keydown",function(e){if((e.key===" "||e.key==="Enter")&&!e.repeat)dn(e)});
  b.addEventListener("keyup",function(e){if(e.key===" "||e.key==="Enter")up()});
}
fHold("frFwd","fwd"); fHold("frRev","rev"); fHold("frStop","stop");
document.getElementById("frOl").addEventListener("click",function(){FR.ol=!FR.ol;frSolve();frDraw()});
frSolve(); frDraw();

