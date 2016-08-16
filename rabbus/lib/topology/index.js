var EventEmitter = require("events").EventEmitter;
var util = require("util");

var logger = require("../logging")("rabbus.topology");
var OptionParser = require("../optionParser");

var startKey = Symbol("started");

// Topology
// --------

function Topology(rabbit, options, defaults){
  this.rabbit = rabbit;
  this.options = OptionParser.parse(options, defaults);

  this.routingKey = this.options.routingKey;
  this.messageType = this.options.messageType;
  this.exchange = this.options.exchange;
  this.queue = this.options.queue;
  this.routingKey = this.options.routingKey;
}

// Type Members
// ------------

Topology.verify = function(rabbit, options, defaults, cb){
  var topology;

  if (isTopology(options)){
    topology = options;
    cb(undefined, topology);
  } else {
    topology = new Topology(rabbit, options, defaults);
    topology.execute((err) => {
      return cb(err, topology);
    });
  }
};

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
  if (this[startKey]){ return this[startKey]; }

  var exchange = this.options.exchange;
  var queue = this.options.queue;
  var routingKey = this.options.routingKey;

  this[startKey] = new Promise((resolve, reject) => {
    
    var exP = this._addExchange(exchange);
    var qP = this._addQueue(queue);

    Promise.all([exP, qP])
    .then(() => {
      var hasExchange = !!exchange;
      var hasQueue = !!queue;
      if (hasExchange && hasQueue){
        return this._addBinding(exchange.name, queue.name, routingKey);
      }
    })
    .then(() => resolve())
    .catch(reject);
  });

  return this[startKey];
};

Topology.prototype._addExchange = function(exchangeOptions){
  if (!exchangeOptions) { return; }
  if (exchangeOptions.declare === false) { return; }

  logger.debug("Declaring Exchange '" + exchangeOptions.name + "'");
  logger.debug("With Exchange Options");
  logger.debug(exchangeOptions);

  var exP = this.rabbit.addExchange(
    exchangeOptions.name,
    exchangeOptions.type,
    exchangeOptions
  );

  return exP;
};

Topology.prototype._addQueue = function(queueOptions){
  if (!queueOptions) { return; }
  if (queueOptions.declare === false) { return; }

  logger.debug("Declaring Queue '" + queueOptions.name + "'");
  logger.debug("With Queue Options");
  logger.debug(queueOptions);

  var qP = this.rabbit.addQueue(queueOptions.name, queueOptions);
  return qP;
};

Topology.prototype._addBinding = function(ex, q, routingKey){
  if ((!ex) || (!q)){ return ; }

  logger.debug("Add Binding", ex, q, routingKey);

  var bP = this.rabbit.bindQueue(ex, q, routingKey);
  return bP;
};

// Helpers
// -------

function isTopology(obj){
  if (!obj){ return false; }
  var type = typeof obj.execute;
  return (type.toLowerCase() === "function");
}

// Exports
// -------

module.exports = Topology;
