var Events = require("events");
var util = require("util");
var when = require("when");

var defaults = require("./defaults");
var Producer = require("../producer");

// Base Sender
// --------------

function Sender(rabbit, options){
  Producer.call(this, rabbit, options, defaults);
}

util.inherits(Sender, Producer);

// Sender Instance Members
// ------------------------

Sender.prototype.send = function(data, done){
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

// Exports
// -------

module.exports = Sender;
