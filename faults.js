/* ---------- Fault finding ---------- */
var FN={X0:"Start",X1:"Stop",X2:"Overload",X3:"Rev",Y0:"K1",Y1:"R"};
function one(slots){return [{slots:slots,coil:"Y0"}]}
var SC=[
 {t:"Drops out on release",s:"The motor runs while you hold Start, but stops the moment you let go.",h:"What keeps the coil on once your finger leaves Start?",ins:["X0","X1","X2"],outs:["Y0"],
  prog:one([cc("nc","X1"),cc("nc","X2"),cc("no","X0")]),
  o:["The Stop button is wired normally open","The seal-in contact is missing","The overload contact is open","The coil is burnt out"],a:1,
  w:"With no K1 auxiliary contact in parallel with Start, nothing holds the coil on after the button is released. A burnt coil would never pull in at all."},
 {t:"Will not start",s:"Pressing Start does nothing. Now try holding Start and Stop together.",h:"Which contact is open while nothing is pressed?",ins:["X0","X1","X2"],outs:["Y0"],
  prog:one([cc("no","X1"),cc("nc","X2"),{par:[cc("no","X0"),cc("no","Y0")]}]),
  o:["The Stop button is wired normally open instead of normally closed","The seal-in contact is wired in series with Start","The overload relay has tripped","The coil is open circuit"],a:0,
  w:"A normally open Stop leaves the circuit broken until it is pressed, so the motor only starts while Stop is held, which is the opposite of its job. A series seal-in (Fault 4) looks similar, but holding Stop would not help there."},
 {t:"Starts only when tripped",s:"Start does nothing. Strangely, the motor will run if you trip the overload first.",h:"What should an overload contact do when the relay trips?",ins:["X0","X1","X2"],outs:["Y0"],
  prog:one([cc("nc","X1"),cc("no","X2"),{par:[cc("no","X0"),cc("no","Y0")]}]),
  o:["The Stop button is stuck closed","The overload contact is wired normally open instead of normally closed","The seal-in contact is missing","The supply fuse has blown"],a:1,
  w:"The overload contact must be normally closed so that a trip opens the circuit. Wired normally open, it closes on a trip, so the motor can only run when the overload has tripped."},
 {t:"Never starts",s:"Start does nothing, whatever you press. Holding Start and Stop together changes nothing either.",h:"Can K1\u2019s own contact close before K1 is on?",ins:["X0","X1","X2"],outs:["Y0"],
  prog:one([cc("nc","X1"),cc("nc","X2"),cc("no","X0"),cc("no","Y0")]),
  o:["The Stop button is wired normally open","The coil is the wrong voltage","The overload relay needs resetting","The seal-in contact is wired in series with Start instead of in parallel"],a:3,
  w:"K1\u2019s contact can only close once K1 is on, but K1 can only come on if that contact is already closed. It must sit in parallel with Start."},
 {t:"Will not stop",s:"The motor starts and holds fine, but the Stop button does nothing.",h:"Press Stop while it runs and look at which contacts change in the coil path.",ins:["X0","X1","X2"],outs:["Y0"],
  prog:one([cc("nc","X2"),{par:[cc("no","X0"),cc("no","Y0")]}]),
  o:["The coil is shorted","The overload contact is welded shut","The Start button is stuck closed","The Stop button is not in the circuit, as if it has been bridged out"],a:3,
  w:"There is no Stop contact in series with the coil, so nothing opens when Stop is pressed and the seal-in keeps the coil on. A welded overload contact would not stop the motor either, but here a trip does stop it."},
 {t:"Both contactors close",s:"Press Fwd, release it, then press Rev. Both contactors pull in. In a real panel that would short the supply.",h:"What stops one contactor closing while the other is on?",ins:["X0","X3","X1","X2"],outs:["Y0","Y1"],nm:{X0:"Fwd",Y0:"F"},
  prog:[{slots:[cc("nc","X1"),cc("nc","X2"),{par:[cc("no","X0"),cc("no","Y0")]}],coil:"Y0"},{slots:[cc("nc","X1"),cc("nc","X2"),{par:[cc("no","X3"),cc("no","Y1")]}],coil:"Y1"}],
  o:["The Stop button is wired normally open","The normally closed interlock contacts are missing","The overload relay is faulty","The seal-in contacts are missing"],a:1,
  w:"Each rung should have a normally closed contact of the other contactor in series. Without them nothing prevents F and R from closing together."}
];
var FI=0, FIN={X0:false,X1:false,X2:false,X3:false}, FST={}, FTA={}, FUI=[];
function fnm(a){var s=SC[FI];return (s.nm&&s.nm[a])||FN[a]}
function fEl(c){return '<div class="el"><span class="sm">'+(c.k==="no"?"NO":"NC")+'</span><b class="fn">'+fnm(c.a)+'</b></div>'}
function fBuild(){
  var h="";
  SC[FI].prog.forEach(function(r){
    h+='<div class="rung"><div class="rline"><span class="rail"></span>';
    r.slots.forEach(function(sl){h+='<span class="wire"></span>'+(sl.par?'<div class="par">'+fEl(sl.par[0])+fEl(sl.par[1])+'</div>':fEl(sl))});
    h+='<span class="wire"></span><div class="el coil"><b class="cs">( )</b><b class="fn">'+fnm(r.coil)+'</b></div><span class="rail"></span></div></div>';
  });
  var box=document.getElementById("fRungs"); box.innerHTML=h;
  FUI=[].map.call(box.querySelectorAll(".rung"),function(ru){
    var line=ru.querySelector(".rline");
    return {wires:line.querySelectorAll(":scope>.wire"),
      slots:[].map.call(line.querySelectorAll(":scope>.el:not(.coil), :scope>.par"),function(n){return n.classList.contains("par")?{els:n.querySelectorAll(".el")}:{el:n}}),
      coil:line.querySelector(".coil")};
  });
}
function fPaint(snap){
  var s=SC[FI];
  FUI.forEach(function(u,i){
    var sn=snap&&snap[i], len=u.slots.length;
    u.slots.forEach(function(sl,j){
      var d=sn&&sn.sn[j];
      if(sl.els){sl.els[0].classList.toggle("live",!!(d&&d.a));sl.els[1].classList.toggle("live",!!(d&&d.b))}
      else sl.el.classList.toggle("live",!!(d&&d.out));
    });
    u.wires.forEach(function(w,j){w.classList.toggle("live",!!sn&&(j<len?(j===0||sn.sn[j-1].out):sn.out))});
    u.coil.classList.toggle("live",!!(sn&&sn.out));
  });
  [].forEach.call(document.querySelectorAll("#fIn [data-x]"),function(b){var on=!!FIN[b.dataset.x];b.classList.toggle("on",on);b.setAttribute("aria-pressed",on)});
  s.outs.forEach(function(y){document.getElementById("fo"+y).classList.toggle("on",!!FST[y])});
  var all=s.outs.every(function(y){return FST[y]});
  document.getElementById("fStatus").textContent=s.outs.map(function(y){return fnm(y)+" "+(FST[y]?"ON":"off")}).join(" \u00b7 ")+(s.outs.length>1&&all?" \u00b7 Both on: that would short the supply!":"");
}
function fNavDraw(){
  PG.f=PG.f||[];
  document.getElementById("fNav").innerHTML=SC.map(function(x,i){return '<button type="button" class="chip'+(i===FI?" on":"")+'" data-i="'+i+'" aria-label="Fault '+(i+1)+'">'+(i+1)+(PG.f.indexOf(i)>=0?" \u2713":"")+'</button>'}).join("");
}
var fSnap=null;
function fGo(i){
  FI=i; var s=SC[i];
  FIN={X0:false,X1:false,X2:false,X3:false}; FST={}; FTA={}; fSnap=null;
  document.getElementById("fTitle").textContent="Fault "+(i+1)+" of "+SC.length+": "+s.t;
  document.getElementById("fSym").textContent=s.s;
  document.getElementById("fOpts").innerHTML=s.o.map(function(o,j){return '<button type="button" class="qo" data-o="'+j+'">'+o+'</button>'}).join("");
  ["fWhy","fHintT","fNext"].forEach(function(id){document.getElementById(id).hidden=true});
  document.getElementById("fHint").textContent="Show hint";
  var ih="",oh="";
  s.ins.forEach(function(x){ih+='<button type="button" class="chip" data-x="'+x+'" aria-pressed="false">'+(x==="X2"?"Trip overload":"Press "+fnm(x))+'</button>'});
  s.outs.forEach(function(y){oh+='<span class="ind" id="fo'+y+'">'+fnm(y)+' contactor</span>'});
  document.getElementById("fIn").innerHTML=ih; document.getElementById("fOut").innerHTML=oh;
  fBuild(); fNavDraw(); fPaint(null);
}
var fin=document.getElementById("fIn");
fin.addEventListener("pointerdown",function(e){
  var b=e.target.closest("[data-x]"); if(!b) return; e.preventDefault();
  var x=b.dataset.x; if(x==="X2") FIN.X2=!FIN.X2; else FIN[x]=true;
  fSnap=plcRun(SC[FI].prog,FST,FTA,FIN); fPaint(fSnap);
});
function fRel(e){var b=e.target.closest("[data-x]");if(b&&b.dataset.x!=="X2"&&FIN[b.dataset.x]){FIN[b.dataset.x]=false;fPaint(fSnap)}}
["pointerup","pointercancel","pointerout"].forEach(function(t){fin.addEventListener(t,fRel)});
fin.addEventListener("keydown",function(e){var b=e.target.closest("[data-x]");if(b&&(e.key===" "||e.key==="Enter")&&!e.repeat){e.preventDefault();var x=b.dataset.x;if(x==="X2")FIN.X2=!FIN.X2;else FIN[x]=true;fPaint(fSnap)}});
fin.addEventListener("keyup",function(e){var b=e.target.closest("[data-x]");if(b&&(e.key===" "||e.key==="Enter")&&b.dataset.x!=="X2"){FIN[b.dataset.x]=false;fPaint(fSnap)}});
document.getElementById("fNav").addEventListener("click",function(e){var b=e.target.closest("[data-i]");if(b)fGo(+b.dataset.i)});
document.getElementById("fNext").addEventListener("click",function(){fGo(FI+1);window.scrollTo(0,0)});
document.getElementById("fHint").addEventListener("click",function(){
  var t=document.getElementById("fHintT"); t.textContent=SC[FI].h; t.hidden=!t.hidden;
  this.textContent=t.hidden?"Show hint":"Hide hint";
});
document.getElementById("fOpts").addEventListener("click",function(e){
  var b=e.target.closest(".qo"); if(!b||b.disabled) return;
  var s=SC[FI], j=+b.dataset.o, w=document.getElementById("fWhy");
  if(j===s.a){
    [].forEach.call(document.querySelectorAll("#fOpts .qo"),function(x){x.disabled=true});
    b.classList.add("right");
    PG.f=PG.f||[]; if(PG.f.indexOf(FI)<0){PG.f.push(FI);pgSave()}
    pgShow(); fNavDraw();
    w.textContent="Correct. "+s.w+(PG.f.length>=SC.length?" You have solved all "+SC.length+" faults.":""); w.hidden=false;
    document.getElementById("fNext").hidden=FI>=SC.length-1;
  }else{
    b.classList.add("wrong"); b.disabled=true;
    w.textContent="Not quite. Operate the circuit again and compare what it does with each suspect."; w.hidden=false;
  }
});
setInterval(function(){
  if(!document.getElementById("v-faults").classList.contains("active")) return;
  fSnap=plcRun(SC[FI].prog,FST,FTA,FIN); fPaint(fSnap);
},100);
document.querySelector("nav").insertAdjacentHTML("beforeend",'<a href="#faults" data-v="faults">Faults</a>');
document.querySelector("#v-home .grid").insertAdjacentHTML("beforeend",'<a class="card" href="#faults"><h3>Fault finding</h3><p>Each circuit has a hidden wiring error. Operate it, diagnose it and say what is wrong.</p><span class="tag next">Ready</span></a>');
function fgShow(){
  PG.f=PG.f||[]; var m=PG.f.length, t=document.querySelector('.card[href="#faults"] .tag');
  t.textContent=m>=SC.length?"All solved":m+" of "+SC.length+" solved"; t.classList.toggle("done",m>=SC.length); t.classList.toggle("next",m<SC.length);
}
var _pg=pgShow;
pgShow=function(){_pg();fgShow();document.getElementById("pgTxt").textContent+=" \u00b7 "+PG.f.length+" of "+SC.length+" faults solved"};
fGo(0); pgShow(); route();
TESTS.push(
  ["Fault 1: the motor drops out when Start is released",function(){var s={},t={},i={X0:true,X1:false,X2:false,X3:false},p=SC[0].prog;runP(p,s,t,i,1);var a=s.Y0===true;i.X0=false;runP(p,s,t,i,1);return a&&s.Y0===false}],
  ["Fault 4: the circuit can never start",function(){var s={},t={},i={X0:true,X1:false,X2:false,X3:false};runP(SC[3].prog,s,t,i,5);return !s.Y0}],
  ["Fault 6: both contactors can close together",function(){var s={},t={},i={X0:true,X1:false,X2:false,X3:false},p=SC[5].prog;runP(p,s,t,i,1);i.X0=false;i.X3=true;runP(p,s,t,i,2);return s.Y0===true&&s.Y1===true}]
);
