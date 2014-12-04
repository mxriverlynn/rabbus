var Events = require("events");
var util = require("util");
var when = require("when");
var _ = require("underscore");

// Receiver
// --------

function Receiver(rabbit, options){
  this.rabbit = rabbit;
  this.queue = options.queue;
  this.exchange = options.exchange;
  this.messageType = options.messageType;
  this.autoDelete = !!options.autoDelete;

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
  var autoDelete = this.autoDelete;

  this._startPromise = when.promise(function(resolve, reject){

    var exP = rabbit.addExchange(exchange, "direct", {
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
  var queue = this.queue;
  var messageType = this.messageType;

  this._start().then(function(){

    console.log("receiving from", queue, messageType);
    that.emit("ready");
    that.handler = rabbit.handle(messageType, function(msg){

      function rejectMessage(){
        that.emit("nack");
        msg.nack();
      }

      function handleMessage(){
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
      }

      var msgHasCorrId = (!!msg.properties.correlationId);
      var corrIdMatches = (msg.properties.correlationId === options.correlationId);

      if (msgHasCorrId) {
        // receiving for correlationId. does it match?
        if (corrIdMatches) {
          // yes, it matches so handle it
          handleMessage();
        } else {
          // no, it doesn't match. reject it.
          rejectMessage();
        }
      } else {
        // not receiveing for a correlationId,
        // go ahead and handle it
        handleMessage();
      }
    });

    rabbit.startSubscription(queue);

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
