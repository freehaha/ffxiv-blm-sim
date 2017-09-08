/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;/* global window, exports, define */

!function() {
    'use strict'

    var re = {
        not_string: /[^s]/,
        not_bool: /[^t]/,
        not_type: /[^T]/,
        not_primitive: /[^v]/,
        number: /[diefg]/,
        numeric_arg: /[bcdiefguxX]/,
        json: /[j]/,
        not_json: /[^j]/,
        text: /^[^\x25]+/,
        modulo: /^\x25{2}/,
        placeholder: /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijostTuvxX])/,
        key: /^([a-z_][a-z_\d]*)/i,
        key_access: /^\.([a-z_][a-z_\d]*)/i,
        index_access: /^\[(\d+)\]/,
        sign: /^[\+\-]/
    }

    function sprintf(key) {
        // `arguments` is not an array, but should be fine for this call
        return sprintf_format(sprintf_parse(key), arguments)
    }

    function vsprintf(fmt, argv) {
        return sprintf.apply(null, [fmt].concat(argv || []))
    }

    function sprintf_format(parse_tree, argv) {
        var cursor = 1, tree_length = parse_tree.length, arg, output = '', i, k, match, pad, pad_character, pad_length, is_positive, sign
        for (i = 0; i < tree_length; i++) {
            if (typeof parse_tree[i] === 'string') {
                output += parse_tree[i]
            }
            else if (Array.isArray(parse_tree[i])) {
                match = parse_tree[i] // convenience purposes only
                if (match[2]) { // keyword argument
                    arg = argv[cursor]
                    for (k = 0; k < match[2].length; k++) {
                        if (!arg.hasOwnProperty(match[2][k])) {
                            throw new Error(sprintf('[sprintf] property "%s" does not exist', match[2][k]))
                        }
                        arg = arg[match[2][k]]
                    }
                }
                else if (match[1]) { // positional argument (explicit)
                    arg = argv[match[1]]
                }
                else { // positional argument (implicit)
                    arg = argv[cursor++]
                }

                if (re.not_type.test(match[8]) && re.not_primitive.test(match[8]) && arg instanceof Function) {
                    arg = arg()
                }

                if (re.numeric_arg.test(match[8]) && (typeof arg !== 'number' && isNaN(arg))) {
                    throw new TypeError(sprintf('[sprintf] expecting number but found %T', arg))
                }

                if (re.number.test(match[8])) {
                    is_positive = arg >= 0
                }

                switch (match[8]) {
                    case 'b':
                        arg = parseInt(arg, 10).toString(2)
                        break
                    case 'c':
                        arg = String.fromCharCode(parseInt(arg, 10))
                        break
                    case 'd':
                    case 'i':
                        arg = parseInt(arg, 10)
                        break
                    case 'j':
                        arg = JSON.stringify(arg, null, match[6] ? parseInt(match[6]) : 0)
                        break
                    case 'e':
                        arg = match[7] ? parseFloat(arg).toExponential(match[7]) : parseFloat(arg).toExponential()
                        break
                    case 'f':
                        arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg)
                        break
                    case 'g':
                        arg = match[7] ? String(Number(arg.toPrecision(match[7]))) : parseFloat(arg)
                        break
                    case 'o':
                        arg = (parseInt(arg, 10) >>> 0).toString(8)
                        break
                    case 's':
                        arg = String(arg)
                        arg = (match[7] ? arg.substring(0, match[7]) : arg)
                        break
                    case 't':
                        arg = String(!!arg)
                        arg = (match[7] ? arg.substring(0, match[7]) : arg)
                        break
                    case 'T':
                        arg = Object.prototype.toString.call(arg).slice(8, -1).toLowerCase()
                        arg = (match[7] ? arg.substring(0, match[7]) : arg)
                        break
                    case 'u':
                        arg = parseInt(arg, 10) >>> 0
                        break
                    case 'v':
                        arg = arg.valueOf()
                        arg = (match[7] ? arg.substring(0, match[7]) : arg)
                        break
                    case 'x':
                        arg = (parseInt(arg, 10) >>> 0).toString(16)
                        break
                    case 'X':
                        arg = (parseInt(arg, 10) >>> 0).toString(16).toUpperCase()
                        break
                }
                if (re.json.test(match[8])) {
                    output += arg
                }
                else {
                    if (re.number.test(match[8]) && (!is_positive || match[3])) {
                        sign = is_positive ? '+' : '-'
                        arg = arg.toString().replace(re.sign, '')
                    }
                    else {
                        sign = ''
                    }
                    pad_character = match[4] ? match[4] === '0' ? '0' : match[4].charAt(1) : ' '
                    pad_length = match[6] - (sign + arg).length
                    pad = match[6] ? (pad_length > 0 ? pad_character.repeat(pad_length) : '') : ''
                    output += match[5] ? sign + arg + pad : (pad_character === '0' ? sign + pad + arg : pad + sign + arg)
                }
            }
        }
        return output
    }

    var sprintf_cache = Object.create(null)

    function sprintf_parse(fmt) {
        if (sprintf_cache[fmt]) {
            return sprintf_cache[fmt]
        }

        var _fmt = fmt, match, parse_tree = [], arg_names = 0
        while (_fmt) {
            if ((match = re.text.exec(_fmt)) !== null) {
                parse_tree.push(match[0])
            }
            else if ((match = re.modulo.exec(_fmt)) !== null) {
                parse_tree.push('%')
            }
            else if ((match = re.placeholder.exec(_fmt)) !== null) {
                if (match[2]) {
                    arg_names |= 1
                    var field_list = [], replacement_field = match[2], field_match = []
                    if ((field_match = re.key.exec(replacement_field)) !== null) {
                        field_list.push(field_match[1])
                        while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                            if ((field_match = re.key_access.exec(replacement_field)) !== null) {
                                field_list.push(field_match[1])
                            }
                            else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
                                field_list.push(field_match[1])
                            }
                            else {
                                throw new SyntaxError('[sprintf] failed to parse named argument key')
                            }
                        }
                    }
                    else {
                        throw new SyntaxError('[sprintf] failed to parse named argument key')
                    }
                    match[2] = field_list
                }
                else {
                    arg_names |= 2
                }
                if (arg_names === 3) {
                    throw new Error('[sprintf] mixing positional and named placeholders is not (yet) supported')
                }
                parse_tree.push(match)
            }
            else {
                throw new SyntaxError('[sprintf] unexpected placeholder')
            }
            _fmt = _fmt.substring(match[0].length)
        }
        return sprintf_cache[fmt] = parse_tree
    }

    /**
     * export to either browser or node.js
     */
    /* eslint-disable quote-props */
    if (true) {
        exports['sprintf'] = sprintf
        exports['vsprintf'] = vsprintf
    }
    if (typeof window !== 'undefined') {
        window['sprintf'] = sprintf
        window['vsprintf'] = vsprintf

        if (true) {
            !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
                return {
                    'sprintf': sprintf,
                    'vsprintf': vsprintf
                }
            }.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
        }
    }
    /* eslint-enable quote-props */
}()


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var config = __webpack_require__(2);
var INIT_TICK = Math.floor(Math.random()*100 + 1)/100 * 3;
var INIT_DOTTICK = Math.floor(Math.random()*100 + 1)/100 * 3;

function State() {
  this.casts = 0;
  this.hits = 0;
  this.crits = 0;
  this.dhs = 0;
  this.phase = "NONE";
  this.init = true;
  this.stack = 0;
  this.animation = 0;
  this.phaseTimer = 0;
  this.time = 0;
  this.gcd = 0;
  this.tick = 0 - INIT_TICK;
  this.dotTick = 0 - INIT_DOTTICK;
  this.mp = config.MaxMp;
  this.potency = 0;
  this.procs = {};
  this.recast = {};
  this.enochian = false;
  this.umbralhearts = 0;
  this.polyglot = 0;
  this.casting = 0;
  this.foul = false;
  this.dmgMod = 1;
}

module.exports = State;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var config = __webpack_require__(7);
module.exports = config;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var Sim = __webpack_require__(4);
var State = __webpack_require__(1);
var sprintf = __webpack_require__(0).sprintf;
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


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var skills = __webpack_require__(5);
var defaultConfig = __webpack_require__(2);
var sprintf = __webpack_require__(0).sprintf;
var util = __webpack_require__(8);
var State = __webpack_require__(1);
var rand = __webpack_require__(9).create();

var Sim = function(options) {
  options = options || {};
  this.options = options;
  this.config = options.config || defaultConfig;
  this.next = options.next || next;
  this.state = options.state || new State();
  var logger = new util.ConsoleLogger(this.state);
  this.logger = options.logger || logger;
  this.logger.info('tick init', this.state.tick);
  this.logger.info('dot tick init', this.state.dotTick);
  this.target = {
    dots: {}
  };
  return this;
}


Sim.prototype.cast = function(spell) {
  var state = this.state;
  if(state.casting > 0) {
    this.logger.error("can't cast", spell.name, ": casting ", state.lastSpell.name);
    return false;
  }
  if(state.recast[spell.name] > 0) {
    this.logger.error("can't cast", spell.name, ": on cooldown", state.recast[spell.name]);
    return false;
  }
  if(state.animation > 0) {
    this.logger.error("can't cast", spell.name, ": in animation lock");
    return false;
  }
  if(state.mp < spell.mp) {
    this.logger.error("can't cast", spell.name, ": Not enough mp");
    return false;
  }
  this.logger.info("phase:", state.phase, sprintf("%0.2fs", state.phaseTimer));
  this.logger.info("start casting", spell.name);
  state.casts += 1;
  if(spell.require) {
    for(var r of spell.require) {
      if(r == 'enochian') {
        if(!state.enochian) {
          this.logger.error("can't cast", spell.name, ": no enochain");
        }
      } else if(r == 'ICE') {
        if(state.stack >= 0) {
          this.logger.error("can't cast", spell.name, ": not in ICE phase");
        }
      } else if(r == 'FIRE') {
        if(state.stack <= 0) {
          this.logger.error("can't cast", spell.name, ": not in FIRE phase");
        }
      } else if(r == 'foul') {
        if(!state.foul) {
          this.logger.error("can't cast", spell.name, ": doesn't have foul");
        }
      }
    }
  }
  state.recast[spell.name] = spell.recast;
  state.mp -= spell.mp;
  state.casting = spell.cast;
  state.lastSpell = spell;
  if(spell.gcd) {
    state.gcd = Math.max(spell.cast, this.config.gcd);
  }
  if(spell.cast == 0) {
    this.casted(state);
  }
  state.animation = spell.animation || 0.1;
  // console.log("anim", state.animation);
}

Sim.prototype.casted = function() {
  var state = this.state;
  if(!state.lastSpell) {
    return;
  }
  if(state.casting > 0) {
    return;
  }
  var spell = state.lastSpell;
  var potency = spell.potency;

  if(spell.dot) {
    var d = spell.dot;
    this.target.dots[spell.name] = {
      duration: d.duration,
      // potency: d.potency * state.dmgMod,
      potency: d.potency * state.dmgMod,
      proc: d.proc,
      chr: this.config.critRate,
      chd: this.config.critDamage,
      dhr: this.config.dhRate,
      dhd: this.config.dhDamage,
    };
  }
  if(spell.proc) {
    if(spell.proc.chance > rand(100)) {
      state.procs[spell.proc.name] = spell.proc.duration;
      this.logger.info("gains", spell.proc.name);
    }
  }
  if(spell.consumes) {
    for(var consume of spell.consumes) {
      if(!state.procs.hasOwnProperty(consume)) {
        this.logger.error("no such proc", consume);
      } else {
        delete state.procs[consume];
      }
    }
  }

  if(potency > 0) {
    if(this.config.simulateCrit && this.config.critRate*1000 > rand(1000)) {
      potency += potency * this.config.critDamage;
      this.logger.info("crit!");
      state.crits += 1;
    }
    if(this.config.simulateDirecthit && this.config.dhRate*1000 > rand(1000)) {
      potency += potency * this.config.dhDamage;
      this.logger.info("direct hit!");
      state.dhs += 1;
    }
    potency *= state.dmgMod;
    state.hits += 1;
    this.logger.info(sprintf("cast %s, potency: %d (from %d)", spell.name, potency, spell.potency));
  } else {
    this.logger.info(sprintf("cast %s, potency: %d", spell.name, spell.potency));
  }
  state.potency += potency;
  state.lastSpell = 0;
  this.phase(spell);
}

Sim.prototype.updateDamageMod = function() {
  this.state.dmgMod = this.config.detMod;
}

Sim.prototype.tick = function () {
  var state = this.state;
  var remove = [];
  this.updateDamageMod();
  if(state.phaseTimer > 0) {
    state.phaseTimer -= 0.01;
    if(state.phaseTimer <= 0) {
      state.phaseTimer = 0;
      state.enochian = false;
    }
  }
  state.time += 0.01;
  state.tick += 0.01;
  state.dotTick += 0.01;
  state.casting -= 0.01;
  if(state.casting <= 0) {
    state.casting = 0;
  }
  this.casted(state);
  state.gcd -= 0.01;
  if(state.gcd < 0) {
    state.gcd = 0;
  }
  state.animation -= 0.01;
  if(state.animation < 0) {
    state.animation = 0;
  }
  state.polyglot -= 0.01;
  if(state.polyglot <= 0 && state.enochian) {
    state.polyglot = 30.01;
    if(state.foul) {
      this.logger.info("overwriting foul!!")
    }
    state.foul = true;
  }
  /* recast timers */
  for(var r in state.recast) {
    state.recast[r] -= 0.01;
    if(state.recast[r] <= 0) {
      state.recast[r] = 0;
    }
  }

  // dots
  remove = [];
  for(var d in this.target.dots) {
    this.target.dots[d].duration -= 0.01;
    if(this.target.dots[d].duration <= 0) {
      remove.push(d);
    }
  }
  for(var r of remove) {
    delete this.target.dots[r];
  }

  if(state.dotTick >= 3) {
    state.dotTick = 0;
    this.logger.info('== dot tick ==');
    // dot tick
    for(var d in this.target.dots) {
      var dot = this.target.dots[d];
      var potency = dot.potency;
      if(this.config.simulateCrit && dot.chr*1000 > rand(1000)) {
        potency += potency * dot.chd;
        this.logger.info("dot crit!");
        //state.crits += 1;
      }
      if(this.config.simulateDirecthit && dot.dhr*1000 > rand(1000)) {
        potency += potency * dot.dhd;
        this.logger.info("dot direct hit!");
        //state.dhs += 1;
      }
      state.potency += potency;
      this.logger.info(sprintf("%s ticks for %d (from %d)", d, potency, dot.potency));
      if(dot.proc) {
        if(dot.proc.chance > rand(100)) {
          this.logger.info("gains", dot.proc.name);
          state.procs[dot.proc.name] = dot.proc.duration;
        }
      }
    }
  }
  if(state.tick < 3) {
    return;
  }
  this.logger.info('== tick == ');
  state.tick = 0;

  // restore mp
  if(state.stack < 0) {
    var mpgain = Math.floor(this.config.MaxMp * this.config.UIMPBonus[Math.abs(state.stack) - 1]);
    this.logger.info('mp gain:', mpgain, state.mp, "=>", Math.min(state.mp+mpgain, this.config.MaxMp));
    state.mp += mpgain;
  } else if(state.stack == 0) {
    state.mp += this.config.MaxMp * 0.03;
  }
  if(state.mp > this.config.MaxMp) {
    state.mp = this.config.MaxMp;
  }
}

Sim.prototype.phase = function(spell) {
  var state = this.state;
  // console.log('phase', state, spell);
  if(spell.type == "CONVERT") {
    if(state.stack > 0) {
      state.stack = -1;
      state.phase = 'ICE';
    } else if (state.stack < 0) {
      state.stack = 1;
      state.phase = 'FIRE';
    }
    return;
  }
  if(spell.type == 'ENOCHIAN') {
    if(state.stack != 0) {
      state.enochian = true;
      state.polyglot = 30;
    } else {
      this.logger.error("Enochian has no effect!");
    }
    return;
  }
  if(spell.type == 'FOUL') {
    if(!state.foul) {
      this.logger.error("phase foul: no foul.")
    }
    state.foul = false;
  }
  if(spell.name == 'Blizzard IV') {
    state.umbralhearts = 3;
  }
  if(spell.type == 'FIRE' && spell.mp > 0 && state.umbralhearts > 0) {
    state.umbralhearts--;
  }
  if(spell.name == 'Fire IV') {
    return;
  }
  if(spell.type != 'FIRE' && spell.type != 'ICE') {
    return;
  }
  if(spell.name === 'Fire III') {
    state.stack = 3;
    state.phaseTimer = this.config.PhaseDuration;
  } else if(spell.name === 'Blizzard III') {
    state.stack = -3;
    state.phaseTimer = this.config.PhaseDuration;
  } else if(state.stack == 0) {
    state.stack += (spell.type==='FIRE'?1:-1);
  } else {
    if(state.phaseTimer <= 0) {
      this.logger.error('dropping phase!!')
      state.stack = 0;
    }
    if(state.stack > 0 && spell.type === 'FIRE') {
      state.phaseTimer = this.config.PhaseDuration;
      state.stack++;
    } else if(state.stack < 0 && spell.type === 'ICE') {
      state.phaseTimer = this.config.PhaseDuration;
      state.stack--;
    } else {
      state.phaseTimer = 0;
      state.stack = 0;
    }
  }

  if(state.stack > 3) {
    state.stack = 3;
  } else if(state.stack < -3) {
    state.stack = -3;
  }
  if(state.stack > 0) {
    state.phase = "FIRE";
  } else if(state.stack < 0) {
    state.phase = 'ICE';
  }
}

var next = function() {
  var state = this.state;
  var cast = this.cast.bind(this);
  if(state.animation > 0) {
    return 1;
  }
  if(state.init) {
    if(state.casting > 0) {
      return 0;
    }
    var b3 = skills['Blizzard III'](state);
    if(state.stack < 0) {
      var eno = skills['Enochian'](state);
      cast(eno);
      state.init = false;
      return 1;
    }
    cast(b3);
    return;
  }
  if(state.phaseTimer <= 0) {
    this.logger.error("dropped phase timer!!!!")
  }
  var stack = state.stack;
  if(state.stack > 0) {
    if(state.gcd > 0) {
      return 1;
    }
    var f1 = skills['Fire'](state);
    var f4 = skills['Fire IV'](state);
    var b3 = skills['Blizzard III'](state);
    var f3 = skills['Fire III'](state);
    var t3 = skills['Thunder III'](state);
    if(t3.mp == 0 && f3.mp == 0 && state.phaseTimer > 2 * this.config.gcd) {
      // console.log('use t3p');
      cast(t3);
    } else if(state.mp > f4.mp + b3.mp && state.phaseTimer > f4.cast + f1.cast) {
      cast(f4);
    } else if(f3.mp == 0) {
      // console.log('use f3p');
      cast(f3);
    } else if(f1.mp + b3.mp < state.mp) {
      cast(f1);
    } else {
      cast(b3);
    }
  } else if (state.stack < 0) {
    if(state.gcd > 0) {
      return 1;
    }
    var b1 = skills['Blizzard'](state);
    var f3 = skills['Fire III'](state);
    var t3 = skills['Thunder III'](state);
    var b4 = skills['Blizzard IV'](state);
    var convert = skills['Convert'](state);
    var foul = skills['Foul'](state);
    if(state.foul && state.polyglot < 3*this.config.gcd) {
      cast(foul);
      return 1;
    }
    if(state.umbralhearts < 3 && state.mp > b4.mp) {
      cast(b4);
      return 1;
    }
    if(state.mp > t3.mp && 
      (!this.target.dots['Thunder III'] || this.target.dots['Thunder III'].duration < 12)) {
      cast(t3);
      return 1;
    }
    if(t3.mp == 0 && state.phaseTimer > (f3.cast + this.config.gcd) && this.target.dots['Thunder III'].duration <= 21) {
      cast(t3);
      return 1;
    }
    if(state.foul) {
      cast(foul);
      return 1;
    }
    if(state.mp < b1.mp) {
      return 1;
    }
    var mpgain = Math.floor(this.config.MaxMp * this.config.UIMPBonus[Math.abs(state.stack) - 1]);
    if(state.mp < this.config.MaxMp) {
      cast(b1);
    } else {
      if(f3.mp == 0) {
        cast(convert);
      } else {
        cast(f3);
      }
    }
  } else {
    this.logger.log(state);
    // var b3 = skills['Blizzard III'](state);
    // cast(b3);
  }
  return 1;
};

Sim.prototype.loop = function() {
  var state = this.state;
  state.config = this.config;
  for(var i = 0; i < this.config.fightDuration*100; ++i) {
    this.tick(state);
    var n = next.call(this);
  }
}

Sim.prototype.stats = function() {
  var state = this.state;
  return {
    "potency": state.potency,
    "critRate": parseInt(state.crits/state.hits*1000)/10,
    "dhRate": parseInt(state.dhs/state.hits*1000)/10,
    "casts": state.casts,
    "pps": state.potency/state.time,
  };
}

Sim.prototype.configure = function(config) {
  var BASE_SPS = 364;
  var BASE_GCD = 2500;
  var BASE_IVGCD = 2800;

  config.dotMod = parseInt(1000 * (1 / (1 - parseInt(130 * (config.spellSpeed - BASE_SPS) / 2170)/1000)))/1000;
  // GCD = INT(INT(100 * Special!$B$38  * (int(Special!C$2 * (1000 - INT(Special!$F$22 * ($B20) / Special!$B$1))/1000) / 1000)) / 100)/100
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

  this.logger.info('spell speed', config.spellSpeed);
  this.logger.info('dot mod', config.dotMod);
  this.logger.info('gcd', config.gcd);
  this.logger.info('ivcast', config.ivcast);

  this.logger.info('crit', config.crit);
  this.logger.info('crit rate', config.critRate);
  this.logger.info('crit damage', config.critDamage);

  this.logger.info('dh', config.directhit);
  this.logger.info('dh rate', config.dhRate);
  this.logger.info('dh damage', config.dhDamage);

  this.logger.info('determination', config.determination);
  this.logger.info('det mod', config.detMod);
  this.config = config;
}


module.exports = Sim;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var skills = __webpack_require__(6);

var skillFuncs = {};

var OVERWRITING_ATTR = ['cast', 'potency', 'mp', 'animation', 'consumes'];
function overwrite(skill, proc) {
  for(var attr of OVERWRITING_ATTR) {
    if(!proc.hasOwnProperty(attr)) {
      continue;
    }
    skill[attr] = proc[attr];
  }
}

for(var s of skills) {
  (function(s) {
    skillFuncs[s.name] = function(state) {
      var skill = {};
      skill.name = s.name;
      skill.cast = s.cast;
      skill.potency = s.potency;
      skill.dot = s.dot;
      skill.mp = s.mp || 0;
      skill.type = s.type;
      skill.proc = s.proc;
      skill.gcd = s.gcd;
      skill.recast = s.recast || state.config.gcd;
      skill.animation = s.animation;
      skill.require = s.require;
      if(s.iv) {
        skill.cast = state.config.ivcast;
      }
      if(s.dot) {
        var dotMod = state.config.dotMod
        skill.dot = {
          duration: s.dot.duration,
          potency: s.dot.potency * dotMod,
          proc: s.dot.proc,
        }
      }
      var stack = Math.abs(state.stack);
      if(s.procConditions) {
        for(var cond of s.procConditions) {
          if(state.procs[cond.name] && state.procs[cond.name] > 0) {
            overwrite(skill, cond);
          }
        }
      }
      if(stack == 0) {
        return skill;
      }
      if(state.phase == "ICE") {
        if(s.type == "FIRE") {
          skill.mp = parseInt(state.config.UICostFire[stack - 1] * skill.mp);
          skill.cast = state.config.UICastBonus[stack - 1] * skill.cast;
          skill.potency = state.config.UIPenalty[stack - 1] * skill.potency;
        } else {
          skill.mp = skill.mp;
        }
      } else if(state.phase == "FIRE") {
        if(s.type == "ICE") {
          skill.mp = parseInt(state.config.AFCostIce[stack - 1] * skill.mp);
          skill.cast = state.config.AFCastBonus[stack - 1] * skill.cast;
          skill.potency = state.config.AFPenalty[stack - 1] * skill.potency;
        } else if (s.type == "FIRE") {
          if(state.umbralhearts == 0) {
            skill.mp = parseInt(state.config.AFCostFire[stack - 1] * skill.mp);
          }
          skill.potency = state.config.AFBonus[stack - 1] * skill.potency;
        }
      }
      return skill;
    };
  })(s);
}

module.exports = skillFuncs;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = [{"name":"Fire","potency":180,"mp":1200,"cast":2.5,"gcd":true,"type":"FIRE","proc":{"name":"Firestarter","chance":40,"duration":12},"animation":0.1},{"name":"Fire IV","potency":260,"mp":1200,"cast":2.8,"gcd":true,"type":"FIRE","require":["enochian","FIRE"],"animation":0.1,"iv":true},{"name":"Blizzard","mp":480,"potency":180,"cast":2.5,"gcd":true,"type":"ICE","animation":0.1},{"name":"Blizzard III","mp":1440,"potency":180,"cast":3.5,"gcd":true,"type":"ICE","animation":0.1},{"name":"Blizzard IV","potency":260,"mp":960,"cast":2.8,"gcd":true,"type":"ICE","require":["enochian","ICE"],"animation":0.1,"iv":true},{"name":"Fire III","mp":2400,"potency":240,"cast":3.5,"gcd":true,"animation":0.1,"type":"FIRE","procConditions":[{"name":"Firestarter","cast":0,"mp":0,"consumes":["Firestarter"],"animation":0.6}]},{"name":"Thunder III","mp":1920,"potency":70,"dot":{"potency":40,"duration":24,"proc":{"chance":10,"name":"Thundercloud","duration":12}},"procConditions":[{"name":"Thundercloud","cast":0,"mp":0,"potency":390,"consumes":["Thundercloud"],"animation":0.6}],"cast":2.5,"gcd":true,"type":"THUNDER","animation":0.1},{"name":"Convert","potency":0,"cast":0,"gcd":false,"animation":0.6,"type":"CONVERT","recast":12},{"name":"Enochian","potency":0,"cast":0,"gcd":false,"animation":0.6,"type":"ENOCHIAN","recast":30},{"name":"Foul","potency":650,"gcd":true,"cast":2.5,"animation":0.1,"type":"FOUL","require":["foul"]}]

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = {"gcd":2.5,"spellSpeed":1917,"crit":1084,"directhit":1355,"determination":1159,"dhDamage":0.25,"ivgcd":2.8,"animation":0.6,"MaxMp":15480,"PhaseDuration":13,"simulateCrit":true,"simulateDirecthit":true,"fightDuration":700,"AFBonus":[1.4,1.6,1.8],"AFCostFire":[2,2,2],"AFCostIce":[0.5,0.25,0.25],"AFPenalty":[0.9,0.8,0.7],"AFCastBonus":[1,1,0.5],"UIMPBonus":[0.32,0.47,0.62],"UICostFire":[0.5,0.25,0.25],"UIPenalty":[0.9,0.8,0.7],"UICastBonus":[1,1,0.5]}

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var sprintf = __webpack_require__(0).sprintf;
var state = __webpack_require__(1);

function ConsoleLogger(state) {
  this._state = state;
  return this;
}

ConsoleLogger.prototype.info = function() {
  var timestamp = sprintf("[%06.2f]", this._state.time);
  var args = Array.prototype.slice.call(arguments);
  args.unshift(timestamp);
  console.log.apply(this, args);
};

ConsoleLogger.prototype.error = function() {
  var timestamp = sprintf("[%06.2f] ERROR ", this._state.time);
  var args = Array.prototype.slice.call(arguments);
  args.unshift(timestamp);
  console.log.apply(this, args);
}

module.exports = {
  ConsoleLogger: ConsoleLogger,
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 * random-seed
 * https://github.com/skratchdot/random-seed
 *
 * This code was originally written by Steve Gibson and can be found here:
 *
 * https://www.grc.com/otg/uheprng.htm
 *
 * It was slightly modified for use in node, to pass jshint, and a few additional
 * helper functions were added.
 *
 * Copyright (c) 2013 skratchdot
 * Dual Licensed under the MIT license and the original GRC copyright/license
 * included below.
 */
/*	============================================================================
									Gibson Research Corporation
				UHEPRNG - Ultra High Entropy Pseudo-Random Number Generator
	============================================================================
	LICENSE AND COPYRIGHT:  THIS CODE IS HEREBY RELEASED INTO THE PUBLIC DOMAIN
	Gibson Research Corporation releases and disclaims ALL RIGHTS AND TITLE IN
	THIS CODE OR ANY DERIVATIVES. Anyone may be freely use it for any purpose.
	============================================================================
	This is GRC's cryptographically strong PRNG (pseudo-random number generator)
	for JavaScript. It is driven by 1536 bits of entropy, stored in an array of
	48, 32-bit JavaScript variables.  Since many applications of this generator,
	including ours with the "Off The Grid" Latin Square generator, may require
	the deteriministic re-generation of a sequence of PRNs, this PRNG's initial
	entropic state can be read and written as a static whole, and incrementally
	evolved by pouring new source entropy into the generator's internal state.
	----------------------------------------------------------------------------
	ENDLESS THANKS are due Johannes Baagoe for his careful development of highly
	robust JavaScript implementations of JS PRNGs.  This work was based upon his
	JavaScript "Alea" PRNG which is based upon the extremely robust Multiply-
	With-Carry (MWC) PRNG invented by George Marsaglia. MWC Algorithm References:
	http://www.GRC.com/otg/Marsaglia_PRNGs.pdf
	http://www.GRC.com/otg/Marsaglia_MWC_Generators.pdf
	----------------------------------------------------------------------------
	The quality of this algorithm's pseudo-random numbers have been verified by
	multiple independent researchers. It handily passes the fermilab.ch tests as
	well as the "diehard" and "dieharder" test suites.  For individuals wishing
	to further verify the quality of this algorithm's pseudo-random numbers, a
	256-megabyte file of this algorithm's output may be downloaded from GRC.com,
	and a Microsoft Windows scripting host (WSH) version of this algorithm may be
	downloaded and run from the Windows command prompt to generate unique files
	of any size:
	The Fermilab "ENT" tests: http://fourmilab.ch/random/
	The 256-megabyte sample PRN file at GRC: https://www.GRC.com/otg/uheprng.bin
	The Windows scripting host version: https://www.GRC.com/otg/wsh-uheprng.js
	----------------------------------------------------------------------------
	Qualifying MWC multipliers are: 187884, 686118, 898134, 1104375, 1250205,
	1460910 and 1768863. (We use the largest one that's < 2^21)
	============================================================================ */

var stringify = __webpack_require__(10);

/*	============================================================================
This is based upon Johannes Baagoe's carefully designed and efficient hash
function for use with JavaScript.  It has a proven "avalanche" effect such
that every bit of the input affects every bit of the output 50% of the time,
which is good.	See: http://baagoe.com/en/RandomMusings/hash/avalanche.xhtml
============================================================================
*/
var Mash = function () {
	var n = 0xefc8249d;
	var mash = function (data) {
		if (data) {
			data = data.toString();
			for (var i = 0; i < data.length; i++) {
				n += data.charCodeAt(i);
				var h = 0.02519603282416938 * n;
				n = h >>> 0;
				h -= n;
				h *= n;
				n = h >>> 0;
				h -= n;
				n += h * 0x100000000; // 2^32
			}
			return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
		} else {
			n = 0xefc8249d;
		}
	};
	return mash;
};

var uheprng = function (seed) {
	return (function () {
		var o = 48; // set the 'order' number of ENTROPY-holding 32-bit values
		var c = 1; // init the 'carry' used by the multiply-with-carry (MWC) algorithm
		var p = o; // init the 'phase' (max-1) of the intermediate variable pointer
		var s = new Array(o); // declare our intermediate variables array
		var i; // general purpose local
		var j; // general purpose local
		var k = 0; // general purpose local

		// when our "uheprng" is initially invoked our PRNG state is initialized from the
		// browser's own local PRNG. This is okay since although its generator might not
		// be wonderful, it's useful for establishing large startup entropy for our usage.
		var mash = new Mash(); // get a pointer to our high-performance "Mash" hash

		// fill the array with initial mash hash values
		for (i = 0; i < o; i++) {
			s[i] = mash(Math.random());
		}

		// this PRIVATE (internal access only) function is the heart of the multiply-with-carry
		// (MWC) PRNG algorithm. When called it returns a pseudo-random number in the form of a
		// 32-bit JavaScript fraction (0.0 to <1.0) it is a PRIVATE function used by the default
		// [0-1] return function, and by the random 'string(n)' function which returns 'n'
		// characters from 33 to 126.
		var rawprng = function () {
			if (++p >= o) {
				p = 0;
			}
			var t = 1768863 * s[p] + c * 2.3283064365386963e-10; // 2^-32
			return s[p] = t - (c = t | 0);
		};

		// this EXPORTED function is the default function returned by this library.
		// The values returned are integers in the range from 0 to range-1. We first
		// obtain two 32-bit fractions (from rawprng) to synthesize a single high
		// resolution 53-bit prng (0 to <1), then we multiply this by the caller's
		// "range" param and take the "floor" to return a equally probable integer.
		var random = function (range) {
			return Math.floor(range * (rawprng() + (rawprng() * 0x200000 | 0) * 1.1102230246251565e-16)); // 2^-53
		};

		// this EXPORTED function 'string(n)' returns a pseudo-random string of
		// 'n' printable characters ranging from chr(33) to chr(126) inclusive.
		random.string = function (count) {
			var i;
			var s = '';
			for (i = 0; i < count; i++) {
				s += String.fromCharCode(33 + random(94));
			}
			return s;
		};

		// this PRIVATE "hash" function is used to evolve the generator's internal
		// entropy state. It is also called by the EXPORTED addEntropy() function
		// which is used to pour entropy into the PRNG.
		var hash = function () {
			var args = Array.prototype.slice.call(arguments);
			for (i = 0; i < args.length; i++) {
				for (j = 0; j < o; j++) {
					s[j] -= mash(args[i]);
					if (s[j] < 0) {
						s[j] += 1;
					}
				}
			}
		};

		// this EXPORTED "clean string" function removes leading and trailing spaces and non-printing
		// control characters, including any embedded carriage-return (CR) and line-feed (LF) characters,
		// from any string it is handed. this is also used by the 'hashstring' function (below) to help
		// users always obtain the same EFFECTIVE uheprng seeding key.
		random.cleanString = function (inStr) {
			inStr = inStr.replace(/(^\s*)|(\s*$)/gi, ''); // remove any/all leading spaces
			inStr = inStr.replace(/[\x00-\x1F]/gi, ''); // remove any/all control characters
			inStr = inStr.replace(/\n /, '\n'); // remove any/all trailing spaces
			return inStr; // return the cleaned up result
		};

		// this EXPORTED "hash string" function hashes the provided character string after first removing
		// any leading or trailing spaces and ignoring any embedded carriage returns (CR) or Line Feeds (LF)
		random.hashString = function (inStr) {
			inStr = random.cleanString(inStr);
			mash(inStr); // use the string to evolve the 'mash' state
			for (i = 0; i < inStr.length; i++) { // scan through the characters in our string
				k = inStr.charCodeAt(i); // get the character code at the location
				for (j = 0; j < o; j++) { //	"mash" it into the UHEPRNG state
					s[j] -= mash(k);
					if (s[j] < 0) {
						s[j] += 1;
					}
				}
			}
		};

		// this EXPORTED function allows you to seed the random generator.
		random.seed = function (seed) {
			if (typeof seed === 'undefined' || seed === null) {
				seed = Math.random();
			}
			if (typeof seed !== 'string') {
				seed = stringify(seed, function (key, value) {
					if (typeof value === 'function') {
						return (value).toString();
					}
					return value;
				});
			}
			random.initState();
			random.hashString(seed);
		};

		// this handy exported function is used to add entropy to our uheprng at any time
		random.addEntropy = function ( /* accept zero or more arguments */ ) {
			var args = [];
			for (i = 0; i < arguments.length; i++) {
				args.push(arguments[i]);
			}
			hash((k++) + (new Date().getTime()) + args.join('') + Math.random());
		};

		// if we want to provide a deterministic startup context for our PRNG,
		// but without directly setting the internal state variables, this allows
		// us to initialize the mash hash and PRNG's internal state before providing
		// some hashing input
		random.initState = function () {
			mash(); // pass a null arg to force mash hash to init
			for (i = 0; i < o; i++) {
				s[i] = mash(' '); // fill the array with initial mash hash values
			}
			c = 1; // init our multiply-with-carry carry
			p = o; // init our phase
		};

		// we use this (optional) exported function to signal the JavaScript interpreter
		// that we're finished using the "Mash" hash function so that it can free up the
		// local "instance variables" is will have been maintaining.  It's not strictly
		// necessary, of course, but it's good JavaScript citizenship.
		random.done = function () {
			mash = null;
		};

		// if we called "uheprng" with a seed value, then execute random.seed() before returning
		if (typeof seed !== 'undefined') {
			random.seed(seed);
		}

		// Returns a random integer between 0 (inclusive) and range (exclusive)
		random.range = function (range) {
			return random(range);
		};

		// Returns a random float between 0 (inclusive) and 1 (exclusive)
		random.random = function () {
			return random(Number.MAX_VALUE - 1) / Number.MAX_VALUE;
		};

		// Returns a random float between min (inclusive) and max (exclusive)
		random.floatBetween = function (min, max) {
			return random.random() * (max - min) + min;
		};

		// Returns a random integer between min (inclusive) and max (inclusive)
		random.intBetween = function (min, max) {
			return Math.floor(random.random() * (max - min + 1)) + min;
		};

		// when our main outer "uheprng" function is called, after setting up our
		// initial variables and entropic state, we return an "instance pointer"
		// to the internal anonymous function which can then be used to access
		// the uheprng's various exported functions.  As with the ".done" function
		// above, we should set the returned value to 'null' once we're finished
		// using any of these functions.
		return random;
	}());
};

// Modification for use in node:
uheprng.create = function (seed) {
	return new uheprng(seed);
};
module.exports = uheprng;


/***/ }),
/* 10 */
/***/ (function(module, exports) {

exports = module.exports = stringify
exports.getSerialize = serializer

function stringify(obj, replacer, spaces, cycleReplacer) {
  return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces)
}

function serializer(replacer, cycleReplacer) {
  var stack = [], keys = []

  if (cycleReplacer == null) cycleReplacer = function(key, value) {
    if (stack[0] === value) return "[Circular ~]"
    return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
  }

  return function(key, value) {
    if (stack.length > 0) {
      var thisPos = stack.indexOf(this)
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
      if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
    }
    else stack.push(value)

    return replacer == null ? value : replacer.call(this, key, value)
  }
}


/***/ })
/******/ ]);