var Events = require("events");
var util = require("util");
var when = require("when");
var _ = require("underscore");

// Base Sender
// --------------

function Sender(rabbit, options){
  this.rabbit = rabbit;
  this.exchange = options.exchange;
  this.messageType = options.messageType;
  this.routingKey = options.routingKey || "default";
  this.autoDelete = !!options.autoDelete;
}

util.inherits(Sender, Events.EventEmitter);

// Sender Instance Members
// ------------------------

Sender.prototype._start = function(){
  if (this._startPromise){
    return this._startPromise;
  }

  this._startPromise = this.rabbit.addExchange(this.exchange, "direct", {
    durable: true,
    persistent: true,
    autoDelete: this.autoDelete
  });

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
  var exchange = this.exchange;
  var messageType = this.messageType;
  var routingKey = this.routingKey;

  this._start().then(function(){
    that.emit("ready");
    console.log("sending message to", exchange);

    rabbit.publish(exchange, {
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
