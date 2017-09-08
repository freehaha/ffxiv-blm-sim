var sprintf = require('sprintf-js').sprintf;
var state = require('./state');

function ConsoleLogger(state) {
  this._state = state;
  return this;
}

ConsoleLogger.prototype.info = function() {
  var timestamp = sprintf("[%06.2f]", this._state.time);
  var args = Array.prototype.slice.call(arguments);
  args.unshift(timestamp);
  console.log.apply(this, args);
};

ConsoleLogger.prototype.error = function() {
  var timestamp = sprintf("[%06.2f] ERROR ", this._state.time);
  var args = Array.prototype.slice.call(arguments);
  args.unshift(timestamp);
  console.log.apply(this, args);
}

module.exports = {
  ConsoleLogger: ConsoleLogger,
};
