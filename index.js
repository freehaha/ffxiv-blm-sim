var skills = require('./skills');
var config = require('./config.json');
var INIT_TICK = Math.floor(Math.random()*100 + 1)/100 * 3;

console.log('tick ', INIT_TICK);

var state = {
  phase: "FIRE",
  init: true,
  stack: 0,
  phaseTimer: 0,
  tick: 0 - INIT_TICK,
  mp: config.MaxMp,
};

function cast(state, spell) {
  console.log("casting", spell.name);
  if(state.mp < spell.mp) {
    console.error("can't cast", spell.name, ": Not enough mp");
    return false;
  }
  state.mp -= spell.mp;
  phase(state, spell);
  tick(state);
}

function tick(state) {
}

function phase(state, spell) {
  if(spell.name === 'Fire III') {
    state.phase = 'FIRE';
    state.stack = 3;
  } else if(spell.name === 'Blizzard III') {
    state.phase = 'ICE';
    state.stack = -3;
  }
  console.log(state);
}

var next = function(state) {
  if(state.init) {
    var s = skills['Fire III'](state);
    cast(state, s);
    state.init = false;
    return;
  }
  var stack = state.stack;
  if(state.phase === 'FIRE') {
    var s = skills['Fire'](state);
    cast(state, s);
  }
  return 1;
};

for(var i = 0; i < 100; ++i) {
  var n = next(state);
  if(!n) {
    process.exit(0);
  }
}
