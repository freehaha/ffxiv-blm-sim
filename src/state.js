var config = require('./config');
var INIT_TICK = Math.floor(Math.random()*100 + 1)/100 * 3;
var INIT_DOTTICK = Math.floor(Math.random()*100 + 1)/100 * 3;

function State() {
  this.casts = 0;
  this.hits = 0;
  this.crits = 0;
  this.dhs = 0;
  this.phase = "NONE";
  this.init = true;
  this.stack = 0;
  this.animation = 0;
  this.phaseTimer = 0;
  this.time = 0;
  this.gcd = 0;
  this.tick = 0 - INIT_TICK;
  this.dotTick = 0 - INIT_DOTTICK;
  this.mp = config.MaxMp;
  this.potency = 0;
  this.procs = {};
  this.recast = {};
  this.enochian = false;
  this.umbralhearts = 0;
  this.polyglot = 0;
  this.casting = 0;
  this.foul = false;
  this.dmgMod = 1;
}

module.exports = State;
