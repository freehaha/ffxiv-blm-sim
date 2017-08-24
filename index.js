var skills = require('./skills');
var config = require('./config.json');

var state = {
  phase: "FIRE",
  stack: 3,
};
var next = function(state) {
};

// while(1) {
//   var n = next();
//   if(!n) {
//     process.exit(0);
//   }
// }
//

var f = skills['Fire III'](state);
console.log(f);
