var config = require('./config.json');
//INT(1000*(1/(1-INT(130*(SPS)/2170)/1000)))/1000
var dotMod = parseInt(1000 * (1 / (1 - parseInt(130 * config.spellSpeed / 2170)/1000)))/1000;
console.log('dot mod:', dotMod);

module.exports = config;
