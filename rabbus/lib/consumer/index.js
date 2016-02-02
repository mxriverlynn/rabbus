var util = require("util");
var EventEmitter = require("events").EventEmitter;

var Actions = require("./actions");
var logger = require("../logging")("rabbus.consumer");
var optionParser = require("../optionParser");
var MiddlewareBuilder = require("../middlewareBuilder");

// Consumer
// --------

function Consumer(rabbit, options, defaults){
  EventEmitter.call(this);

  this.rabbit = rabbit;
  this.options = optionParser.parse(options, defaults);

  this.middlewareBuilder = new MiddlewareBuilder(["msg", "props", "actions"]);
}

util.inherits(Consumer, EventEmitter);

// API
// ---

Consumer.prototype.use = function(fn){
  this.middlewareBuilder.use(fn);
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

  this._start().then(() => {
    this.emit("ready");

    var middleware = this.middlewareBuilder.build((msg, properties, actions, next) => {
      try {
        cb(msg, properties, actions, next);
      } catch(err) {
        next(err);
      }
    });

    this.subscription = rabbit.handle(messageType, (message) => {
      var actions = new Actions(message);
      var body = message.body;
      var properties = message.properties;

      middleware(body, properties, actions);
    });

    rabbit.startSubscription(queue);

    logger.info("Listening To Queue", queue);
  }).then(null, (err) => {
    this.emitError(err);
  });
};

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
