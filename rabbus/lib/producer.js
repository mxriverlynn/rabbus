var EventEmitter = require("events").EventEmitter;
var util = require("util");
var _ = require("underscore");

var logger = require("./logging")("rabbus.producer");
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

Producer.prototype.publish = producer(function(message, properties, done){
  this._publish(message, properties, done);
});
  
  
Producer.prototype.request = producer(function(message, properties, cb){
  this._request(message, properties, cb);
});

// Private Members
// ---------------

Producer.prototype._start = function(){
  if (this._startPromise){ return this._startPromise; }
  var exchange = this.options.exchange;

  logger.info("Declaring exchange", exchange.name);
  logger.debug("With Exchange Options", exchange);

  this._startPromise = this.rabbit.addExchange(exchange.name, exchange.type, exchange);

  return this._startPromise;
};

Producer.prototype._publish = function(msg, properties, done){
  var that = this;
  var rabbit = this.rabbit;
  var exchange = this.options.exchange;

  properties = _.extend({}, properties, {
    body: msg
  });

  rabbit
    .publish(exchange.name, properties)
    .then(function(){
      if (done){ done(); }
    })
    .then(null, function(err){
      that.emitError(err);
    });
};

Producer.prototype._request = function(msg, properties, cb){
  var that = this;
  var rabbit = this.rabbit;
  var exchange = this.options.exchange;

  properties = _.extend({}, properties, {
    body: msg
  });

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

// private helper methods
// ----------------------

function producer(publishMethod){

  return function(data, properties){
    var done;
    
    if (!properties) { properties = {}; }

    if (_.isFunction(properties)){
      done = properties;
      properties = {};
    } else if (_.isObject(properties)) {
      done = properties.onComplete;
      properties.onComplete = undefined;
    }

    var that = this;
    var middleware = this.middleware;

    this._start().then(function(){
      that.emit("ready");

      var handler = middleware.prepare(function(config){
        config.last(function(message, middlewareHeaders){

          var headers = _.extend({}, middlewareHeaders, properties.headers);
          
          var props = _.extend({}, properties, {
            routingKey: that.options.routingKey,
            type: that.options.messageType,
            headers: headers
          });

          logger.info("Publishing Message, Type: '" + that.options.messageType + "', With Routing Key '" + that.options.routingKey + "'");
          logger.debug("With Properties");
          logger.debug(props);

          publishMethod.call(that, message, props, done);
        });
      });

      handler(data);
        
    }).then(null, function(err){
      that.emitError(err);
    });
  };

}

// Exports
// -------

module.exports = Producer;
