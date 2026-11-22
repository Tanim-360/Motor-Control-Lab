/* ---------- Seal-in demo (now driven by the engine) ---------- */
var S={start:false,stop:false,K:false,coil:false};
var eng=new Engine(dolSpec());
function solve(){
  eng.set("start",S.start); eng.set("stop",S.stop); eng.solve();
  S.coil=S.K=eng.s.K1;
}
var NS="http://www.w3.org/2000/svg", segs=[
  // [x1,y1,x2,y2, live condition]
  [14,60,50,60,function(){return true}],
  [90,60,125,60,function(){return !S.stop}],
  [125,60,140,60,function(){return !S.stop}],
  [180,60,195,60,function(){return !S.stop&&S.start}],
  [125,60,125,120,function(){return !S.stop}],
  [125,120,140,120,function(){return !S.stop}],
  [180,120,195,120,function(){return !S.stop&&S.K}],
  [195,120,195,60,function(){return !S.stop&&S.K}],
  [195,60,245,60,function(){return S.coil}],
  [285,60,346,60,function(){return S.coil}]
], wg=document.getElementById("wires");
segs.forEach(function(s){
  var l=document.createElementNS(NS,"line");
  l.setAttribute("x1",s[0]);l.setAttribute("y1",s[1]);l.setAttribute("x2",s[2]);l.setAttribute("y2",s[3]);
  l.setAttribute("class","w");s.push(l);wg.appendChild(l);
});
// link between Stop and start branch (wire under stop symbol counts as live when closed)
function draw(){
  segs.forEach(function(s){s[5].classList.toggle("on",!!s[4]())});
  document.getElementById("coil").classList.toggle("on",S.coil);
  var st=document.getElementById("stopSym");
  st.setAttribute("y2",S.stop?42:60); st.setAttribute("class","sym");
  var sa=document.getElementById("startSym");
  sa.setAttribute("y2",S.start?60:46);
  var k=document.getElementById("kSym");
  k.setAttribute("y2",S.K?120:106);
  var c=document.getElementById("cap");
  c.textContent=S.coil
    ? (S.start?"Start is pressed and the coil is on.":"Start is released, but the K1 contact closed and keeps the coil on. This is the seal-in.")
    : (S.stop?"Stop opens the circuit. The coil drops out and K1 opens.":"Hold Start. The coil energizes.");
}
function hold(id,key){
  var b=document.getElementById(id);
  function dn(e){e.preventDefault();S[key]=true;b.classList.add("down");solve();draw()}
  function up(){if(!S[key])return;S[key]=false;b.classList.remove("down");solve();draw()}
  b.addEventListener("pointerdown",dn);
  ["pointerup","pointerleave","pointercancel"].forEach(function(t){b.addEventListener(t,up)});
  b.addEventListener("keydown",function(e){if((e.key===" "||e.key==="Enter")&&!e.repeat)dn(e)});
  b.addEventListener("keyup",function(e){if(e.key===" "||e.key==="Enter")up()});
}
hold("bStart","start"); hold("bStop","stop"); solve(); draw();

