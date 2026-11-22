/* ---------- PLC ladder module (Stage 7) ---------- */
var INS={X0:"Start",X1:"Stop",X2:"Sensor",X3:"Aux"}, OUTS={Y0:"Motor",Y1:"Lamp",Y2:"Horn",M0:"Memory",T0:"Timer"};
var CONT=["X0","X1","X2","X3","Y0","Y1","Y2","M0","T0"], COILS=["Y0","Y1","Y2","M0","T0"];
function cc(k,a){return {k:k,a:a}}
function P1(){return [{slots:[cc("nc","X1"),{par:[cc("no","X0"),cc("no","Y0")]}],coil:"Y0"},{slots:[cc("no","Y0")],coil:"Y1"}]}
function P2(){return [{slots:[cc("nc","X1"),cc("nc","Y1"),{par:[cc("no","X0"),cc("no","Y0")]}],coil:"Y0"},{slots:[cc("nc","X1"),cc("nc","Y0"),{par:[cc("no","X3"),cc("no","Y1")]}],coil:"Y1"}]}
function P3(){return [{slots:[cc("no","X0")],coil:"T0"},{slots:[cc("no","T0")],coil:"Y0"},{slots:[cc("no","X0"),cc("nc","T0")],coil:"Y1"}]}
/* one scan: read inputs, solve rungs top to bottom, write outputs */
function plcRun(prog,st,ta,inp){
  var cl=function(c){var v=!!st[c.a];return c.k==="nc"?!v:v};
  Object.keys(inp).forEach(function(n){st[n]=inp[n]});
  return prog.map(function(r){
    var live=true, sn=[];
    r.slots.forEach(function(sl){
      if(sl.par){var a=live&&cl(sl.par[0]), b=live&&cl(sl.par[1]); live=a||b; sn.push({a:a,b:b,out:live})}
      else{live=live&&cl(sl); sn.push({out:live})}
    });
    if(!r.slots.length) live=false;
    if(r.coil==="T0"){ta.T0=live?(ta.T0||0)+1:0; st.T0=live&&ta.T0>=30}
    else st[r.coil]=live;
    return {sn:sn,out:live};
  });
}
var PROG=P1(), ST={}, TA={}, IN={X0:false,X1:false,X2:false,X3:false}, SNAP=null, scanN=0, RUN=true, UI=[];
function opt(list,sel){return list.map(function(a){return '<option'+(a===sel?' selected':'')+'>'+a+'</option>'}).join("")}
function pEl(c,i,j,b){
  var at='data-r="'+i+'" data-s="'+j+'" data-b="'+b+'"';
  return '<div class="el"><select '+at+' data-f="k" aria-label="Contact type"><option value="no"'+(c.k==="no"?" selected":"")+'>NO</option><option value="nc"'+(c.k==="nc"?" selected":"")+'>NC</option></select><select '+at+' data-f="a" aria-label="Address">'+opt(CONT,c.a)+'</select></div>';
}
function pBuild(){
  var box=document.getElementById("rungs"), h="";
  PROG.forEach(function(r,i){
    h+='<div class="rung"><div class="rnum">Rung '+(i+1)+'</div><div class="rline"><span class="rail"></span>';
    r.slots.forEach(function(sl,j){
      h+='<span class="wire"></span>';
      h+=sl.par?'<div class="par">'+pEl(sl.par[0],i,j,0)+pEl(sl.par[1],i,j,1)+'</div>':pEl(sl,i,j,"");
    });
    h+='<span class="wire"></span><div class="el coil"><b class="cs">( )</b><select data-r="'+i+'" data-coil="1" aria-label="Output">'+opt(COILS,r.coil)+'</select>'+(r.coil==="T0"?'<span class="sm">TON 3 s</span>':'')+'</div><span class="rail"></span></div>';
    h+='<div class="rctl"><button type="button" data-r="'+i+'" data-act="addc">+ Contact</button><button type="button" data-r="'+i+'" data-act="addp">+ Parallel</button><button type="button" data-r="'+i+'" data-act="undo">Remove last</button><button type="button" data-r="'+i+'" data-act="del">Delete rung</button></div></div>';
  });
  box.innerHTML=h||'<p class="hint">No rungs yet. Add one below.</p>';
  UI=[].map.call(box.querySelectorAll(".rung"),function(ru){
    var line=ru.querySelector(".rline");
    return {
      wires:line.querySelectorAll(":scope>.wire"),
      slots:[].map.call(line.querySelectorAll(":scope>.el:not(.coil), :scope>.par"),function(n){return n.classList.contains("par")?{els:n.querySelectorAll(".el")}:{el:n}}),
      coil:line.querySelector(".coil")
    };
  });
}
function pPaint(){
  UI.forEach(function(u,i){
    var sn=SNAP&&SNAP[i], len=u.slots.length;
    u.slots.forEach(function(sl,j){
      var d=sn&&sn.sn[j];
      if(sl.els){sl.els[0].classList.toggle("live",!!(d&&d.a));sl.els[1].classList.toggle("live",!!(d&&d.b))}
      else sl.el.classList.toggle("live",!!(d&&d.out));
    });
    u.wires.forEach(function(w,j){
      var on=!!sn&&(j<len?(j===0||sn.sn[j-1].out):sn.out);
      w.classList.toggle("live",on);
    });
    u.coil.classList.toggle("live",!!(sn&&sn.out));
  });
  Object.keys(INS).forEach(function(x){
    var c=document.getElementById("pi"+x); c.classList.toggle("on",IN[x]); c.setAttribute("aria-pressed",IN[x]);
  });
  Object.keys(OUTS).forEach(function(y){
    var c=document.getElementById("po"+y); c.classList.toggle("on",!!ST[y]);
    c.textContent=y+" "+OUTS[y]+(y==="T0"?" "+((TA.T0||0)/10).toFixed(1)+"/3 s":"");
  });
  document.getElementById("pStatus").textContent=(RUN?"RUN":"STOPPED")+" \u00b7 scan "+scanN+". "+(RUN?"Each scan reads inputs, solves the rungs top to bottom, then updates outputs.":"Press Step to run a single scan.");
  document.getElementById("pRun").textContent=RUN?"Stop PLC":"Run PLC";
  document.getElementById("pStep").disabled=RUN;
}
function pReset(){ST={};TA={};SNAP=null;scanN=0}
function pScan(){SNAP=plcRun(PROG,ST,TA,IN);scanN++;pPaint()}
(function(){
  var ih="",oh="";
  Object.keys(INS).forEach(function(x){ih+='<button type="button" class="chip" id="pi'+x+'" data-x="'+x+'" aria-pressed="false">'+x+' '+INS[x]+'</button>'});
  Object.keys(OUTS).forEach(function(y){oh+='<span class="ind" id="po'+y+'"></span>'});
  document.getElementById("pIn").innerHTML=ih; document.getElementById("pOut").innerHTML=oh;
  document.getElementById("pIn").addEventListener("click",function(e){var b=e.target.closest("[data-x]");if(b){IN[b.dataset.x]=!IN[b.dataset.x];pPaint()}});
})();
var rg=document.getElementById("rungs");
rg.addEventListener("change",function(e){
  var t=e.target, r=PROG[+t.dataset.r]; if(!r) return;
  if(t.dataset.coil) r.coil=t.value;
  else{var sl=r.slots[+t.dataset.s], c=t.dataset.b===""?sl:sl.par[+t.dataset.b]; c[t.dataset.f]=t.value}
  SNAP=null; pBuild(); pPaint();
});
rg.addEventListener("click",function(e){
  var b=e.target.closest("button[data-act]"); if(!b) return;
  var i=+b.dataset.r, r=PROG[i], a=b.dataset.act;
  if(a==="addc"&&r.slots.length<5) r.slots.push(cc("no","X0"));
  if(a==="addp"&&r.slots.length<5) r.slots.push({par:[cc("no","X0"),cc("no","Y0")]});
  if(a==="undo") r.slots.pop();
  if(a==="del") PROG.splice(i,1);
  SNAP=null; pBuild(); pPaint();
});
document.getElementById("pAddR").addEventListener("click",function(){
  if(PROG.length<6){PROG.push({slots:[],coil:"Y0"});SNAP=null;pBuild();pPaint()}
});
document.querySelector(".exrow").addEventListener("click",function(e){
  var b=e.target.closest("[data-ex]"); if(!b) return;
  PROG=[[],P1,P2,P3][+b.dataset.ex]; PROG=typeof PROG==="function"?PROG():[];
  pReset(); pBuild(); pPaint();
});
document.getElementById("pRun").addEventListener("click",function(){RUN=!RUN;pPaint()});
document.getElementById("pStep").addEventListener("click",pScan);
pBuild(); pPaint();
setInterval(function(){
  if(RUN&&document.getElementById("v-plc").classList.contains("active")) pScan();
},100);
function runP(prog,st,ta,inp,n){for(var i=0;i<n;i++)plcRun(prog,st,ta,inp)}
TESTS.push(
  ["PLC seal-in holds the output after Start is released",function(){var p=P1(),s={},t={},i={X0:true,X1:false};runP(p,s,t,i,1);i.X0=false;runP(p,s,t,i,1);return s.Y0===true&&s.Y1===true}],
  ["PLC Stop (NC contact) breaks the seal-in",function(){var p=P1(),s={},t={},i={X0:true,X1:false};runP(p,s,t,i,1);i.X0=false;i.X1=true;runP(p,s,t,i,1);return s.Y0===false}],
  ["PLC scan order: a contact above its coil sees last scan",function(){var p=[{slots:[cc("no","Y0")],coil:"Y1"},{slots:[cc("no","X0")],coil:"Y0"}],s={},t={},i={X0:true};runP(p,s,t,i,1);var a=!!s.Y1;runP(p,s,t,i,1);return a===false&&s.Y1===true}],
  ["PLC timer turns on after 3 seconds and resets",function(){var p=P3(),s={},t={},i={X0:true};runP(p,s,t,i,29);var a=!s.Y0;runP(p,s,t,i,2);var b=s.Y0===true;i.X0=false;runP(p,s,t,i,1);return a&&b&&s.Y0===false&&s.T0===false}]
);

