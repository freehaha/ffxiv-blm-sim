var config = require('./config.json');
var BASE_SPS = 364;
// Dot mod = INT(1000*(1/(1-INT(130*(SPS)/2170)/1000)))/1000
config.dotMod = parseInt(1000 * (1 / (1 - parseInt(130 * (config.spellSpeed - BASE_SPS) / 2170)/1000)))/1000;

// GCD = INT(INT(100 * Special!$B$38  * (int(Special!C$2 * (1000 - INT(Special!$F$22 * ($B20) / Special!$B$1))/1000) / 1000)) / 100)/100
var BASE_GCD = 2500;
config.gcd = parseInt(parseInt(100 * 100  * (parseInt(BASE_GCD * (1000 - parseInt(130 * (config.spellSpeed - BASE_SPS) / 2170))/1000) / 1000)) / 100)/100;
config.ivcast = parseInt(parseInt(100 * 100  * (parseInt(2800 * (1000 - parseInt(130 * (config.spellSpeed - BASE_SPS) / 2170))/1000) / 1000)) / 100)/100;
// CHR = (INT(200* crit /2170)+ 50)/1000
// CHD = (INT(200* crit /2170)+ 400)/1000
config.critRate = (parseInt(200 * (config.crit - 364) / 2170) + 50) / 1000;
config.critDamage = (parseInt(200 * (config.crit - 364) / 2170) + 400) / 1000;

// INT(Special!$F$13*B6/Special!$B$1)/1000
config.dhRate = parseInt(550 * (config.directhit - 364) / 2170)/ 1000;

//det =(1000+INT((Special!$F$19*B2/Special!$B$1)))/1000
config.detMod = (1000 + parseInt((130 * (config.determination - 292) / 2170))) / 1000;

console.log('spell speed', config.spellSpeed);
console.log('dot mod', config.dotMod);
console.log('gcd', config.gcd);
console.log('ivcast', config.ivcast);

console.log('crit', config.crit);
console.log('crit rate', config.critRate);
console.log('crit damage', config.critDamage);

console.log('dh', config.directhit);
console.log('dh rate', config.dhRate);
console.log('dh damage', config.dhDamage);

console.log('determination', config.determination);
console.log('det mod', config.detMod);


module.exports = config;
