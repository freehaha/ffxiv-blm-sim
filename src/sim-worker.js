var Sim = require('./index');
var State = require('./state');
var sprintf = require('sprintf-js').sprintf;
var sim;
var state;
var config = null;

function Logger(state) {
  this._state = state;
  this.buffer = [];
  return this;
}

Logger.prototype.flush = function() {
  var b = this.buffer;
  self.postMessage({type: 'bulk', data: b});
  this.buffer = [];
};

Logger.prototype.info = function() {
  var timestamp = sprintf("[%06.2f] ", this._state.time);
  var args = Array.prototype.slice.call(arguments);
  args.unshift(timestamp);
  this.buffer.push({type: 'info', text: args.join(' ')});
  if(this.buffer.length > 100) {
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
    config = event.data.config;
    state = new State();
    sim = new Sim({
      state: state,
      logger: new Logger(state),
    });
    sim.configure(config);
    sim.loop();
    sim.logger.flush();
    self.postMessage({type: 'finished', state: sim.state, stats: sim.stats()});
  }
});
