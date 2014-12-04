var Events = require("events");
var util = require("util");
var when = require("when");

// Subscriber
// --------

function Subscriber(rabbit, options){
  this.rabbit = rabbit;
  this.queue = options.queue;
  this.exchange = options.exchange;
  this.messageType = options.messageType;
  this.autoDelete = !!options.autoDelete;
}

util.inherits(Subscriber, Events.EventEmitter);

// Instance Methods
// ----------------

Subscriber.prototype._start = function(){
  if (this._startPromise){
    return this._startPromise;
  }

  var that = this;
  var rabbit = this.rabbit;
  var queue = this.queue;
  var exchange = this.exchange;
  var autoDelete = this.autoDelete;

  this._startPromise = when.promise(function(resolve, reject){
    console.log("setting up exchange and queue for subscriber", exchange, queue);

    var exP = rabbit.addExchange(exchange, "fanout", {
      durable: true,
      persistent: true,
      autoDelete: autoDelete
    });

    var qP = rabbit.addQueue(queue, {
      durable: true,
      autoDelete: autoDelete,
      subscribe: false
    });

    when.all([exP, qP]).then(function(){

      that.rabbit
        .bindQueue(exchange, queue)
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

Subscriber.prototype.subscribe = function(cb){
  var that = this;
  var rabbit = this.rabbit;
  var queue = this.queue;
  var messageType = this.messageType;

  this._start().then(function(){

    that.emit("ready");
    rabbit.handle(messageType, function(msg){
      try {
        cb(msg.body);
        msg.ack();
        that.emit("ack");
      } catch(ex) {
        msg.nack();
        that.emit("nack");
        that.emitError(ex);
      }
    });
    rabbit.startSubscription(queue);

  }).then(null, function(err){
    that.emitError(err);
  });
};

Subscriber.prototype.emitError = function(err){
  this.emit("error", err);
};

Subscriber.prototype.stop = function(){
  this.removeAllListeners();
  if (this.handler) {
    this.handler.remove();
    this.handler = null;
  }
};

// Exports
// -------

module.exports = Subscriber;
