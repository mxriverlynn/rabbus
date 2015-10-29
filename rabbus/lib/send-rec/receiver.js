var Events = require("events");
var util = require("util");
var when = require("when");
var _ = require("underscore");

var Consumer = require("../consumer");
var defaults = require("./defaults");

// Receiver
// --------

function Receiver(rabbit, options){
  Consumer.call(this, rabbit, options, defaults);
}

util.inherits(Receiver, Consumer);

// Instance Methods
// ----------------

Receiver.prototype.receive = function(cb){
  var that = this;
  var rabbit = this.rabbit;
  var queueOptions = this.options.queue;
  var messageType = this.options.messageType;
  var middleware = this.middleware;

  this._start().then(function(){

    console.log("receiving from", queueOptions.name, messageType);
    that.emit("ready");

    var handler = middleware.prepare(function(config){
      config.on("ack", that.emit.bind(that, "ack"));
      config.on("nack", that.emit.bind(that, "nack"));
      config.on("reject", that.emit.bind(that, "reject"));
      config.on("error", that.emit.bind(that, "error"));

      config.last(function(msg, properties, actions){
        function done(){
          actions.ack();
        }

        try {
          cb(msg, done);
        } catch(ex) {
          actions.nack();
          that.emitError(ex);
        }
      });

    });

    that.subscription = rabbit.handle(messageType, handler);
    rabbit.startSubscription(queueOptions.name);

  }).then(null, function(err){
    that.emitError(err);
  });
};

// Exports
// -------

module.exports = Receiver;
