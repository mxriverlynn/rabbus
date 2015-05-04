var Events = require("events");
var util = require("util");
var when = require("when");

var defaults = require("./defaults");
var optionParser = require("../optionParser");

// Base Requester
// -----------

function Requester(rabbit, options){
  this.rabbit = rabbit;
  this.options = optionParser.parse(options, defaults);
}

util.inherits(Requester, Events.EventEmitter);

// Requester Instance Members
// ------------------------

Requester.prototype._start = function(){
  if (this._startPromise){
    return this._startPromise;
  }

  var exchange = this.options.exchange;
  console.log("configuring requester for", exchange.name);
  this._startPromise = this.rabbit.addExchange(exchange.name, exchange.type, exchange);

  return this._startPromise;
};

Requester.prototype.request = function(data, cb){
  var that = this;
  var rabbit = this.rabbit;

  var exchange = this.options.exchange;
  var messageType = this.options.messageType;
  var routingKey = this.options.routingKey;

  this._start().then(function(){
    that.emit("ready");

    rabbit.request(exchange.name, {
      routingKey: routingKey,
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
