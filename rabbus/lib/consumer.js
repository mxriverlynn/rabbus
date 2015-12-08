var util = require("util");
var when = require("when");
var EventEmitter = require("events").EventEmitter;

var logger = require("./logging")("rabbus.consumer");
var optionParser = require("./optionParser");
var Shire = require("./shire");

// Consumer
// --------

function Consumer(rabbit, options, defaults){
  EventEmitter.call(this);

  this.rabbit = rabbit;
  this.options = optionParser.parse(options, defaults);
  this.middleware = new Shire.Consumer();
}

util.inherits(Consumer, EventEmitter);

// API
// ---

Consumer.prototype.use = function(fn){
  this.middleware.add(fn);
};

Consumer.prototype.emitError = function(err){
  this.emit("error", err);
};

Consumer.prototype.stop = function(){
  logger.info("Stopping Consumer For '" + this.options.queueOptions.name + "'");
  this.removeAllListeners();
  if (this.subscription) {
    this.subscription.remove();
    this.subscription = null;
  }
};

Consumer.prototype.consume = consumer(function(actions){
  actions.ack();
});
  
Consumer.prototype.handle = consumer(function(actions, response){
  actions.reply(response);
});
  
// Private methods
// ---------------

Consumer.prototype._start = function(){
  if (this._startPromise){
    return this._startPromise;
  }

  var that = this;
  var rabbit = this.rabbit;
  var options = this.options;
  var queueOptions = options.queue;
  var exchangeOptions = options.exchange;
  var routingKey = options.routingKey;

  this._startPromise = when.promise(function(resolve, reject){

    logger.debug("Declaring Queue '" + queueOptions.name + "'");
    logger.debug("With Queue Options");
    logger.debug(queueOptions);

    var qP = rabbit.addQueue(queueOptions.name, queueOptions);

    logger.debug("Declaring Exchange '" + exchangeOptions.name + "'");
    logger.debug("With Exchange Options");
    logger.debug(exchangeOptions);

    var exP = rabbit.addExchange(
      exchangeOptions.name, 
      exchangeOptions.type, 
      exchangeOptions
    );

    when.all([exP, qP]).then(function(){

      logger.debug("Add Binding", exchangeOptions.name, queueOptions.name, routingKey);

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
  
  });

  return this._startPromise;
};

// private helper methods
// ----------------------

function consumer(consumerAction){
  
  return function(cb){
    var that = this;
    var rabbit = this.rabbit;
    var queue = this.options.queue.name;
    var messageType = this.options.messageType;
    var middleware = this.middleware;

    this._start().then(function(){
      that.emit("ready");

      var handler = middleware.prepare(function(config){
        config.on("ack", that.emit.bind(that, "ack"));
        config.on("nack", that.emit.bind(that, "nack"));
        config.on("reject", that.emit.bind(that, "reject"));
        config.on("reply", that.emit.bind(that, "reply"));
        config.on("error", that.emit.bind(that, "error"));

        config.last(function(msg, properties, actions){
          var consumed = consumerAction.bind(that, actions);
          try {
            cb(msg, consumed);
          } catch(ex) {
            actions.nack();
            that.emitError(ex);
          }
        });
      });

      that.subscription = rabbit.handle(messageType, handler);
      rabbit.startSubscription(queue);

      logger.info("Listening To Queue", queue);

    }).then(null, function(err){
      that.emitError(err);
    });
  };
}

// Exports
// -------

module.exports = Consumer;
