var Middleware = require("generic-middleware");
var util = require("util");
var EventEmitter = require("events").EventEmitter;

var logger = require("../logging")("rabbus.consumer");
var optionParser = require("../optionParser");
var Handler = require("./handler");

// Consumer
// --------

function Consumer(rabbit, options, defaults){
  EventEmitter.call(this);

  this.rabbit = rabbit;
  this.options = optionParser.parse(options, defaults);
  this.middleware = new Middleware();
  this.middleware.use((msg, properties, actions, next) => {
    next();
  });
}

util.inherits(Consumer, EventEmitter);

// API
// ---

Consumer.prototype.use = function(fn){
  this.middleware.use(fn);
};

Consumer.prototype.emitError = function(err){
  this.emit("error", err);
};

Consumer.prototype.stop = function(){
  logger.info("Stopping Consumer For '" + this.options.queue.name + "'");
  this.removeAllListeners();
  if (this.subscription) {
    this.subscription.remove();
    this.subscription = null;
  }
};

Consumer.prototype.consume = function(cb){
  var rabbit = this.rabbit;
  var queue = this.options.queue.name;
  var messageType = this.options.messageType;
  var middleware = this.middleware;

  this._start().then(() => {
    this.emit("ready");

    middleware.useAfter(null, (msg, properties, actions, next) => {
      try {
        cb(msg, properties, actions, next);
      } catch(err) {
        next(err);
      }
    });

    var handler = new Handler(this.middleware);
    this.subscription = rabbit.handle(messageType, handler.handle);
    rabbit.startSubscription(queue);

    logger.info("Listening To Queue", queue);

  }).then(null, (err) => {
    this.emitError(err);
  });
};

// Consumer.prototype.handle = consumer(function(actions, response){
//   actions.reply(response);
// });

// Private methods
// ---------------

Consumer.prototype._start = function(){
  if (this._startPromise){
    return this._startPromise;
  }

  var rabbit = this.rabbit;
  var options = this.options;
  var queueOptions = options.queue;
  var exchangeOptions = options.exchange;
  var routingKey = options.routingKey;

  this._startPromise = new Promise(function(resolve, reject){

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

    Promise.all([exP, qP]).then(function(){

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

// Exports
// -------

module.exports = Consumer;
