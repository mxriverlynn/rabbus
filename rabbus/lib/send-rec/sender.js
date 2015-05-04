var Events = require("events");
var util = require("util");
var when = require("when");
var _ = require("underscore");

var defaults = require("./defaults");
var optionParser = require("../optionParser");

// Base Sender
// --------------

function Sender(rabbit, options){
  this.rabbit = rabbit;
  this.options = optionParser.parse(options, defaults);
}

util.inherits(Sender, Events.EventEmitter);

// Sender Instance Members
// ------------------------

Sender.prototype._start = function(){
  if (this._startPromise){
    return this._startPromise;
  }

  var exchange = this.options.exchange;
  this._startPromise = this.rabbit.addExchange(exchange.name, exchange.type, exchange);

  return this._startPromise;
};

Sender.prototype.send = function(data, options, done){
  if (!done && _.isFunction(options)) {
    done = options;
    options = {};
  }
  if (!options) { options = {}; }

  var that = this;
  var rabbit = this.rabbit;
  var exchange = this.options.exchange;
  var messageType = this.options.messageType;
  var routingKey = this.options.routingKey;

  this._start().then(function(){
    that.emit("ready");
    console.log("sending message to", exchange.name);

    rabbit.publish(exchange.name, {
      routingKey: routingKey,
      correlationId: options.correlationId,
      type: messageType,
      body: data
    }).then(function(){
      if (done){ done(); }
    }).then(null, function(err){
      that.emitError(err);
    });
      
  }).then(null, function(err){
    that.emitError(err);
  });
};

Sender.prototype.emitError = function(err){
  this.emit("error", err);
};

Sender.prototype.stop = function(){
  this.removeAllListeners();
};

// Exports
// -------

module.exports = Sender;
