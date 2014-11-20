var Events = require("events");
var util = require("util");
var when = require("when");

// Base Requester
// -----------

function Requester(rabbit, options){
  this.rabbit = rabbit;
  this.exchange = options.exchange;
  this.messageType = options.messageType;
  this.autoDelete = !!options.autoDelete;
}

util.inherits(Requester, Events.EventEmitter);

// Requester Instance Members
// ------------------------

Requester.prototype._start = function(){
  var rabbit = this.rabbit;
  var exchange = this.exchange;
  var autoDelete = this.autoDelete;

  if (this._startPromise){
    return this._startPromise;
  }

  console.log("configuring requester for", exchange);

  this._startPromise = rabbit.addExchange(exchange, "fanout", {
    durable: true,
    persistent: true,
    autoDelete: autoDelete
  });

  return this._startPromise;
};

Requester.prototype.request = function(data, cb){
  var that = this;
  var rabbit = this.rabbit;

  var exchange = this.exchange;
  var messageType = this.messageType;

  this._start().then(function(){
    that.emit("ready");

    rabbit.request(exchange, {
      type: messageType,
      body: data
    }).then(function(reply){
      cb(reply.body);
      reply.ack();
    }).then(null, function(err){
      that.emitError(err);
    });

  }).then(null, function(err){
    that.emitError(err);
  });
};

Requester.prototype.emitError = function(err){
  this.emit("error", err);
};

// Exports
// -------

module.exports = Requester;
