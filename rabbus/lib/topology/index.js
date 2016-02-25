var EventEmitter = require("events").EventEmitter;
var util = require("util");

var logger = require("../logging")("rabbus.topology");
var OptionParser = require("../optionParser");

// Topology
// --------

function Topology(rabbit, options, defaults){
  this.rabbit = rabbit;
  this.options = OptionParser.parse(options, defaults);
  this.exchange = this.options.exchange;
}

// Public Members
// --------------

Topology.prototype.execute = function(cb){
  this._start().then(() => {
    return cb(undefined, this.options);
  })
  .catch((err) => {
    return cb(err);
  });
};

// Private Members
// ---------------

Topology.prototype._start = function(){
  if (this._startPromise){ return this._startPromise; }
  var exchange = this.options.exchange;

  logger.info("Declaring exchange", exchange.name);
  logger.debug("With Exchange Options", exchange);

  this._startPromise = this.rabbit.addExchange(exchange.name, exchange.type, exchange);

  return this._startPromise;
};

// Exports
// -------

module.exports = Topology;
