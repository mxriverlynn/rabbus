var Events = require("events");
var util = require("util");
var when = require("when");

var Consumer = require("../consumer");
var defaults = require("./defaults");

// Responder
// --------

function Responder(rabbit, options){
  Consumer.call(this, rabbit, options, defaults);
}

util.inherits(Responder, Consumer);

// Instance Methods
// ----------------

Responder.prototype.handle = function(cb){
  var that = this;
  var rabbit = this.rabbit;
  var queue = this.options.queue;
  var messageType = this.options.messageType;
  var middleware = this.middleware;

  this._start().then(function(){

    that.emit("ready");
    console.log("listening for", messageType, "on", queue);

    var handler = middleware.prepare(function(config){
      config.on("ack", that.emit.bind(that, "ack"));
      config.on("nack", that.emit.bind(that, "nack"));
      config.on("reject", that.emit.bind(that, "reject"));
      config.on("reply", that.emit.bind(that, "reply"));
      config.on("error", that.emit.bind(that, "error"));

      config.last(function(msg, properties, actions){
        function respond(response){
          actions.reply(response);
        }

        try {
          cb(msg, respond);
        } catch(ex) {
          actions.nack();
          that.emitError(ex);
        }
      });
    });

    that.subscription = rabbit.handle(messageType, handler);
    rabbit.startSubscription(queue.name);

  }).then(null, function(err){
    that.emitError(err);
  });
};

// Exports
// -------

module.exports = Responder;

