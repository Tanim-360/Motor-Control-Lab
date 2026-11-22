/* ---------- Component explainer (Stage 4) ---------- */
var INFO={
  mcb:{t:"MCB (miniature circuit breaker)",w:"A switch that opens by itself when it senses a short circuit or a heavy, sustained overcurrent. It also lets you isolate the circuit by hand for maintenance.",c:"It is the first device in the power path. If it is off, nothing downstream gets power. It does not protect the motor from a slow overload; the overload relay does that."},
  kmain:{t:"Contactor main contacts (K1)",w:"Three heavy-duty contacts, one per phase, that close together to connect the motor to the supply. They are built to handle motor current and the arc when they open.",c:"They close when coil K1 is energized and open again when it drops out. Watch them in the diagram as you press Start and Stop."},
  olr:{t:"Thermal overload relay",w:"It senses the motor current through heating elements. If the motor draws too much for too long, for example a jammed load, a bimetal strip bends and trips a contact. It does not interrupt the motor current itself.",c:"Its trip action opens the overload contact in the control circuit, which de-energizes the coil. It needs a manual reset. Use the Trip overload button to try it."},
  motor:{t:"Three-phase induction motor",w:"Three alternating currents, each shifted in time, create a rotating magnetic field in the stator. The rotor follows that field and turns.",c:"In a DOL start the motor sees full voltage straight away, so the starting current is roughly 6 to 8 times the rated current for a moment. That is fine for small motors, and it is why larger ones use star-delta."},
  stop:{t:"Stop push button (normally closed)",w:"A button whose contact is closed at rest and opens while you press it.",c:"It sits in series with the coil, so pressing it breaks the circuit and K1 drops out. It is wired normally closed so that a broken wire also stops the motor, which is the safe failure."},
  start:{t:"Start push button (normally open)",w:"A button whose contact is open at rest and closes only while you hold it. A spring returns it when you let go.",c:"It gives K1 its first push of current. After that the auxiliary contact takes over, so the button can be released."},
  aux:{t:"K1 auxiliary contact (seal-in)",w:"A small contact that moves together with the contactor main contacts. It carries only control current.",c:"It is wired in parallel with Start. Once K1 pulls in, this contact closes and holds the coil on, which is called a seal-in or holding contact. If power fails, it opens, so the motor does not restart by itself when power returns."},
  olc:{t:"Overload contact (normally closed)",w:"The auxiliary contact of the overload relay. It stays closed until the relay trips.",c:"It is in series with the coil. When the relay trips, this contact opens, the coil loses power and the motor stops."},
  coil:{t:"Contactor coil (K1)",w:"An electromagnet. When current flows through it, it pulls an armature that closes the contacts. A spring opens them again when the current stops.",c:"It runs on a small control current, often 24 V DC or 230 V AC, so the Start and Stop buttons never carry the motor current."}
};
var HOT=[
  ["dCtlW","stop",44,40,52,36,"Stop push button"],
  ["dCtlW","start",134,40,52,36,"Start push button"],
  ["dCtlW","aux",134,100,52,32,"K1 auxiliary contact"],
  ["dCtlW","olc",209,40,42,36,"Overload contact"],
  ["dCtlW","coil",275,38,40,44,"Contactor coil K1"],
  ["dPwrW","mcb",40,42,180,20,"MCB"],
  ["dPwrW","kmain",55,86,150,32,"K1 main contacts"],
  ["dPwrW","olr",40,136,180,20,"Overload relay"],
  ["dPwrW","motor",40,190,180,62,"Motor"]
];
function showInfo(key,r){
  var d=INFO[key];
  document.getElementById("infoT").textContent=d.t;
  document.getElementById("infoP").textContent=d.w;
  document.getElementById("infoC").textContent="In this circuit: "+d.c;
  document.getElementById("info").hidden=false;
  HOT.forEach(function(h){h[7].classList.toggle("sel",h[7]===r)});
}
HOT.forEach(function(h){
  var r=document.createElementNS(NS,"rect");
  r.setAttribute("x",h[2]);r.setAttribute("y",h[3]);r.setAttribute("width",h[4]);r.setAttribute("height",h[5]);
  r.setAttribute("class","hot");r.setAttribute("tabindex","0");r.setAttribute("role","button");
  r.setAttribute("aria-label",h[6]+": show explanation");
  r.addEventListener("click",function(){showInfo(h[1],r)});
  r.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();showInfo(h[1],r)}});
  document.getElementById(h[0]).parentNode.appendChild(r);
  h.push(r);
});
document.getElementById("infoX").addEventListener("click",function(){
  document.getElementById("info").hidden=true;
  HOT.forEach(function(h){h[7].classList.remove("sel")});
});

