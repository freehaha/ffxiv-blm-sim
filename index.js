var skills = require('./skills');
var config = require('./config.json');
var INIT_TICK = Math.floor(Math.random()*100 + 1)/100 * 3;
var sprintf = require('sprintf-js').sprintf;

console.log('tick ', INIT_TICK);

var state = {
  phase: "NONE",
  init: true,
  stack: 0,
  animation: 0,
  phaseTimer: 0,
  time: 0,
  gcd: 0,
  tick: 0 - INIT_TICK,
  mp: config.MaxMp,
  potency: 0,
  procs: {},
  recast: {},
  enochian: false,
  umbralhearts: 0,
  polyglot: 0,
};

var target = {
  dots: {}
};

function cast(state, spell) {
  var timestamp = sprintf("[%06.2f]", state.time);
  if(state.recast[spell.name] > 0) {
    console.error("can't cast", spell.name, ": on cooldown", state.recast[spell.name]);
    return false;
  }
  if(state.animation > 0) {
    console.error("can't cast", spell.name, ": in animation lock");
    return false;
  }
  console.log(timestamp, "casting", spell.name);
  if(state.mp < spell.mp) {
    console.error("can't cast", spell.name, ": Not enough mp");
    return false;
  }
  if(spell.require) {
    for(var r of spell.require) {
      if(r == 'enochian') {
        if(!state.enochian) {
          console.error("can't cast", spell.name, ": no enochain");
          process.exit(1);
        }
      } else if(r == 'ICE') {
        if(state.stack >= 0) {
          console.error("can't cast", spell.name, ": not in ICE phase");
          process.exit(1);
        }
      } else if(r == 'FIRE') {
        if(state.stack <= 0) {
          console.error("can't cast", spell.name, ": not in FIRE phase");
          process.exit(1);
        }
      } else if(r == 'foul') {
        if(!state.foul) {
          console.error("can't cast", spell.name, ": doesn't have foul");
          process.exit(1);
        }
      }
    }
  }
  if(spell.dot) {
    var d = spell.dot;
    target.dots[spell.name] = {
      duration: d.duration,
      potency: d.potency,
      proc: d.proc,
    };
  }
  if(spell.proc) {
    if(spell.proc.chance > Math.floor(Math.random()*100)) {
      state.procs[spell.proc.name] = spell.proc.duration;
      console.log("+", spell.proc.name, "proc");
    }
  }
  if(spell.consumes) {
    for(var consume of spell.consumes) {
      if(!state.procs.hasOwnProperty(consume)) {
        console.error("no such proc", consume);
      } else {
        delete state.procs[consume];
      }
    }
  }
  state.recast[spell.name] = spell.recast;
  state.mp -= spell.mp;
  state.potency += spell.potency;
  console.log("potency +", spell.potency);
  phase(state, spell);
  if(spell.gcd) {
    state.gcd = Math.max(spell.cast, config.gcd);
  }
  state.animation = spell.animation || 0.1;
  console.log("anim", state.animation);
}

function tick(state) {
  var remove = [];
  if(state.phaseTimer > 0) {
    state.phaseTimer -= 0.01;
    if(state.phaseTimer <= 0) {
      state.phaseTimer = 0;
      state.enochian = false;
    }
  }
  state.time += 0.01;
  state.tick += 0.01;
  state.gcd -= 0.01;
  if(state.gcd < 0) {
    state.gcd = 0;
  }
  state.animation -= 0.01;
  if(state.animation < 0) {
    state.animation = 0;
  }
  state.polyglot -= 0.01;
  if(state.polyglot <= 0) {
    state.polyglot = 30.01;
    if(state.foul) {
      console.log("overwriting foul!!")
    }
    state.foul = true;
  }
  /* recast timers */
  for(var r in state.recast) {
    state.recast[r] -= 0.01;
    if(state.recast[r] <= 0) {
      state.recast[r] = 0;
    }
  }

  // dots
  remove = [];
  var dotPotency = 0;
  for(var d in target.dots) {
    target.dots[d].duration -= 0.01;
    if(target.dots[d].duration <= 0) {
      remove.push(d);
    }
  }
  for(var r of remove) {
    delete target.dots[r];
  }

  if(state.tick < 3) {
    return;
  }
  console.log('tick!');
  state.tick = 0;

  // dot tick
  for(var d in target.dots) {
    var dot = target.dots[d];
    console.log(d, 'tick for', dot.potency);
    state.potency += dot.potency;
    if(dot.proc) {
      if(dot.proc.chance > Math.floor(Math.random()*100)) {
        console.log(dot.proc.name, 'proc');
        state.procs[dot.proc.name] = dot.proc.duration;
      }
    }
  }

  // restore mp
  if(state.stack < 0) {
    var mpgain = Math.floor(config.MaxMp * config.UIMPBonus[Math.abs(state.stack) - 1]);
    console.log('mp s:', state.stack, 'gain: ', mpgain);
    state.mp += mpgain;
  } else if(state.stack == 0) {
    state.mp += config.MaxMp * 0.03;
  }
  if(state.mp > config.MaxMp) {
    state.mp = config.MaxMp;
  }
}

function phase(state, spell) {
  // console.log('phase', state, spell);
  if(spell.type == "CONVERT") {
    if(state.stack > 0) {
      state.stack = -1;
      state.phase = 'ICE';
    } else if (state.stack < 0) {
      state.stack = 1;
      state.phase = 'FIRE';
    }
    return;
  }
  if(spell.type == 'ENOCHIAN') {
    if(state.stack != 0) {
      state.enochian = true;
      state.polyglot = 30;
    } else {
      console.error("Enochian has no effect!");
    }
    return;
  }
  if(spell.type == 'FOUL') {
    if(!state.foul) {
      console.error("phase foul: no foul.")
      process.exit(1);
    }
    state.foul = false;
  }
  if(spell.name == 'Blizzard IV') {
    state.umbralhearts = 3;
  }
  if(spell.type == 'FIRE' && spell.mp > 0 && state.umbralhearts > 0) {
    state.umbralhearts--;
  }
  if(spell.name == 'Fire IV') {
    return;
  }
  if(spell.type != 'FIRE' && spell.type != 'ICE') {
    return;
  }
  if(spell.name === 'Fire III') {
    state.stack = 3;
    state.phaseTimer = config.PhaseDuration + spell.cast;
  } else if(spell.name === 'Blizzard III') {
    state.stack = -3;
    state.phaseTimer = config.PhaseDuration + spell.cast;
  } else if(state.stack == 0) {
    state.stack += (spell.type==='FIRE'?1:-1);
  } else {
    if(state.phaseTimer - spell.cast < 0) {
      console.error('dropping phase!!')
      state.stack = 0;
    }
    if(state.stack > 0 && spell.type === 'FIRE') {
      state.phaseTimer = config.PhaseDuration + spell.cast;
      state.stack++;
    } else if(state.stack < 0 && spell.type === 'ICE') {
      state.phaseTimer = config.PhaseDuration + spell.cast;
      state.stack--;
    } else {
      state.phaseTimer = 0;
      state.stack = 0;
    }
  }

  if(state.stack > 3) {
    state.stack = 3;
  } else if(state.stack < -3) {
    state.stack = -3;
  }
  if(state.stack > 0) {
    state.phase = "FIRE";
  } else if(state.stack < 0) {
    state.phase = 'ICE';
  }
}

var next = function(state) {
  if(state.animation > 0) {
    return 1;
  }
  if(state.init) {
    var s = skills['Fire III'](state);
    if(state.stack > 0) {
      s = skills['Enochian'](state);
      cast(state, s);
      state.init = false;
      return 1;
    }
    var s = skills['Fire III'](state);
    cast(state, s);
    return;
  }
  if(state.phaseTimer <= 0) {
    console.error("dropped phase timer!!!!")
    process.exit(1);
  }
  var stack = state.stack;
  if(state.stack > 0) {
    if(state.gcd > 0) {
      return 1;
    }
    var f1 = skills['Fire'](state);
    var f4 = skills['Fire IV'](state);
    var b3 = skills['Blizzard III'](state);
    var f3 = skills['Fire III'](state);
    var t3 = skills['Thunder III'](state);
    if(t3.mp == 0 && f3.mp == 0 && state.phaseTimer > 2 * config.gcd) {
      console.log('use t3p');
      cast(state, t3);
    } else if(state.mp > f4.mp + b3.mp && state.phaseTimer > f4.cast + f1.cast) {
      cast(state, f4);
    } else if(f3.mp == 0) {
      console.log('use f3p');
      cast(state, f3);
    } else if(f1.mp + b3.mp < state.mp) {
      cast(state, f1);
    } else {
      cast(state, b3);
    }
  } else if (state.stack < 0) {
    if(state.gcd > 0) {
      return 1;
    }
    var b1 = skills['Blizzard'](state);
    var f3 = skills['Fire III'](state);
    var t3 = skills['Thunder III'](state);
    var b4 = skills['Blizzard IV'](state);
    var convert = skills['Convert'](state);
    var foul = skills['Foul'](state);
    if(state.foul && state.polyglot < 3*config.gcd) {
      cast(state, foul);
      return 1;
    }
    if(state.umbralhearts < 3 && state.mp > b4.mp) {
      cast(state, b4);
      return 1;
    }
    if(state.mp > t3.mp && 
      (!target.dots['Thunder III'] || target.dots['Thunder III'].duration < 12)) {
      cast(state, t3);
      return 1;
    }
    if(t3.mp == 0 && state.phaseTimer > (f3.cast + config.gcd) && target.dots['Thunder III'].duration <= 21) {
      cast(state, t3);
      return 1;
    }
    if(state.foul) {
      cast(state, foul);
      return 1;
    }
    if(state.mp < b1.mp) {
      return 1;
    }
    var mpgain = Math.floor(config.MaxMp * config.UIMPBonus[Math.abs(state.stack) - 1]);
    if(state.mp < config.MaxMp) {
      cast(state, b1);
    } else {
      if(f3.mp == 0) {
        cast(state, convert);
      } else {
        cast(state, f3);
      }
    }
  } else {
    console.log(state);
    // var b3 = skills['Blizzard III'](state);
    // cast(state, b3);
  }
  return 1;
};

for(var i = 0; i < 900*100; ++i) {
  tick(state);
  var n = next(state);
}
console.log("potency", state.potency);
console.log("pps", state.potency/state.time);
