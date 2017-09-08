var config = require('./config');
var INIT_TICK = Math.floor(Math.random()*100 + 1)/100 * 3;
var INIT_DOTTICK = Math.floor(Math.random()*100 + 1)/100 * 3;

var state = {
  casts: 0,
  hits: 0,
  crits: 0,
  dhs: 0,
  phase: "NONE",
  init: true,
  stack: 0,
  animation: 0,
  phaseTimer: 0,
  time: 0,
  gcd: 0,
  tick: 0 - INIT_TICK,
  dotTick: 0 - INIT_DOTTICK,
  mp: config.MaxMp,
  potency: 0,
  procs: {},
  recast: {},
  enochian: false,
  umbralhearts: 0,
  polyglot: 0,
  casting: 0,
  foul: false,
  dmgMod: 1,
};

module.exports = state;
