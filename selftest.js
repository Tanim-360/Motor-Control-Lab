/* ---------- Engine self-test ---------- */
function dolSpec(){return {inputs:["start","stop","ol"],rungs:[{coil:"K1",logic:["and",["nc","ol"],["nc","stop"],["or",["no","start"],["no","K1"]]]}]}}
function timerSpec(){var s=dolSpec();s.rungs.push({coil:"T1",type:"ton",delay:3,logic:["no","K1"]});return s}
function interlockSpec(){
  function r(c,other,btn){return {coil:c,logic:["and",["nc","stop"],["nc",other],["or",["no",btn],["no",c]]]}}
  return {inputs:["fwd","rev","stop"],rungs:[r("F","R","fwd"),r("R","F","rev")]};
}
function press(e,n){e.set(n,1);e.solve();e.set(n,0);e.solve()}
var TESTS=[
  ["Start energizes the coil",function(){var e=new Engine(dolSpec());e.set("start",1);e.solve();return e.s.K1===true}],
  ["Seal-in holds after Start is released",function(){var e=new Engine(dolSpec());press(e,"start");return e.s.K1===true}],
  ["Stop drops the coil out",function(){var e=new Engine(dolSpec());press(e,"start");press(e,"stop");return e.s.K1===false}],
  ["Stop wins when Start is also held",function(){var e=new Engine(dolSpec());e.set("stop",1);e.set("start",1);e.solve();return e.s.K1===false}],
  ["Overload trip drops out and stays out after reset",function(){var e=new Engine(dolSpec());press(e,"start");e.set("ol",1);e.solve();var a=e.s.K1;e.set("ol",0);e.solve();return a===false&&e.s.K1===false}],
  ["On-delay timer waits 3 seconds, then resets on Stop",function(){var e=new Engine(timerSpec());press(e,"start");e.tick(2);var a=e.s.T1;e.tick(1.1);var b=e.s.T1;press(e,"stop");return a===false&&b===true&&e.s.T1===false}],
  ["Interlock blocks the second direction",function(){var e=new Engine(interlockSpec());press(e,"fwd");press(e,"rev");return e.s.F===true&&e.s.R===false}],
  ["Interlock works from the other side too",function(){var e=new Engine(interlockSpec());press(e,"rev");press(e,"fwd");return e.s.R===true&&e.s.F===false}],
  ["An oscillating circuit is detected",function(){var e=new Engine({inputs:[],rungs:[{coil:"X",logic:["nc","X"]}]});return e.solve()===false}]
];
document.getElementById("runTests").addEventListener("click",function(){
  var ul=document.getElementById("results"),pass=0;ul.innerHTML="";
  TESTS.forEach(function(t){
    var ok=false;try{ok=t[1]()}catch(err){ok=false}
    if(ok)pass++;
    var li=document.createElement("li");li.className=ok?"pass":"fail";
    li.textContent=(ok?"Pass: ":"Fail: ")+t[0];ul.appendChild(li);
  });
  document.getElementById("sum").textContent=pass+" of "+TESTS.length+" tests passed.";
});

