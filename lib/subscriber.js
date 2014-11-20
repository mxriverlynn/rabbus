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

  this._startPromise = when.promise(function(resolve, reject){
    console.log("setting up exchange and queue for subscriber", exchange, queue);

    var exP = rabbit.addExchange(exchange, "fanout", {
      durable: true,
      persistent: true,
      autoDelete: false
    });

    var qP = rabbit.addQueue(queue, {
      durable: true,
      autoDelete: false,
      subscribe: true
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
      cb(msg.body);
      msg.ack();
    });
  }).then(null, function(err){
    that.emitError(err);
  });
};

Subscriber.prototype.emitError = function(err){
  that.emit("error", err);
};

Subscriber.prototype.stop = function(){
  this.removeAllListeners();
};

// Exports
// -------

module.exports = Subscriber;
