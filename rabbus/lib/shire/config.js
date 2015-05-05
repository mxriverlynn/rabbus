var util = require("util");
var EventEmitter = require("events").EventEmitter;

var Handler = require("./handler");

// Constructor
// -----------

function Config(middleware){
  EventEmitter.call(this);
  this.middleware = middleware;
  this.handle = this.handle.bind(this);
}

util.inherits(Config, EventEmitter);

// API
// ---

Config.prototype.handle = function(message){
  var middleware = this.middleware.clone();
  var handler = new Handler(this, middleware, message);
  return handler.run();
};

Config.prototype.last = function(finalFn, ctx){
  this.finalFn = finalFn.bind(ctx);
};

// Exports
// -------

module.exports = Config;
