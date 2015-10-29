var Events = require("events");
var util = require("util");
var when = require("when");

var Consumer = require("../consumer");
var defaults = require("./defaults");

// Subscriber
// --------

function Subscriber(rabbit, options){
  Consumer.call(this, rabbit, options, defaults);
}

util.inherits(Subscriber, Consumer);

// Instance Methods
// ----------------

Subscriber.prototype.subscribe = function(cb){
  var that = this;
  var rabbit = this.rabbit;
  var queue = this.options.queue.name;
  var messageType = this.options.messageType;
  var middleware = this.middleware;

  this._start().then(function(){

    that.emit("ready");

    var handler = middleware.prepare(function(config){
      config.on("ack", that.emit.bind(that, "ack"));
      config.on("nack", that.emit.bind(that, "nack"));
      config.on("reject", that.emit.bind(that, "reject"));
      config.on("error", that.emit.bind(that, "error"));

      config.last(function(msg, properties, actions){
        try {
          cb(msg);
          actions.ack();
        } catch(ex) {
          actions.nack();
          that.emitError(ex);
        }
      }, that);
    });

    that.subscription = rabbit.handle(messageType, handler);
    rabbit.startSubscription(queue);

  }).then(null, function(err){
    that.emitError(err);
  });
};

// Exports
// -------

module.exports = Subscriber;
