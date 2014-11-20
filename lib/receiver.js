var Events = require("events");
var util = require("util");
var when = require("when");

// Receiver
// --------

function Receiver(rabbit, options){
  this.rabbit = rabbit;
  this.queue = options.queue;
  this.exchange = options.exchange;
  this.messageType = options.messageType;

  var key = options.routingKey || "default";
  this.routingKey = [].concat(key);
}

util.inherits(Receiver, Events.EventEmitter);

// Instance Methods
// ----------------

Receiver.prototype._start = function(){
  if (this._startPromise){
    return this._startPromise;
  }

  var that = this;
  var rabbit = this.rabbit;
  var exchange = this.exchange;
  var queue = this.queue;
  var routingKey = this.routingKey;

  this._startPromise = when.promise(function(resolve, reject){

    var exP = rabbit.addExchange(exchange, "direct", {
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

      rabbit
        .bindQueue(exchange, queue, routingKey)
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

Receiver.prototype.receive = function(cb){
  var that = this;
  var rabbit = this.rabbit;
  var queue = this.queue;
  var messageType = this.messageType;

  this._start().then(function(){
    console.log("receiving from", queue, messageType);
    that.emit("ready");

    rabbit.handle(messageType, function(msg){
      function done(){
        msg.ack();
      }
      cb(msg.body, done);
    });
  }).then(null, function(err){
    that.emitError(err);
  });
};

Receiver.prototype.emitError = function(err){
  this.emit("error", err);
};

Receiver.prototype.stop = function(){
  this.removeAllListeners();
};

// Exports
// -------

module.exports = Receiver;
