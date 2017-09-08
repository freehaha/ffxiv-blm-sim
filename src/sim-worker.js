var Sim = require('./index');
var State = require('./state');
var sprintf = require('sprintf-js').sprintf;
var sim;
var state;

function Logger(state) {
  this._state = state;
  this.buffer = [];
  return this;
}

Logger.prototype.flush = function() {
  self.postMessage({type: 'bulk', data: this.buffer});
  this.buffer = [];
};

Logger.prototype.info = function() {
  var timestamp = sprintf("[%06.2f] ", this._state.time);
  var args = Array.prototype.slice.call(arguments);
  args.unshift(timestamp);
  this.buffer.push({type: 'info', text: args.join(' ')});
  if(this.buffer.length > 50) {
    this.flush();
  }
};

Logger.prototype.error = function() {
  var timestamp = sprintf("[%06.2f] ERROR ", this._state.time);
  var args = Array.prototype.slice.call(arguments);
  args.unshift(timestamp);
  this.buffer.push({type: 'error', text: args.join(' ')});
  if(this.buffer.length > 50) {
    this.flush();
  }
}

self.addEventListener('message', function(event) {
  if(event.data.cmd == 'start') {
    self.postMessage({type: 'log', text: 'running'});
    state = new State();
    sim = new Sim({
      state: state,
      logger: new Logger(state),
    });
    sim.loop();
    sim.logger.flush();
  }
});
