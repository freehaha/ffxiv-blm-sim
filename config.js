var config = require('./config.json');
var BASE_SPS = 364;
// Dot mod = INT(1000*(1/(1-INT(130*(SPS)/2170)/1000)))/1000
config.dotMod = parseInt(1000 * (1 / (1 - parseInt(130 * (config.spellSpeed - BASE_SPS) / 2170)/1000)))/1000;
console.log('dot mod', config.dotMod);

// GCD = INT(INT(100 * Special!$B$38  * (int(Special!C$2 * (1000 - INT(Special!$F$22 * ($B20) / Special!$B$1))/1000) / 1000)) / 100)/100
var BASE_GCD = 2500;
config.gcd = parseInt(parseInt(100 * 100  * (parseInt(BASE_GCD * (1000 - parseInt(130 * (config.spellSpeed - BASE_SPS) / 2170))/1000) / 1000)) / 100)/100;
config.ivcast = parseInt(parseInt(100 * 100  * (parseInt(2800 * (1000 - parseInt(130 * (config.spellSpeed - BASE_SPS) / 2170))/1000) / 1000)) / 100)/100;
console.log('gcd', config.gcd);
console.log('ivcast', config.ivcast);

module.exports = config;
