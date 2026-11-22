/* ---------- DOL module (Stage 3) ---------- */
var D={start:false,stop:false,ol:false}, deng=new Engine(dolSpec());
var KK=function(){return deng.s.K1}, AA=function(){return !D.stop}, ON=function(){return true};
var cw=[
  [14,60,50,60,ON],
  [90,60,140,60,AA],
  [180,60,195,60,function(){return AA()&&D.start}],
  [195,60,215,60,function(){return AA()&&(D.start||KK())}],
  [125,60,125,120,AA],
  [125,120,140,120,AA],
  [180,120,195,120,function(){return AA()&&KK()}],
  [195,120,195,60,function(){return AA()&&KK()}],
  [245,60,277,60,KK],
  [313,60,346,60,KK]
], pw=[];
[70,130,190].forEach(function(x){
  pw.push([x,18,x,42,ON],[x,62,x,92,ON],[x,112,x,136,KK],[x,156,x,190,KK]);
});
function mkW(id,list){
  var g=document.getElementById(id);
  list.forEach(function(s){
    var l=document.createElementNS(NS,"line");
    l.setAttribute("x1",s[0]);l.setAttribute("y1",s[1]);l.setAttribute("x2",s[2]);l.setAttribute("y2",s[3]);
    l.setAttribute("class","w");s.push(l);g.appendChild(l);
  });
}
mkW("dCtlW",cw); mkW("dPwrW",pw);
function dsolve(){deng.set("start",D.start);deng.set("stop",D.stop);deng.set("ol",D.ol);deng.solve()}
function sy(id,y2){document.getElementById(id).setAttribute("y2",y2)}
function dDraw(){
  [cw,pw].forEach(function(L){L.forEach(function(s){s[5].classList.toggle("on",!!s[4]())})});
  var K=KK();
  document.getElementById("dCoil").classList.toggle("on",K);
  sy("dStopSym",D.stop?42:60); sy("dStartSym",D.start?60:46); sy("dKSym",K?120:106); sy("dOlSym",D.ol?42:60);
  [70,130,190].forEach(function(x,i){
    var l=document.getElementById("dk"+i);
    l.setAttribute("x2",K?x:x+13); l.setAttribute("y2",K?112:104);
  });
  document.getElementById("dFan").classList.toggle("spin",K);
  document.getElementById("dOlBox").classList.toggle("trip",D.ol);
  document.getElementById("dOl").textContent=D.ol?"Reset overload":"Trip overload";
  document.getElementById("dStatus").textContent=D.ol
    ? "Overload tripped. K1 has dropped out and the motor is stopped. Reset the overload, then press Start."
    : K ? "Motor running. K1’s main contacts are closed, and its auxiliary contact holds the coil on."
        : "Motor stopped. Press Start and release it.";
}
function dHold(id,key){
  var b=document.getElementById(id);
  function dn(e){e.preventDefault();D[key]=true;b.classList.add("down");dsolve();dDraw()}
  function up(){if(!D[key])return;D[key]=false;b.classList.remove("down");dsolve();dDraw()}
  b.addEventListener("pointerdown",dn);
  ["pointerup","pointerleave","pointercancel"].forEach(function(t){b.addEventListener(t,up)});
  b.addEventListener("keydown",function(e){if((e.key===" "||e.key==="Enter")&&!e.repeat)dn(e)});
  b.addEventListener("keyup",function(e){if(e.key===" "||e.key==="Enter")up()});
}
dHold("dStart","start"); dHold("dStop","stop");
document.getElementById("dOl").addEventListener("click",function(){D.ol=!D.ol;dsolve();dDraw()});
dsolve(); dDraw();

