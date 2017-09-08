var Sim = require('./index');
var SimWorker = require('worker-loader?inline!./sim-worker.js');
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
  return this;
}

Config.prototype.run = function() {
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

      document.getElementById('ptotal').innerHTML = stats.potency;
      document.getElementById('chr').innerHTML = stats.critRate;
      document.getElementById('dhr').innerHTML = stats.dhRate;
      document.getElementById('casts').innerHTML = stats.casts;
      document.getElementById('pps').innerHTML = stats.pps;
    }
  });
  for(var c of this.configs) {
    config[c.configKey] = c.value();
  }
  worker.postMessage({cmd: 'start', config: config});
};

ko.applyBindings(new Config());
