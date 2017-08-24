var skills = require('./skills.json');
var config = require('./config.json');

var skillFuncs = {};

for(var s of skills) {
  skillFuncs[s.name] = function(state) {
    var skill = {};
    skill.name = s.name;
    skill.cast = s.cast;
    skill.mp = s.mp;
    if(state.phase == "ICE") {
      console.log(state.phase);
      if(s.type == "FIRE") {
        skill.mp = config.UICostFire[state.stack - 1] * s.mp;
        skill.cast = config.UICastBonus[state.stack - 1] * s.cast;
      } else {
        skill.mp = s.mp;
      }
    } else if(state.phase == "FIRE") {
      console.log(state.phase);
      if(s.type == "ICE") {
        skill.mp = config.AFCostIce[state.stack - 1] * s.mp;
        skill.cast = config.AFCastBonus[state.stack - 1] * s.cast;
      } else if (s.type == "FIRE") {
        skill.mp = config.AFCostFire[state.stack - 1] * s.mp;
      }
    }
    return skill;
  };
}

module.exports = skillFuncs;
