var Events = require("events");
var util = require("util");
var when = require("when");

// Responder
// --------

function Responder(rabbit, options){
  this.rabbit = rabbit;
  this.queue = options.queue;
  this.exchange = options.exchange;
  this.messageType = options.messageType;
  this.limit = options.limit;
  this.autoDelete = !!options.autoDelete;
  this.noBatch = !!options.noBatch;

  var key = options.routingKey || this.messageType;
  this.routingKey = [].concat(key);
}

util.inherits(Responder, Events.EventEmitter);

// Instance Methods
// ----------------

Responder.prototype._start = function(){
  var rabbit = this.rabbit;
  var exchange = this.exchange;
  var queue = this.queue;
  var autoDelete = this.autoDelete;
  var routingKey = this.routingKey;
  var limit = this.limit;
  var noBatch = this.noBatch;

  if (this._startPromise){
    return this._startPromise;
  }

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

    var exP = rabbit.addExchange(exchange, "topic", {
      durable: true,
      persistent: true,
      autoDelete: autoDelete
    });

    when.all([qP, exP]).then(function(){
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

Responder.prototype.handle = function(cb){
  var that = this;
  var rabbit = this.rabbit;
  var queue = this.queue;
  var messageType = this.messageType;

  this._start().then(function(){

    that.emit("ready");
    console.log("listening for", messageType, "on", queue);
    that.handler = rabbit.handle(messageType, function(message){
      function respond(response){
        message.reply(response);
        that.emit("reply");
      }

      function reject(){
        message.nack();
        that.emit("nack");
      }
      var msg = message.body;

      try {
        cb(msg, respond);
      } catch(ex) {
        reject();
        that.emitError(ex);
      }
    });
    rabbit.startSubscription(queue);

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

