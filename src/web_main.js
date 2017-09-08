var Sim = require('./index');
var SimWorker = require('worker-loader?name=sim-worker.js!./sim-worker.js');
var config = require('./config');
var worker = null;

function newLogLine(text) {
  document.getElementById('log').innerHTML += '<BR>' + text;
}

function newErrorLine(text) {
  document.getElementById('log').innerHTML += '<BR><span style="color: red">' + text + "</span>";
}

function Config() {
  this.configs = [
    {
      label: "Crit",
      type: 'number',
      configKey: 'crit',
    },
    {
      label: "Det",
      type: 'number',
      configKey: 'determination',
    },
    {
      label: "DirectHit",
      type: 'number',
      configKey: 'directhit',
    },
    {
      label: "Spell Speed",
      type: 'number',
      configKey: 'spellSpeed',
    },
    {
      label: "Simulate Crit",
      type: 'bool',
      configKey: 'simulateCrit',
    },
    {
      label: "Simulate Direct Hit",
      type: 'bool',
      configKey: 'simulateDirecthit',
    },
    {
      label: "Fight length(seconds)",
      type: 'number',
      configKey: 'fightDuration',
    },
  ];
  for(var c of this.configs) {
    c.value = ko.observable();
    c.value(config[c.configKey]);
  }
  this.potency = ko.observable(0);
  this.critRate = ko.observable(0);
  this.dhRate = ko.observable(0);
  this.casts = ko.observable(0);
  this.pps = ko.observable(0);
  return this;
}

Config.prototype.run = function() {
  var self = this;
  document.getElementById('log').innerHTML = "running...";
  worker = new SimWorker();
  worker.addEventListener('message', function(event) {
    var data = event.data;
    if(data.type == 'info') {
      newLogLine(data.text);
    } else if (data.type == 'error') {
      newErrorLine(data.text);
    } else if (data.type == 'bulk') {
      var div = document.getElementById("log");
      var text = div.innerHTML;
      for(var d of data.data) {
        if(d.type == 'info') {
          text += '<BR>' + d.text;
        } else if (d.type == 'error') {
          text += '<BR><span style="color: red">' + d.text + "</span>";
        }
      }
      div.innerHTML = text;
      div.scrollTop = div.scrollHeight;
    } else if (data.type == 'finished') {
      newLogLine('simulation ended');
      var state = data.state;
      var stats = data.stats;

      self.potency(stats.potency);
      self.critRate(stats.critRate);
      self.dhRate(stats.dhRate);
      self.casts(stats.casts);
      self.pps(stats.pps);
    }
  });
  for(var c of this.configs) {
    config[c.configKey] = c.value();
  }
  worker.postMessage({cmd: 'start', config: config});
};

ko.applyBindings(new Config());
