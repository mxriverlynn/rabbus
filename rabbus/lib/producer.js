var EventEmitter = require("events").EventEmitter;
var util = require("util");
var when = require("when");

var optionParser = require("./optionParser");
var Shire = require("./shire");

// Base Producer
// -------------

function Producer(rabbit, options, defaults){
  EventEmitter.call(this);

  this.rabbit = rabbit;
  this.options = optionParser.parse(options, defaults);
  this.middleware = new Shire.Producer();
}

util.inherits(Producer, EventEmitter);

// Public API
// ----------

Producer.prototype.use = function(fn){
  this.middleware.add(fn);
};

Producer.prototype.stop = function(){
  this.removeAllListeners();
};

// Private Members
// ---------------

Producer.prototype._start = function(){
  if (this._startPromise){ return this._startPromise; }

  var exchange = this.options.exchange;
  this._startPromise = this.rabbit.addExchange(exchange.name, exchange.type, exchange);

  return this._startPromise;
};

Producer.prototype.emitError = function(err){
  this.emit("error", err);
};

// Exports
// -------

module.exports = Producer;
