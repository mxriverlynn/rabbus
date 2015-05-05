var util = require("util");
var EventEmitter = require("events").EventEmitter;

// Constructor
// -----------

function Config(middleware){
  EventEmitter.call(this);
}

util.inherits(Config, EventEmitter);

// API
// ---

Config.prototype.last = function(finalFn, ctx){
  this.finalFn = finalFn.bind(ctx);
};

// Exports
// -------

module.exports = Config;
