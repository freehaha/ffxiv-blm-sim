var skills = require('./skills.json');
var config = require('./config.json');

var skillFuncs = {};

var OVERWRITING_ATTR = ['cast', 'potency', 'mp', 'animation', 'consumes'];
function overwrite(skill, proc) {
  for(var attr of OVERWRITING_ATTR) {
    if(!proc.hasOwnProperty(attr)) {
      continue;
    }
    skill[attr] = proc[attr];
  }
}

for(var s of skills) {
  (function(s) {
    skillFuncs[s.name] = function(state) {
      var skill = {};
      skill.name = s.name;
      skill.cast = s.cast;
      skill.potency = s.potency;
      skill.dot = s.dot;
      skill.mp = s.mp || 0;
      skill.type = s.type;
      skill.proc = s.proc;
      skill.gcd = s.gcd;
      skill.recast = s.recast || config.gcd;
      skill.animation = s.animation;
      skill.require = s.require;
      if(s.iv) {
        skill.cast = config.ivcast;
      }
      if(s.dot) {
        var dotMod = config.dotMod
        skill.dot = {
          duration: s.dot.duration,
          potency: s.dot.potency * dotMod,
          proc: s.dot.proc,
        }
      }
      var stack = Math.abs(state.stack);
      if(s.procConditions) {
        for(var cond of s.procConditions) {
          if(state.procs[cond.name] && state.procs[cond.name] > 0) {
            overwrite(skill, cond);
          }
        }
      }
      if(stack == 0) {
        return skill;
      }
      if(state.phase == "ICE") {
        if(s.type == "FIRE") {
          skill.mp = config.UICostFire[stack - 1] * skill.mp;
          skill.cast = config.UICastBonus[stack - 1] * skill.cast;
          skill.potency = config.UIPenalty[stack - 1] * skill.potency;
        } else {
          skill.mp = skill.mp;
        }
      } else if(state.phase == "FIRE") {
        if(s.type == "ICE") {
          skill.mp = config.AFCostIce[stack - 1] * skill.mp;
          skill.cast = config.AFCastBonus[stack - 1] * skill.cast;
          skill.potency = config.AFPenalty[stack - 1] * skill.potency;
        } else if (s.type == "FIRE") {
          if(state.umbralhearts == 0) {
            skill.mp = config.AFCostFire[stack - 1] * skill.mp;
          }
          skill.potency = config.AFBonus[stack - 1] * skill.potency;
        }
      }
      return skill;
    };
  })(s);
}

module.exports = skillFuncs;
