/* ---------- Star-delta module (Stage 6) ---------- */
function sdSpec(){return {inputs:["start","stop","ol"],rungs:[
  {coil:"K1",logic:["and",["nc","ol"],["nc","stop"],["or",["no","start"],["no","K1"]]]},
  {coil:"K3",logic:["and",["no","K1"],["nc","K2"],["nc","T1"]]},
  {coil:"K2",logic:["and",["no","K1"],["nc","K3"],["or",["no","T1"],["no","K2"]]]},
  {coil:"T1",type:"ton",delay:5,logic:["and",["no","K1"],["nc","K2"]]}
]}}
var seng=new Engine(sdSpec()), SD={start:false,stop:false,ol:false};
var sdl=[], sdc=[], sdk=[], sdhtml="";
function sdClosed(it){var v=seng.s[it.n];return it.k==="nc"?!v:!!v}
function sdContact(x,y,it,inL,below){
  var id="sdc"+sdc.length; sdc.push([id,it,y]);
  sdhtml+='<circle class="dot" cx="'+x+'" cy="'+y+'" r="3.5"/><circle class="dot" cx="'+(x+30)+'" cy="'+y+'" r="3.5"/>'
    +'<line id="'+id+'" class="sym" x1="'+x+'" y1="'+y+'" x2="'+(x+30)+'" y2="'+y+'"/>'
    +'<text class="lbl" x="'+(x-2)+'" y="'+(below?y+20:y-22)+'">'+it.t+'</text>';
  return function(){return inL()&&sdClosed(it)};
}
function sdRung(y,items,cn,sub,en){
  var cur=function(){return true}, pe=40;
  sdl.push([14,y,40,y,cur]);
  items.forEach(function(it,i){
    var x=40+70*i, up=cur;
    if(it.par){
      var jl=x-15, jr=x+45, y2=y+36;
      var oa=sdContact(x,y,it.par[0],up,false), ob=sdContact(x,y2,it.par[1],up,true);
      sdl.push([pe,y,jl,y,up],[jl,y,x,y,up],[jl,y,jl,y2,up],[jl,y2,x,y2,up],[x+30,y,jr,y,oa],[x+30,y2,jr,y2,ob],[jr,y2,jr,y,ob]);
      cur=function(){return oa()||ob()}; pe=jr;
    }else{
      var o=sdContact(x,y,it,up,false);
      sdl.push([pe,y,x,y,up]); cur=o; pe=x+30;
    }
  });
  var ef=en||function(){return seng.s[cn]};
  sdl.push([pe,y,286,y,cur],[314,y,346,y,ef]);
  sdk.push(["sdk"+cn,ef]);
  sdhtml+='<circle id="sdk'+cn+'" class="coil" cx="300" cy="'+y+'" r="14"/><text class="coiltxt" x="300" y="'+(y+5)+'" text-anchor="middle">'+cn+'</text><text class="lbl" x="278" y="'+(y+32)+'">'+sub+'</text>';
}
sdRung(40,[{k:"nc",n:"stop",t:"Stop"},{k:"nc",n:"ol",t:"OL"},{par:[{k:"no",n:"start",t:"Start"},{k:"no",n:"K1",t:"K1 aux"}]}],"K1","Main");
sdRung(128,[{k:"no",n:"K1",t:"K1 aux"},{k:"nc",n:"K2",t:"K2 (NC)"},{k:"nc",n:"T1",t:"T1 (NC)"}],"K3","Star");
sdRung(184,[{k:"no",n:"K1",t:"K1 aux"},{k:"nc",n:"K3",t:"K3 (NC)"},{par:[{k:"no",n:"T1",t:"T1 (NO)"},{k:"no",n:"K2",t:"K2 aux"}]}],"K2","Delta");
sdRung(268,[{k:"no",n:"K1",t:"K1 aux"},{k:"nc",n:"K2",t:"K2 (NC)"}],"T1","Timer 5 s",function(){return seng.en.T1});
document.getElementById("sdSym").innerHTML=sdhtml;
var spw=[];
[60,110,160].forEach(function(x){spw.push([x,16,x,44,ON],[x,64,x,108,function(){return seng.s.K1}])});
mkW("sdCtl",sdl); mkW("sdPwr",spw);
function sdSolve(){["start","stop","ol"].forEach(function(k){seng.set(k,SD[k])});seng.solve()}
function sdDraw(){
  [sdl,spw].forEach(function(L){L.forEach(function(s){s[5].classList.toggle("on",!!s[4]())})});
  sdc.forEach(function(c){document.getElementById(c[0]).setAttribute("y2",sdClosed(c[1])?c[2]:c[2]-13)});
  sdk.forEach(function(k){document.getElementById(k[0]).classList.toggle("on",!!k[1]())});
  var K1=seng.s.K1,K2=seng.s.K2,K3=seng.s.K3,acc=seng.acc.T1;
  [60,110,160].forEach(function(x,i){var l=document.getElementById("sdp"+i);l.setAttribute("x2",K1?x:x+11);l.setAttribute("y2",K1?64:56)});
  for(var i=0;i<3;i++){
    var a=document.getElementById("sdA"+i), e=document.getElementById("sdD"+i);
    a.classList.toggle("hide",!K3); a.classList.toggle("on",K3);
    e.classList.toggle("hide",K3); e.classList.toggle("on",K2);
  }
  var fan=document.getElementById("sdFan");
  fan.classList.toggle("spin",K1); fan.classList.toggle("slow",K3);
  document.getElementById("sdMode").textContent=K3?"Star connection":K2?"Delta connection":"Windings idle";
  document.getElementById("sdTK1").textContent="K1 line: "+(K1?"closed":"open");
  document.getElementById("sdTK3").textContent="K3 star: "+(K3?"closed":"open");
  document.getElementById("sdTK2").textContent="K2 delta: "+(K2?"closed":"open");
  document.getElementById("sdV").textContent=K3?"Winding V: 58%":K2?"Winding V: 100%":"Windings idle";
  document.getElementById("sdI").textContent=K3?"Start current: 1/3":K2?"Full torque and speed":"";
  document.getElementById("sdFill").style.width=(K2?100:K3?Math.min(100,acc/5*100):0)+"%";
  document.getElementById("sdStatus").textContent=SD.ol&&!K1
    ? "Overload tripped. All contactors are off. Reset it, then press Start."
    : K3 ? "Star: K1 and K3 are closed. Timer: "+acc.toFixed(1)+" s of 5 s."
    : K2 ? "Delta: K3 has dropped out and K2 is closed. The windings now get full line voltage."
    : "Stopped. Press Start.";
  document.getElementById("sdOl").textContent=SD.ol?"Reset overload":"Trip overload";
}
function sdHold(id,key){
  var b=document.getElementById(id);
  function dn(e){e.preventDefault();SD[key]=true;b.classList.add("down");sdSolve();sdDraw()}
  function up(){if(!SD[key])return;SD[key]=false;b.classList.remove("down");sdSolve();sdDraw()}
  b.addEventListener("pointerdown",dn);
  ["pointerup","pointerleave","pointercancel"].forEach(function(t){b.addEventListener(t,up)});
  b.addEventListener("keydown",function(e){if((e.key===" "||e.key==="Enter")&&!e.repeat)dn(e)});
  b.addEventListener("keyup",function(e){if(e.key===" "||e.key==="Enter")up()});
}
sdHold("sdStart","start"); sdHold("sdStop","stop");
document.getElementById("sdOl").addEventListener("click",function(){SD.ol=!SD.ol;sdSolve();sdDraw()});
sdSolve(); sdDraw();
setInterval(function(){
  if(!document.getElementById("v-stardelta").classList.contains("active")) return;
  seng.tick(0.1); sdDraw();
},100);
TESTS.push(
  ["Star-delta starts in star (K1 and K3 on, K2 off)",function(){var e=new Engine(sdSpec());press(e,"start");return e.s.K1&&e.s.K3&&!e.s.K2}],
  ["Star-delta switches to delta after 5 seconds",function(){var e=new Engine(sdSpec());press(e,"start");for(var i=0;i<45;i++)e.tick(0.1);var a=e.s.K3&&!e.s.K2;for(i=0;i<15;i++)e.tick(0.1);return a&&e.s.K2&&!e.s.K3}],
  ["Star-delta: K3 and K2 are never on together",function(){var e=new Engine(sdSpec());press(e,"start");for(var i=0;i<100;i++){e.tick(0.1);if(e.s.K3&&e.s.K2)return false}return true}],
  ["Star-delta: Stop resets everything, then it restarts in star",function(){var e=new Engine(sdSpec());press(e,"start");for(var i=0;i<60;i++)e.tick(0.1);press(e,"stop");var a=!e.s.K1&&!e.s.K2&&!e.s.K3&&!e.s.T1;press(e,"start");return a&&e.s.K3&&!e.s.K2}]
);

