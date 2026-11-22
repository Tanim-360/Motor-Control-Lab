/* ---------- Simulation engine (Stage 2) ----------
   A circuit is data: inputs plus rungs. Each rung has a coil name and a logic tree:
   ["no",x] contact closed when x is on, ["nc",x] closed when x is off,
   ["and",...] series contacts, ["or",...] parallel branches.
   type:"ton" makes the coil an on-delay timer (delay in seconds). */
function Engine(spec){
  var me=this; this.spec=spec; this.s={}; this.acc={}; this.en={};
  (spec.inputs||[]).forEach(function(n){me.s[n]=false});
  spec.rungs.forEach(function(r){me.s[r.coil]=false; if(r.type==="ton"){me.acc[r.coil]=0;me.en[r.coil]=false}});
}
Engine.prototype.ev=function(x){
  var me=this,op=x[0];
  if(op==="no") return !!this.s[x[1]];
  if(op==="nc") return !this.s[x[1]];
  var a=x.slice(1).map(function(y){return me.ev(y)});
  return op==="and"?a.every(Boolean):a.some(Boolean);
};
Engine.prototype.set=function(n,v){this.s[n]=!!v};
Engine.prototype.solve=function(){
  for(var i=0;i<20;i++){
    var changed=false;
    for(var j=0;j<this.spec.rungs.length;j++){
      var r=this.spec.rungs[j], e=this.ev(r.logic), v=e;
      if(r.type==="ton"){ this.en[r.coil]=e; if(!e) this.acc[r.coil]=0; v=e&&this.acc[r.coil]>=r.delay; }
      if(this.s[r.coil]!==v){this.s[r.coil]=v;changed=true}
    }
    if(!changed) return true;
  }
  return false; // never settled: the circuit oscillates
};
Engine.prototype.tick=function(dt){
  this.solve();
  for(var j=0;j<this.spec.rungs.length;j++){
    var r=this.spec.rungs[j];
    if(r.type==="ton"&&this.en[r.coil]) this.acc[r.coil]+=dt;
  }
  return this.solve();
};

