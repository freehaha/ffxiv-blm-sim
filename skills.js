var skills = require('./skills.json');
var config = require('./config.json');

var skillFuncs = {};

for(var s of skills) {
  skillFuncs[s.name] = function(state) {
    var skill = {};
    skill.name = s.name;
    skill.cast = s.cast;
    if(state.phase == "ICE") {
      if(skill.type == "Fire") {
        skill.mp = config.UICostFire[state.stack - 1] * s.mp;
        skill.cast = config.UICastBonus[state.stack - 1] * s.cast;
      } else {
        skill.cost = s.mp;
      }
    }
  };
}

module.exports = skillFuncs;
