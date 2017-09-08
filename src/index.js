var skills = require('./skills');
var config = require('./config');
var sprintf = require('sprintf-js').sprintf;
var util = require('./util.js');
var state = require('./state');

var logger = new util.ConsoleLogger(state);

var Sim = function(options) {
  options = options || {};
  this.options = options;
  this.config = options.config || config;
  this.logger = options.logger || logger;
  this.next = options.next || next;
  this.state = options.state || state;
  this.logger.info('tick ', this.state.tick);
  this.logger.info('dot tick ', this.state.dotTick);
  this.target = {
    dots: {}
  };
  return this;
}


Sim.prototype.cast = function(spell) {
  var state = this.state;
  if(state.casting > 0) {
    this.logger.error("can't cast", spell.name, ": casting ", state.lastSpell.name);
    return false;
  }
  if(state.recast[spell.name] > 0) {
    this.logger.error("can't cast", spell.name, ": on cooldown", state.recast[spell.name]);
    return false;
  }
  if(state.animation > 0) {
    this.logger.error("can't cast", spell.name, ": in animation lock");
    return false;
  }
  if(state.mp < spell.mp) {
    this.logger.error("can't cast", spell.name, ": Not enough mp");
    return false;
  }
  this.logger.info("phase:", state.phase, sprintf("%0.2fs", state.phaseTimer));
  this.logger.info("start casting", spell.name);
  state.casts += 1;
  if(spell.require) {
    for(var r of spell.require) {
      if(r == 'enochian') {
        if(!state.enochian) {
          this.logger.error("can't cast", spell.name, ": no enochain");
        }
      } else if(r == 'ICE') {
        if(state.stack >= 0) {
          this.logger.error("can't cast", spell.name, ": not in ICE phase");
        }
      } else if(r == 'FIRE') {
        if(state.stack <= 0) {
          this.logger.error("can't cast", spell.name, ": not in FIRE phase");
        }
      } else if(r == 'foul') {
        if(!state.foul) {
          this.logger.error("can't cast", spell.name, ": doesn't have foul");
        }
      }
    }
  }
  if(spell.dot) {
    var d = spell.dot;
    this.target.dots[spell.name] = {
      duration: d.duration,
      potency: d.potency * state.dmgMod,
      proc: d.proc,
      chr: config.critRate,
      chd: config.critDamage,
      dhr: config.dhRate,
      dhd: config.dhDamage,
    };
  }
  if(spell.proc) {
    if(spell.proc.chance > Math.floor(Math.random()*100)) {
      state.procs[spell.proc.name] = spell.proc.duration;
      this.logger.info("gains", spell.proc.name);
    }
  }
  if(spell.consumes) {
    for(var consume of spell.consumes) {
      if(!state.procs.hasOwnProperty(consume)) {
        this.logger.error("no such proc", consume);
      } else {
        delete state.procs[consume];
      }
    }
  }
  state.recast[spell.name] = spell.recast;
  state.mp -= spell.mp;
  state.casting = spell.cast;
  state.lastSpell = spell;
  if(spell.gcd) {
    state.gcd = Math.max(spell.cast, config.gcd);
  }
  if(spell.cast == 0) {
    this.casted(state);
  }
  state.animation = spell.animation || 0.1;
  // console.log("anim", state.animation);
}

Sim.prototype.casted = function() {
  var state = this.state;
  if(!state.lastSpell) {
    return;
  }
  if(state.casting > 0) {
    return;
  }
  var spell = state.lastSpell;
  var potency = spell.potency;
  if(potency > 0) {
    if(config.simulateCrit && config.critRate*1000 > Math.floor(Math.random()*1000)) {
      potency += potency * config.critDamage;
      this.logger.info("crit!");
      state.crits += 1;
    }
    if(config.simulateDirecthit && config.dhRate*1000 > Math.floor(Math.random()*1000)) {
      potency += potency * config.dhDamage;
      this.logger.info("direct hit!");
      state.dhs += 1;
    }
    potency *= state.dmgMod;
    state.hits += 1;
    this.logger.info(sprintf("cast %s, potency: %d (from %d)", spell.name, potency, spell.potency));
  } else {
    this.logger.info(sprintf("cast %s, potency: %d", spell.name, spell.potency));
  }
  state.potency += potency;
  state.lastSpell = 0;
  this.phase(spell);
}

function updateDamageMod(state) {
  state.dmgMod = config.detMod;
}

Sim.prototype.tick = function () {
  var state = this.state;
  var remove = [];
  updateDamageMod(state);
  if(state.phaseTimer > 0) {
    state.phaseTimer -= 0.01;
    if(state.phaseTimer <= 0) {
      state.phaseTimer = 0;
      state.enochian = false;
    }
  }
  state.time += 0.01;
  state.tick += 0.01;
  state.dotTick += 0.01;
  state.casting -= 0.01;
  if(state.casting <= 0) {
    state.casting = 0;
  }
  this.casted(state);
  state.gcd -= 0.01;
  if(state.gcd < 0) {
    state.gcd = 0;
  }
  state.animation -= 0.01;
  if(state.animation < 0) {
    state.animation = 0;
  }
  state.polyglot -= 0.01;
  if(state.polyglot <= 0 && state.enochian) {
    state.polyglot = 30.01;
    if(state.foul) {
      this.logger.info("overwriting foul!!")
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
  for(var d in this.target.dots) {
    this.target.dots[d].duration -= 0.01;
    if(this.target.dots[d].duration <= 0) {
      remove.push(d);
    }
  }
  for(var r of remove) {
    delete this.target.dots[r];
  }

  if(state.dotTick >= 3) {
    state.dotTick = 0;
    this.logger.info('dot tick!');
    // dot tick
    for(var d in this.target.dots) {
      var dot = this.target.dots[d];
      var potency = dot.potency;
      if(config.simulateCrit && dot.chr*1000 > Math.floor(Math.random()*1000)) {
        potency += potency * dot.chd;
        this.logger.info("crit!");
        state.crits += 1;
      }
      if(config.simulateDirecthit && dot.dhr*1000 > Math.floor(Math.random()*1000)) {
        potency += potency * dot.dhd;
        this.logger.info("direct hit!");
        state.dhs += 1;
      }
      state.potency += potency;
      this.logger.info(sprintf("%s ticks for %d (from %d)", d, potency, dot.potency));
      if(dot.proc) {
        if(dot.proc.chance > Math.floor(Math.random()*100)) {
          this.logger.info("gains", dot.proc.name);
          state.procs[dot.proc.name] = dot.proc.duration;
        }
      }
    }
  }
  if(state.tick < 3) {
    return;
  }
  this.logger.info('tick!');
  state.tick = 0;

  // restore mp
  if(state.stack < 0) {
    var mpgain = Math.floor(config.MaxMp * config.UIMPBonus[Math.abs(state.stack) - 1]);
    this.logger.info('mp gain:', mpgain, state.mp, "=>", Math.min(state.mp+mpgain, config.MaxMp));
    state.mp += mpgain;
  } else if(state.stack == 0) {
    state.mp += config.MaxMp * 0.03;
  }
  if(state.mp > config.MaxMp) {
    state.mp = config.MaxMp;
  }
}

Sim.prototype.phase = function(spell) {
  var state = this.state;
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
      this.logger.error("Enochian has no effect!");
    }
    return;
  }
  if(spell.type == 'FOUL') {
    if(!state.foul) {
      this.logger.error("phase foul: no foul.")
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
    state.phaseTimer = config.PhaseDuration;
  } else if(spell.name === 'Blizzard III') {
    state.stack = -3;
    state.phaseTimer = config.PhaseDuration;
  } else if(state.stack == 0) {
    state.stack += (spell.type==='FIRE'?1:-1);
  } else {
    if(state.phaseTimer <= 0) {
      this.logger.error('dropping phase!!')
      state.stack = 0;
    }
    if(state.stack > 0 && spell.type === 'FIRE') {
      state.phaseTimer = config.PhaseDuration;
      state.stack++;
    } else if(state.stack < 0 && spell.type === 'ICE') {
      state.phaseTimer = config.PhaseDuration;
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

var next = function(inst) {
  var state = inst.state;
  var cast = inst.cast.bind(inst);
  if(state.animation > 0) {
    return 1;
  }
  if(state.init) {
    if(state.casting > 0) {
      return 0;
    }
    var b3 = skills['Blizzard III'](state);
    if(state.stack < 0) {
      var eno = skills['Enochian'](state);
      cast(eno);
      state.init = false;
      return 1;
    }
    cast(b3);
    return;
  }
  if(state.phaseTimer <= 0) {
    inst.logger.error("dropped phase timer!!!!")
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
      // console.log('use t3p');
      cast(t3);
    } else if(state.mp > f4.mp + b3.mp && state.phaseTimer > f4.cast + f1.cast) {
      cast(f4);
    } else if(f3.mp == 0) {
      // console.log('use f3p');
      cast(f3);
    } else if(f1.mp + b3.mp < state.mp) {
      cast(f1);
    } else {
      cast(b3);
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
      cast(foul);
      return 1;
    }
    if(state.umbralhearts < 3 && state.mp > b4.mp) {
      cast(b4);
      return 1;
    }
    if(state.mp > t3.mp && 
      (!inst.target.dots['Thunder III'] || inst.target.dots['Thunder III'].duration < 12)) {
      cast(t3);
      return 1;
    }
    if(t3.mp == 0 && state.phaseTimer > (f3.cast + config.gcd) && inst.target.dots['Thunder III'].duration <= 21) {
      cast(t3);
      return 1;
    }
    if(state.foul) {
      cast(foul);
      return 1;
    }
    if(state.mp < b1.mp) {
      return 1;
    }
    var mpgain = Math.floor(config.MaxMp * config.UIMPBonus[Math.abs(state.stack) - 1]);
    if(state.mp < config.MaxMp) {
      cast(b1);
    } else {
      if(f3.mp == 0) {
        cast(convert);
      } else {
        cast(f3);
      }
    }
  } else {
    inst.logger.log(state);
    // var b3 = skills['Blizzard III'](state);
    // cast(b3);
  }
  return 1;
};

Sim.prototype.loop = function() {
  var state = this.state;
  for(var i = 0; i < config.fightDuration*100; ++i) {
    this.tick(state);
    var n = next(this);
  }
}

Sim.prototype.stats = function() {
  return {
    "potency": state.potency,
    "critRate": parseInt(state.crits/state.hits*1000)/10,
    "dhRate": parseInt(state.dhs/state.hits*1000)/10,
    "casts": state.casts,
    "pps": state.potency/state.time,
  };
}


module.exports = Sim;
