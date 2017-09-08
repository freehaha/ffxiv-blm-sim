var Sim = require('./src/index');
var defaultConfig = require('./src/config');

var sim = new Sim();
sim.configure(defaultConfig);
sim.loop();
var state = sim.state;
var stats = sim.stats();
sim.logger.info("tatal potency", state.potency);
sim.logger.info("crit rate", stats.critRate);
sim.logger.info("direct hit rate", stats.dhRate);
sim.logger.info("# of spells cast", stats.casts);
sim.logger.info("pps", stats.pps);
