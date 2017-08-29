var skills = require('./skills.json');
var config = require('./config.json');

var skillFuncs = {};

for(var s of skills) {
  skillFuncs[s.name] = function(state) {
    var skill = {};
    skill.name = s.name;
    skill.cast = s.cast;
    skill.mp = s.mp;
    var stack = Math.abs(state.stack);
    if(stack == 0) {
      return skill;
    }
    if(state.phase == "ICE") {
      if(s.type == "FIRE") {
        skill.mp = config.UICostFire[stack - 1] * s.mp;
        skill.cast = config.UICastBonus[stack - 1] * s.cast;
      } else {
        skill.mp = s.mp;
      }
    } else if(state.phase == "FIRE") {
      if(s.type == "ICE") {
        skill.mp = config.AFCostIce[stack - 1] * s.mp;
        skill.cast = config.AFCastBonus[stack - 1] * s.cast;
      } else if (s.type == "FIRE") {
        skill.mp = config.AFCostFire[stack - 1] * s.mp;
      }
    }
    return skill;
  };
}

module.exports = skillFuncs;
