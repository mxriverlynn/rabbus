var Events = require("events");
var util = require("util");
var when = require("when");

var Builders = require("../builders");

// Subscriber
// --------

function Subscriber(rabbit, options){
  this.rabbit = rabbit;
  this.options = options;

  // this.queue = options.queue;
  // this.exchange = options.exchange;
  // this.messageType = options.messageType;
  // this.autoDelete = !!options.autoDelete;
  // this.limit = options.limit;
  // this.noBatch = !!options.noBatch;
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
  var queueName = this.options.queue.name;
  var autoDelete = this.options.queue.autoDelete;
  var exchange = this.options.exchange.name;
  var limit = this.limit;
  var noBatch = this.noBatch;
  var options = this.options;

  this._startPromise = when.promise(function(resolve, reject){
    var queueOptions = {
      durable: true,
      autoDelete: autoDelete,
      subscribe: false,
      noBatch: noBatch
    };

    if (limit) {
      queueOptions.limit = limit;
    }

    var qP = rabbit.addQueue(queueName, queueOptions);

    var exchangeBuilder = new Builders.Exchange(rabbit);
    var exP = exchangeBuilder.build("fanout", options);

    when.all([exP, qP]).then(function(){

      that.rabbit
        .bindQueue(exchange, queueName)
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
  var queue = this.options.queue.name;
  var messageType = this.options.messageType;

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
