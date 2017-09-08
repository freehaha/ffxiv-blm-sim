var Sim = require('./index');
var State = require('./state');
var SimWorker = require('worker-loader?inline!./sim-worker.js');
var worker = null;

function newLogLine(text) {
  document.getElementById('log').innerHTML += '<BR>' + text;
}
function newErrorLine(text) {
  document.getElementById('log').innerHTML += '<BR><span style="color: red">' + text + "</span>";
}

document.getElementById('btn-run').onclick = function() {
  document.getElementById('log').innerHTML = "running...";
  worker = new SimWorker();
  worker.addEventListener('message', function(event) {
    var data = event.data;
    if(data.type == 'info') {
      newLogLine(data.text);
    } else if (data.type == 'error') {
      newErrorLine(data.text);
    } else if (data.type == 'bulk') {
      for(var d of data.data) {
        if(d.type == 'info') {
          newLogLine(d.text);
        } else if (d.type == 'error') {
          newErrorLine(d.text);
        }
      }
    }
  });
  worker.postMessage({cmd: 'start'});
};
