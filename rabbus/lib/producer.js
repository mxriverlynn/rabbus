var EventEmitter = require("events").EventEmitter;
var util = require("util");

var optionParser = require("./optionParser");
var Shire = require("./shire");

// Base Producer
// -------------

function Producer(rabbit, options, defaults){
  EventEmitter.call(this);

  this.rabbit = rabbit;
  this.options = optionParser.parse(options, defaults);
  this.middleware = new Shire.Producer();
}

util.inherits(Producer, EventEmitter);

// Public API
// ----------

Producer.prototype.use = function(fn){
  this.middleware.add(fn);
};

Producer.prototype.stop = function(){
  this.removeAllListeners();
};

Producer.prototype.publish = function(data, done){
  var that = this;
  var middleware = this.middleware;

  this._start().then(function(){
    that.emit("ready");

    var handler = middleware.prepare(function(config){
      config.last(function(message, headers){
        that._publish(message, headers, done);
      });
    });

    handler(data);
      
  }).then(null, function(err){
    that.emitError(err);
  });
};

Producer.prototype.request = function(data, cb){
  var that = this;
  var middleware = this.middleware;

  this._start().then(function(){
    that.emit("ready");

    var handler = middleware.prepare(function(config){
      config.last(function(message, headers){
        that._request(message, headers, cb);
      });
    });

    handler(data);

  }).then(null, function(err){
    that.emitError(err);
  });
};

// Private Members
// ---------------

Producer.prototype._start = function(){
  if (this._startPromise){ return this._startPromise; }

  var exchange = this.options.exchange;
  this._startPromise = this.rabbit.addExchange(exchange.name, exchange.type, exchange);

  return this._startPromise;
};

Producer.prototype._publish = function(msg, headers, done){
  var that = this;
  var rabbit = this.rabbit;
  var exchange = this.options.exchange;

  var properties = {
    routingKey: this.options.routingKey,
    type: this.options.messageType,
    body: msg,
    headers: headers
  };

  rabbit
    .publish(exchange.name, properties)
    .then(function(){
      if (done){ done(); }
    })
    .then(null, function(err){
      that.emitError(err);
    });
};

Producer.prototype._request = function(msg, headers, cb){
  var that = this;
  var rabbit = this.rabbit;
  var exchange = this.options.exchange;

  var properties = {
    routingKey: this.options.routingKey,
    type: this.options.messageType,
    body: msg,
    headers: headers
  };

  rabbit
    .request(exchange.name, properties)
    .then(function(reply){
      cb(reply.body);
      reply.ack();
    })
    .then(null, function(err){
      that.emitError(err);
    });
};

Producer.prototype.emitError = function(err){
  this.emit("error", err);
};

// Exports
// -------

module.exports = Producer;
