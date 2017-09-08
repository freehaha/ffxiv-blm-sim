var skills = require('./skills');
var config = require('./config');
var sprintf = require('sprintf-js').sprintf;
var util = require('./util.js');
var logger = util.logger;

var state = require('./state');

logger.info('tick ', state.tick);
logger.info('dot tick ', state.dotTick);

var target = {
  dots: {}
};

function cast(state, spell) {
  var timestamp = sprintf("[%06.2f]", state.time);
  if(state.casting > 0) {
    logger.error("can't cast", spell.name, ": casting ", state.lastSpell.name);
    return false;
  }
  if(state.recast[spell.name] > 0) {
    logger.error("can't cast", spell.name, ": on cooldown", state.recast[spell.name]);
    return false;
  }
  if(state.animation > 0) {
    logger.error("can't cast", spell.name, ": in animation lock");
    return false;
  }
  if(state.mp < spell.mp) {
    logger.error("can't cast", spell.name, ": Not enough mp");
    return false;
  }
  logger.info("phase:", state.phase, sprintf("%0.2fs", state.phaseTimer));
  logger.info("start casting", spell.name);
  state.casts += 1;
  if(spell.require) {
    for(var r of spell.require) {
      if(r == 'enochian') {
        if(!state.enochian) {
          logger.error("can't cast", spell.name, ": no enochain");
          process.exit(1);
        }
      } else if(r == 'ICE') {
        if(state.stack >= 0) {
          logger.error("can't cast", spell.name, ": not in ICE phase");
          process.exit(1);
        }
      } else if(r == 'FIRE') {
        if(state.stack <= 0) {
          logger.error("can't cast", spell.name, ": not in FIRE phase");
          process.exit(1);
        }
      } else if(r == 'foul') {
        if(!state.foul) {
          logger.error("can't cast", spell.name, ": doesn't have foul");
          process.exit(1);
        }
      }
    }
  }
  if(spell.dot) {
    var d = spell.dot;
    target.dots[spell.name] = {
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
      logger.info("gains", spell.proc.name);
    }
  }
  if(spell.consumes) {
    for(var consume of spell.consumes) {
      if(!state.procs.hasOwnProperty(consume)) {
        logger.error("no such proc", consume);
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
    casted(state);
  }
  state.animation = spell.animation || 0.1;
  // console.log("anim", state.animation);
}

function casted(state) {
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
      logger.info("crit!");
      state.crits += 1;
    }
    if(config.simulateDirecthit && config.dhRate*1000 > Math.floor(Math.random()*1000)) {
      potency += potency * config.dhDamage;
      logger.info("direct hit!");
      state.dhs += 1;
    }
    potency *= state.dmgMod;
    state.hits += 1;
    logger.info(sprintf("cast %s, potency: %d (from %d)", spell.name, potency, spell.potency));
  } else {
    logger.info(sprintf("cast %s, potency: %d", spell.name, spell.potency));
  }
  state.potency += potency;
  state.lastSpell = 0;
  phase(state, spell);
}

function updateDamageMod(state) {
  state.dmgMod = config.detMod;
}

function tick(state) {
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
  casted(state);
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
      logger.info("overwriting foul!!")
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

  if(state.dotTick >= 3) {
    state.dotTick = 0;
    logger.info('dot tick!');
    // dot tick
    for(var d in target.dots) {
      var dot = target.dots[d];
      var potency = dot.potency;
      if(config.simulateCrit && dot.chr*1000 > Math.floor(Math.random()*1000)) {
        potency += potency * dot.chd;
        logger.info("crit!");
        state.crits += 1;
      }
      if(config.simulateDirecthit && dot.dhr*1000 > Math.floor(Math.random()*1000)) {
        potency += potency * dot.dhd;
        logger.info("direct hit!");
        state.dhs += 1;
      }
      state.potency += potency;
      logger.info(sprintf("%s ticks for %d (from %d)", d, potency, dot.potency));
      if(dot.proc) {
        if(dot.proc.chance > Math.floor(Math.random()*100)) {
          logger.info("gains", dot.proc.name);
          state.procs[dot.proc.name] = dot.proc.duration;
        }
      }
    }
  }
  if(state.tick < 3) {
    return;
  }
  logger.info('tick!');
  state.tick = 0;

  // restore mp
  if(state.stack < 0) {
    var mpgain = Math.floor(config.MaxMp * config.UIMPBonus[Math.abs(state.stack) - 1]);
    logger.info('mp gain:', mpgain, state.mp, "=>", Math.min(state.mp+mpgain, config.MaxMp));
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
      logger.error("Enochian has no effect!");
    }
    return;
  }
  if(spell.type == 'FOUL') {
    if(!state.foul) {
      logger.error("phase foul: no foul.")
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
    state.phaseTimer = config.PhaseDuration;
  } else if(spell.name === 'Blizzard III') {
    state.stack = -3;
    state.phaseTimer = config.PhaseDuration;
  } else if(state.stack == 0) {
    state.stack += (spell.type==='FIRE'?1:-1);
  } else {
    if(state.phaseTimer <= 0) {
      logger.error('dropping phase!!')
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

var next = function(state) {
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
      cast(state, eno);
      state.init = false;
      return 1;
    }
    cast(state, b3);
    return;
  }
  if(state.phaseTimer <= 0) {
    logger.error("dropped phase timer!!!!")
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
      // console.log('use t3p');
      cast(state, t3);
    } else if(state.mp > f4.mp + b3.mp && state.phaseTimer > f4.cast + f1.cast) {
      cast(state, f4);
    } else if(f3.mp == 0) {
      // console.log('use f3p');
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
    logger.log(state);
    // var b3 = skills['Blizzard III'](state);
    // cast(state, b3);
  }
  return 1;
};

for(var i = 0; i < 900*100; ++i) {
  tick(state);
  var n = next(state);
}
logger.info("potency", state.potency);
logger.info("crit rate", parseInt(state.crits/state.hits*1000)/10);
logger.info("direct hit rate", parseInt(state.dhs/state.hits*1000)/10);
logger.info("# of spells cast", state.casts);
logger.info("pps", state.potency/state.time);
