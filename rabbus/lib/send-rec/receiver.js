var Events = require("events");
var util = require("util");
var when = require("when");
var _ = require("underscore");

var defaults = require("./defaults");
var optionParser = require("../optionParser");

// Receiver
// --------

function Receiver(rabbit, options){
  this.rabbit = rabbit;
  this.options = optionParser.parse(options, defaults);
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
  var exchangeOptions = this.options.exchange;
  var queueOptions = this.options.queue;
  var routingKey = this.options.routingKey;
  var autoDelete = queueOptions.autoDelete;
  var noBatch = queueOptions.noBatch;
  var limit = queueOptions.limit;

  this._startPromise = when.promise(function(resolve, reject){
    var qP = rabbit.addQueue(queueOptions.name, queueOptions);
    var exP = rabbit.addExchange(exchangeOptions.name, exchangeOptions.type, exchangeOptions);

    when.all([exP, qP]).then(function(){

      rabbit
        .bindQueue(exchangeOptions.name, queueOptions.name, routingKey)
        .then(function(){
          resolve();
        })
        .then(null, function(err){
          reject(err);
        });

    }).then(null, function(err){
      reject(err);
    });
  
  }).then(null, function(err){
    that.emitError(err);
  });

  return this._startPromise;
};

Receiver.prototype.receive = function(options, cb){
  if (!cb && _.isFunction(options)) {
    cb = options;
    options = {};
  }

  var that = this;
  var rabbit = this.rabbit;
  var queueOptions = this.options.queue;
  var messageType = this.options.messageType;

  this._start().then(function(){

    console.log("receiving from", queueOptions.name, messageType);
    that.emit("ready");
    that.handler = rabbit.handle(messageType, function(msg){

      function rejectMessage(){
        that.emit("nack");
        msg.nack();
      }

      function done(){
        msg.ack();
        that.emit("ack");
      }

      try {
        cb(msg.body, done);
      } catch(ex) {
        rejectMessage();
        that.emitError(ex);
      }

    });

    rabbit.startSubscription(queueOptions.name);

  }).then(null, function(err){
    that.emitError(err);
  });
};

Receiver.prototype.emitError = function(err){
  this.emit("error", err);
};

Receiver.prototype.stop = function(){
  this.removeAllListeners();
  if (this.handler) {
    this.handler.remove();
    this.handler = null;
  }
};

// Exports
// -------

module.exports = Receiver;
