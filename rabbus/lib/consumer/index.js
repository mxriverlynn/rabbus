var util = require("util");
var EventEmitter = require("events").EventEmitter;

var Actions = require("./actions");
var logger = require("../logging")("rabbus.consumer");
var optionParser = require("../optionParser");
var MiddlewareBuilder = require("../middlewareBuilder");
var Topology = require("../topology");

// Consumer
// --------

function Consumer(rabbit, options, defaults){
  EventEmitter.call(this);

  this.rabbit = rabbit;
  this.options = options;
  this.topology = new Topology(rabbit, options, defaults);

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
  logger.info("Stopping Consumer For '" + this.topology.queue.name + "'");
  this.removeAllListeners();
  if (this.subscription) {
    this.subscription.remove();
    this.subscription = null;
  }
};

Consumer.prototype.consume = function(cb){
  var rabbit = this.rabbit;
  var queue = this.topology.queue.name;
  var messageType = this.options.messageType || this.options.routingKey;

  this.topology.execute((err) => {
    if (err) { return this.emitError(err); }

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
  });
};

// Exports
// -------

module.exports = Consumer;
