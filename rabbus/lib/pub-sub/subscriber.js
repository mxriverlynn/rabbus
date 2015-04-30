var Events = require("events");
var util = require("util");
var when = require("when");

var defaults = require("./defaults");
var optionParser = require("../optionParser");

// Subscriber
// --------

function Subscriber(rabbit, options){
  this.rabbit = rabbit;
  this.options = options;
  this.options = optionParser.parse(options, defaults);
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
  var options = this.options;
  var queueOptions = options.queue;
  var exchangeOptions = options.exchange;

  this._startPromise = when.promise(function(resolve, reject){

    var qP = rabbit.addQueue(queueOptions.name, queueOptions);
    var exP = rabbit.addExchange(
      exchangeOptions.name, 
      exchangeOptions.type, 
      exchangeOptions
    );

    when.all([exP, qP]).then(function(){

      rabbit
        .bindQueue(exchangeOptions.name, queueOptions.name, options.routingKeys)
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
