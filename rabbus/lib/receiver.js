var Events = require("events");
var util = require("util");
var when = require("when");
var _ = require("underscore");
var correlationId = require("./correlationId");

// Receiver
// --------

function Receiver(rabbit, options){
  this.rabbit = rabbit;
  this.queue = options.queue;
  this.exchange = options.exchange;
  this.messageType = options.messageType;
  this.autoDelete = !!options.autoDelete;
  this.limit = options.limit;
  this.noBatch = !!options.noBatch;

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
  var noBatch = this.noBatch;
  var limit = this.limit;

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

    var qP = rabbit.addQueue(queue, queueOptions);

    var exP = rabbit.addExchange(exchange, "direct", {
      durable: true,
      persistent: true,
      autoDelete: autoDelete
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
  var noBatch = this.noBatch;

  this._start().then(function(){

    console.log("receiving from", queue, messageType);
    that.emit("ready");
    that.handler = rabbit.handle(messageType, function(msg){
      if (msg._Rabbus_Handled) { return; }

      function rejectMessage(){
        that.emit("nack");
        msg.nack();
      }

      function handleMessage(){
        msg._Rabbus_Handled = true;

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

      var msgCorrId = msg.properties.correlationId;
      var expectedCorrId = options.correlationId;
      correlationId.resolve(expectedCorrId, msgCorrId, function(result){
        if (result.success){
          handleMessage();
        } else {
          rejectMessage();
        }
      });

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
