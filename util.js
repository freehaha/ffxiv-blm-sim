var sprintf = require('sprintf-js').sprintf;
var state = require('./state');
module.exports = {
  logger: {
    info: function() {
      var timestamp = sprintf("[%06.2f]", state.time);
      var args = Array.prototype.slice.call(arguments);
      args.unshift(timestamp);
      console.log.apply(this, args);
    },
    error: function() {
      var timestamp = sprintf("[%06.2f]", state.time);
      var args = Array.prototype.slice.call(arguments);
      args.unshift(timestamp);
      console.error.apply(this, args);
    }
  }
};
