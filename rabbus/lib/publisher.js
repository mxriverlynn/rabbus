var Events = require("events");
var util = require("util");
var when = require("when");

// Base Publisher
// --------------

function Publisher(rabbit, options){
  this.rabbit = rabbit;
  this.exchange = options.exchange;
  this.messageType = options.messageType;
  this.autoDelete = !!options.autoDelete;
}

util.inherits(Publisher, Events.EventEmitter);

// Publisher Instance Members
// ------------------------

Publisher.prototype._start = function(){
  if (this._startPromise){
    return this._startPromise;
  }

  this._startPromise = this.rabbit.addExchange(this.exchange, "fanout", {
    durable: true,
    persistent: true,
    autoDelete: this.autoDelete
  });

  return this._startPromise;
};

Publisher.prototype.publish = function(data, done){
  var that = this;
  var rabbit = this.rabbit;
  var exchange = this.exchange;
  var messageType = this.messageType;

  this._start().then(function(){

    console.log("sending message to", exchange);
    rabbit.publish(exchange, {
      type: messageType,
      body: data
    }).then(function(){
      if (done){ done(); }
    }).then(null, function(err){
      that.emitError(err);
    });
      
  }).then(null, function(err){
    that.emitError(err);
  });
};

Publisher.prototype.emitError = function(err){
  this.emit("error", err);
};

Publisher.prototype.stop = function(){
  this.removeAllListeners();
};

// Exports
// -------

module.exports = Publisher;
