var skills = require('../skills');

var next = function() {
  var state = this.state;
  var cast = this.cast.bind(this);

  if(state.animation > 0) {
    return 1;
  }
  if(state.casting > 0) {
    return 0;
  }
  if(state.init) {
    if(state.casting > 0) {
      return 0;
    }
    var f3 = skills['Fire III'](state);
    cast(f3);
    state.init = false;
    return;
  }
  if(state.phaseTimer <= 0) {
    this.logger.error("dropped phase timer!!!!")
  }
  var stack = state.stack;
  if(stack > 0) {
    if(state.gcd > 0) {
      return 1;
    }
    var f1 = skills['Fire'](state);
    var b3 = skills['Blizzard III'](state);
    var f3 = skills['Fire III'](state);
    var t3 = skills['Thunder III'](state);
    if(f3.mp == 0) { //f3p
      cast(f3);
      return 1;
    }
    if(t3.mp == 0 && this.config.gcd + b3.cast < state.phaseTimer) {
      cast(t3);
      return 1;
    }
    if(f1.mp + b3.mp < state.mp) {
      cast(f1);
      return 1;
    }
    cast(b3);
  } else if (state.stack < 0) {
    if(state.gcd > 0) {
      return 1;
    }
    var b1 = skills['Blizzard'](state);
    var t3 = skills['Thunder III'](state);
    var f3 = skills['Fire III'](state);
    var convert = skills['Convert'](state);
    if(t3.mp == 0) {
      cast(t3);
      return 1;
    }
    if(state.mp < this.config.MaxMp) {
      if((!this.target.dots['Thunder III'] || this.target.dots['Thunder III'].duration < 12)
        && state.mp > t3.mp) {
        cast(t3);
        return 1;

      }
      if(state.mp < b1.mp) {
        // wait for mp tick
        return 1;
      }
      cast(b1);
    } else {
      cast(f3);
    }
  } else {
    this.logger.error("no stack!");
    var b3 = skills['Blizzard III'](state);
    cast(b3);
  }
  return 1;
};

module.exports = next;
