var skills = require('../skills');
var next = function() {
  var state = this.state;
  var cast = this.cast.bind(this);

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
    this.logger.error("dropped phase timer!!!!")
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
    var f4count = parseInt(state.mp/f4.mp);
    if(f4count > 4) {
      cast(f4);
      return 1;
    }
    if(f4count == 4) {
      cast(f1);
      return 1;
    }
    if(f3.mp == 0 && state.procs['Firestarter'] < this.config.ivcast) {
      cast(f3);
      return 1;
    }
    if(t3.mp > 0) {
      if(f4count == 0) {
        cast(b3);
        return 1;
      }
      cast(f4);
      return 1;
    } else {
      if(f4count == 0) {
        cast(b3);
        return 1;
      }
      // have at least 1 tick of T3 or it's not present on target
      if(this.target.dots['Thunder III'] && this.target.dots['Thunder III'].duration > 21) {
        cast(f4);
        return 1;
      }
      if(f3.mp == 0 && state.phaseTimer > 2 * this.config.gcd) { // at least 2gcd for t3p + f3p
        cast(t3);
        return 1;
      }
      if(f4count * f4.cast + b3.cast + this.config.gcd <= state.phaseTimer) {
        cast(t3);
        return 1;
      }
      cast(f4);
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
    if(state.foul && state.polyglot < 3*this.config.gcd) {
      cast(foul);
      return 1;
    }
    if(state.umbralhearts < 3 && state.mp > b4.mp) {
      cast(b4);
      return 1;
    }
    if(state.mp > t3.mp && 
      (!this.target.dots['Thunder III'] || this.target.dots['Thunder III'].duration < 12)) {
      cast(t3);
      return 1;
    }
    if(state.foul) {
      cast(foul);
      return 1;
    }
    if(t3.mp == 0 && state.phaseTimer > (f3.cast + this.config.gcd)
      && this.target.dots['Thunder III'].duration <= 21) {
      cast(t3);
      return 1;
    }
    if(state.mp < b1.mp) {
      return 1;
    }
    var mpgain = Math.floor(this.config.MaxMp * this.config.UIMPBonus[Math.abs(state.stack) - 1]);
    if(state.mp < this.config.MaxMp) {
      cast(b1);
    } else {
      if(f3.mp == 0) {
        cast(convert);
      } else {
        cast(f3);
      }
    }
  } else {
    this.logger.error("no stack!");
    var b3 = skills['Blizzard III'](state);
    cast(b3);
  }
  return 1;
};

module.exports = next;
