var skills = require('./skills');
var config = require('./config.json');
var INIT_TICK = Math.floor(Math.random()*100 + 1)/100 * 3;

console.log('tick ', INIT_TICK);

var state = {
  phase: "NONE",
  init: true,
  stack: 0,
  phaseTimer: 0,
  time: 0,
  recast: 0,
  tick: 0 - INIT_TICK,
  mp: config.MaxMp,
  potency: 0,
};

function cast(state, spell) {
  console.log("casting", spell.name);
  if(state.mp < spell.mp) {
    console.error("can't cast", spell.name, ": Not enough mp");
    return false;
  }
  state.mp -= spell.mp;
  state.potency += spell.potency;
  phase(state, spell);
  state.recast = Math.max(spell.cast, config.gcd);
}

function tick(state) {
  if(state.phaseTimer > 0) {
    state.phaseTimer -= 0.01;
  }
  state.time += 0.01;
  state.tick += 0.01;
  state.recast -= 0.01;
  if(state.recast < 0) {
    state.recast = 0;
  }
  if(state.tick < 3) {
    return;
  }
  console.log('tick!');
  state.tick = 0;
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
  if(spell.name === 'Fire III') {
    state.stack = 3;
    state.phaseTimer = config.PhaseDuration;
  } else if(spell.name === 'Blizzard III') {
    state.stack = -3;
    state.phaseTimer = config.PhaseDuration;
  } else if(state.stack == 0) {
    state.stack += (spell.type==='FIRE'?1:-1);
  } else if(state.stack > 0 && spell.type === 'FIRE') {
    state.phaseTimer = config.PhaseDuration;
    state.stack++;
  } else if(state.stack < 0 && spell.type === 'ICE') {
    state.phaseTimer = config.PhaseDuration;
    state.stack--;
  } else {
    console.log('reset 0');
    state.phaseTimer = 0;
    state.stack = 0;
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
  if(state.recast > 0) {
    return 1;
  }
  if(state.init) {
    var s = skills['Fire III'](state);
    cast(state, s);
    state.init = false;
    return;
  }
  var stack = state.stack;
  if(state.stack > 0) {
    var f1 = skills['Fire'](state);
    var b3 = skills['Blizzard III'](state);
    if(f1.mp + b3.mp < state.mp) {
      cast(state, f1);
    } else {
      cast(state, b3);
    }
  } else if (state.stack < 0) {
    var b1 = skills['Blizzard'](state);
    var f3 = skills['Fire III'](state);
    if(state.mp < b1.mp) {
      return 1;
    }
    if(state.mp < config.MaxMp) {
      cast(state, b1);
    } else {
      cast(state, f3);
    }
  } else {
    console.log(state);
    // var b3 = skills['Blizzard III'](state);
    // cast(state, b3);
  }
  return 1;
};

for(var i = 0; i < 600*100; ++i) {
  tick(state);
  var n = next(state);
}
console.log("potency", state.potency);
console.log("pps", state.potency/state.time);
