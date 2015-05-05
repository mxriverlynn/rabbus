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

Responder.prototype._start = function(){
  var rabbit = this.rabbit;
  var exchange = this.options.exchange;
  var queue = this.options.queue;
  var routingKey = this.options.routingKey;

  if (this._startPromise){
    return this._startPromise;
  }

  this._startPromise = when.promise(function(resolve, reject){
    var qP = rabbit.addQueue(queue.name, queue);
    var exP = rabbit.addExchange(exchange.name, exchange.type, exchange);

    when.all([qP, exP]).then(function(){
      rabbit
        .bindQueue(exchange.name, queue.name, routingKey)
        .then(function(){
          resolve();
        })
        .then(null, function(err){
          reject(err);
        });

    }).then(null, function(err){
      reject(err);
    });
  });

  return this._startPromise;
};

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

    rabbit.handle(messageType, handler);
    rabbit.startSubscription(queue.name);

  }).then(null, function(err){
    that.emitError(err);
  });
};

Responder.prototype.emitError = function(err){
  this.emit("error", err);
};

Responder.prototype.stop = function(){
  this.removeAllListeners();
  if (this.handler) {
    this.handler.remove();
    this.handler = null;
  }
};

// Exports
// -------

module.exports = Responder;

