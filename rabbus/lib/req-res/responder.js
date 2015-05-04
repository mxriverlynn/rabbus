var Events = require("events");
var util = require("util");
var when = require("when");

var defaults = require("./defaults");
var optionParser = require("../optionParser");

// Responder
// --------

function Responder(rabbit, options){
  this.rabbit = rabbit;
  this.options = optionParser.parse(options, defaults);
}

util.inherits(Responder, Events.EventEmitter);

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

  this._start().then(function(){

    that.emit("ready");
    console.log("listening for", messageType, "on", queue);

    that.handler = rabbit.handle(messageType, function(message){
      function respond(response){
        message.reply(response);
        that.emit("reply", response);
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

