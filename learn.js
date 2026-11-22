/* ---------- Stage 8: quizzes, progress, explainers ---------- */
var PG={}; try{PG=JSON.parse(localStorage.getItem("mcl")||"{}")}catch(err){}
function pgSave(){try{localStorage.setItem("mcl",JSON.stringify(PG))}catch(err){}}
var MODS={dol:"DOL starter",fwdrev:"Forward-reverse control",stardelta:"Star-delta starter",plc:"PLC ladder logic"};
var QUIZ={
 dol:[
  {q:"What keeps the contactor energized after you release the Start button?",o:["The Stop button","The overload relay","K1\u2019s auxiliary (seal-in) contact","The motor itself"],a:2,w:"The auxiliary contact is wired in parallel with Start. Once K1 pulls in, that contact closes and holds the coil on."},
  {q:"Why is the Stop button wired as normally closed?",o:["It uses less current","It is cheaper","So it can double as a Start button","A broken wire also stops the motor, which is the safe failure"],a:3,w:"With a normally closed Stop, losing the wire has the same effect as pressing the button."},
  {q:"What does the thermal overload relay protect against?",o:["A slow, sustained overcurrent such as a jammed load","Short circuits","Low supply voltage","Wrong direction of rotation"],a:0,w:"Short circuits are the MCB\u2019s job. The overload relay reacts to current that is too high for too long."}
 ],
 fwdrev:[
  {q:"How do you reverse a three-phase motor?",o:["Swap any two of the three phases","Swap the neutral and earth","Lower the voltage","Reverse the control wiring"],a:0,w:"Swapping two phases reverses the rotating field, so the rotor turns the other way."},
  {q:"What does the interlock contact do?",o:["Stops the motor on overload","Holds the coil on","Speeds up the contactor","Blocks the other contactor while this one is closed"],a:3,w:"Each rung has a normally closed contact of the other contactor, so only one direction can be closed at a time."},
  {q:"What would happen if F and R closed together?",o:["The motor would run faster","Nothing would happen","Two phases would be shorted together","The motor would reverse slowly"],a:2,w:"F and R connect the same phases in a different order, so closing both would short the supply."}
 ],
 stardelta:[
  {q:"Why start a motor in star?",o:["It makes the motor run faster","It reduces the starting current","It reverses the motor","It saves cable"],a:1,w:"Each winding sees about 58% of the line voltage, so the line current is about one third of a direct start."},
  {q:"What does the timer do?",o:["It reverses the motor","It trips the overload","It switches from star to delta after a set delay","It opens the MCB"],a:2,w:"When the delay ends, its contacts drop out K3 and bring in K2."},
  {q:"Why do K3 and K2 have normally closed contacts in each other\u2019s rungs?",o:["So they can never close together and short the supply","To make the motor quieter","To count time","To reset the overload"],a:0,w:"Star and delta connect the windings differently, so both closed at once would be a short circuit."}
 ],
 plc:[
  {q:"What is the order of a PLC scan?",o:["Update outputs, read inputs, solve rungs","Read inputs, solve rungs top to bottom, update outputs","Solve rungs bottom to top, then read inputs","Rungs are solved at random"],a:1,w:"The PLC reads the inputs, solves the rungs from top to bottom, writes the outputs, then repeats."},
  {q:"Which contact passes power when its address is OFF?",o:["NO","NC","Both","Neither"],a:1,w:"A normally closed (examine if off) contact passes power while its address is off."},
  {q:"A parallel branch of Start and the motor\u2019s own output creates what?",o:["A timer","An interlock","A seal-in","A reset"],a:2,w:"The output holds itself on through its own contact, exactly like the K1 auxiliary contact."}
 ]
};
function pgShow(){
  var n=0;
  Object.keys(MODS).forEach(function(k){
    var t=document.querySelector('.card[href="#'+k+'"] .tag'), done=PG[k]>=2;
    if(done) n++;
    t.textContent=done?"Quiz passed":"Ready"; t.classList.toggle("done",done); t.classList.toggle("next",!done);
  });
  document.getElementById("pgTxt").textContent="Progress: "+n+" of 4 quizzes passed";
  document.getElementById("pgFill").style.width=(n*25)+"%";
}
document.querySelector("#v-home .grid").insertAdjacentHTML("beforebegin",'<p class="hint" id="pgTxt"></p><div class="meter" aria-hidden="true"><div id="pgFill"></div></div>');
function quizBuild(m){
  var sec=document.getElementById("v-quiz"+m), qs=QUIZ[m], score=0, done=0;
  function draw(){
    score=0; done=0;
    var h='<h1>'+MODS[m]+' quiz</h1><p class="lede">Pick an answer for each question. You pass with 2 out of '+qs.length+'.</p>';
    qs.forEach(function(q,i){
      h+='<div class="qq"><h3>'+(i+1)+'. '+q.q+'</h3>';
      q.o.forEach(function(o,j){h+='<button type="button" class="qo" data-q="'+i+'" data-o="'+j+'">'+o+'</button>'});
      h+='<p class="why" hidden></p></div>';
    });
    h+='<div id="res'+m+'"></div><p><a href="#'+m+'">Back to the module</a></p>';
    sec.innerHTML=h;
  }
  sec.addEventListener("click",function(e){
    var b=e.target.closest(".qo");
    if(b&&!b.disabled){
      var qi=+b.dataset.q, oi=+b.dataset.o, q=qs[qi], box=b.parentNode, ok=oi===q.a;
      [].forEach.call(box.querySelectorAll(".qo"),function(x){x.disabled=true;if(+x.dataset.o===q.a)x.classList.add("right")});
      if(!ok) b.classList.add("wrong");
      var w=box.querySelector(".why"); w.textContent=(ok?"Correct. ":"Not quite. ")+q.w; w.hidden=false;
      if(ok) score++; done++;
      if(done===qs.length){
        PG[m]=Math.max(PG[m]||0,score); pgSave(); pgShow();
        document.getElementById("res"+m).innerHTML='<p class="score">'+score+' out of '+qs.length+(score>=2?" \u00b7 Passed":" \u00b7 Try again")+'</p><button type="button" class="runbtn" data-retry="1">Retry quiz</button>';
      }
    }
    if(e.target.closest("[data-retry]")){draw();window.scrollTo(0,0)}
  });
  draw();
}
Object.keys(MODS).forEach(function(k){
  var sec=document.getElementById("v-"+k), p=document.createElement("p");
  p.className="sub"; p.innerHTML='<a class="runbtn linkbtn" href="#quiz'+k+'">Take the quiz</a>';
  sec.insertBefore(p,sec.querySelector(".dock"));
  quizBuild(k);
});
pgShow();

function explain(sec,list,data){
  var root=document.getElementById("v-"+sec), dock=root.querySelector(".dock"), box=document.createElement("div"), rs=[];
  box.className="info"; box.hidden=true;
  box.innerHTML='<button type="button" class="x" aria-label="Close explanation">Close</button><h3></h3><p></p><p></p>';
  dock.insertBefore(box,dock.firstChild);
  root.querySelector(".pair").insertAdjacentHTML("beforebegin",'<p class="hint">Tap any component in either diagram to see what it is and why it is there.</p>');
  function show(k,r){
    var d=data[k]; box.children[1].textContent=d.t; box.children[2].textContent=d.w; box.children[3].textContent="In this circuit: "+d.c;
    box.hidden=false; rs.forEach(function(x){x.classList.toggle("sel",x===r)});
  }
  box.children[0].addEventListener("click",function(){box.hidden=true;rs.forEach(function(x){x.classList.remove("sel")})});
  list.forEach(function(h){
    var r=document.createElementNS(NS,"rect");
    r.setAttribute("x",h[2]);r.setAttribute("y",h[3]);r.setAttribute("width",h[4]);r.setAttribute("height",h[5]);
    r.setAttribute("class","hot");r.setAttribute("tabindex","0");r.setAttribute("role","button");
    r.setAttribute("aria-label",h[6]+": show explanation");
    r.addEventListener("click",function(){show(h[1],r)});
    r.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();show(h[1],r)}});
    document.getElementById(h[0]).parentNode.appendChild(r); rs.push(r);
  });
}
var FH=[];
[50,150].forEach(function(a){
  var b=a+38;
  FH.push(["frCtl","stop",36,a-14,38,28,"Stop push button"],["frCtl","ol",81,a-14,38,28,"Overload contact"],["frCtl","start",141,a-14,38,28,"Direction push button"],["frCtl","aux",141,b-14,38,28,"Auxiliary contact"],["frCtl","ilk",201,a-14,38,28,"Interlock contact"],["frCtl","coil",272,a-18,36,36,"Contactor coil"]);
});
FH.push(["frPwr","swap",60,30,240,120,"Phase connections"],["frPwr","motor",150,212,60,56,"Motor"]);
explain("fwdrev",FH,{
  stop:{t:"Stop push button (normally closed)",w:"Opens the circuit while pressed.",c:"It is shared by both rungs, so one press drops out whichever contactor is closed. It also has to be pressed before changing direction."},
  ol:{t:"Overload contact (normally closed)",w:"The auxiliary contact of the thermal overload relay.",c:"It opens when the relay trips and cuts power to both coils."},
  start:{t:"Fwd or Rev push button (normally open)",w:"Closes only while you hold it.",c:"It gives the coil its first push of current. The coil\u2019s own auxiliary contact then holds it on."},
  aux:{t:"Auxiliary contact (seal-in)",w:"A small contact that moves with the contactor.",c:"It is wired in parallel with the direction button, so the coil stays on after you release the button."},
  ilk:{t:"Interlock contact (normally closed)",w:"A contact of the opposite contactor, wired in series with this coil.",c:"While F is closed, its contact opens the Rev rung, and the other way round. Many starters add a mechanical interlock between the two contactors as well."},
  coil:{t:"Contactor coil (F or R)",w:"An electromagnet that closes its contactor\u2019s main contacts when energized.",c:"F connects L1, L2, L3 to U, V, W. R swaps L1 and L3."},
  swap:{t:"Phase connections",w:"A three-phase motor turns the way its magnetic field rotates, and the field direction depends on the phase order.",c:"Forward uses the straight lines. Reverse uses the crossed lines, which swap L1 and L3 and so reverse the field. L2 stays where it is."},
  motor:{t:"Three-phase motor",w:"Turns one way or the other depending on the phase order.",c:"The fan turns clockwise for Forward and the other way for Reverse."}
});
var SH=[["sdCtl","k1",275,26,50,28,"K1 coil"],["sdCtl","k3",275,114,50,28,"K3 coil"],["sdCtl","k2",275,170,50,28,"K2 coil"],["sdCtl","t1",275,254,50,28,"T1 timer coil"],
 ["sdCtl","t1c",176,112,38,32,"T1 contact"],["sdCtl","t1c",176,168,38,32,"T1 contact"],["sdCtl","ilk",106,112,38,32,"Interlock contact"],["sdCtl","ilk",106,168,38,32,"Interlock contact"],
 ["sdPwr","wind",30,120,160,150,"Motor windings"]];
explain("stardelta",SH,{
  k1:{t:"K1 line contactor",w:"Connects the supply to one end of each motor winding.",c:"It closes at Start and stays closed through both star and delta. Its auxiliary contacts feed the other rungs."},
  k3:{t:"K3 star contactor",w:"Joins the other ends of the three windings together, which makes the star point.",c:"It is closed only during starting. When the timer ends it drops out."},
  k2:{t:"K2 delta contactor",w:"Connects the windings end to end in a triangle, so each winding gets the full line voltage.",c:"It closes after the timer ends and then holds itself on with its own auxiliary contact."},
  t1:{t:"T1 on-delay timer",w:"Starts counting when its coil gets power and switches its contacts when the set time ends.",c:"It counts 5 seconds, which is meant to be long enough for the motor to speed up in star. Real starters set this to match the motor and load."},
  t1c:{t:"T1 time-delay contacts",w:"Contacts that change state only after the timer has finished counting.",c:"The normally closed one opens the K3 rung at timeout. The normally open one closes the K2 rung at the same moment."},
  ilk:{t:"Interlock contact (normally closed)",w:"A contact of the opposite contactor, wired in series with this coil.",c:"K3 can only close if K2 is open, and K2 can only close if K3 is open, so the two can never be closed together."},
  wind:{t:"Motor windings",w:"The three windings can be connected as a Y (star) or as a triangle (delta).",c:"In star each winding sees about 58% of the line voltage, which cuts starting current and torque to about one third. In delta each winding gets full voltage for normal running."}
});

