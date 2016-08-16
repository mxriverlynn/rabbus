var util = require("util");
var EventEmitter = require("events").EventEmitter;

var Actions = require("./actions");
var logger = require("../logging")("rabbus.consumer");
var MiddlewareBuilder = require("../middlewareBuilder");
var Topology = require("../topology");

// Consumer
// --------

function Consumer(rabbit, options, defaults){
  EventEmitter.call(this);
  this.rabbit = rabbit;
  this.options = options;
  this.defaults = defaults;
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
  var queueName = "";
  if (this.topology){ 
    queueName = this.topology.queue.name; 
    this.topology = undefined;
  }
  logger.info("Stopping Consumer For '" + queueName + "'");

  this.removeAllListeners();
  if (this.subscription) {
    this.subscription.remove();
    this.subscription = null;
  }
};

Consumer.prototype.consume = function(cb){
  this._verifyTopology((err, topology) => {
    if (err) { return this.emitError(err); }

    var rabbit = this.rabbit;
    var queue = topology.queue.name;
    var messageType = topology.messageType || topology.routingKey;

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

// Helpers
// -------

Consumer.prototype._verifyTopology = function(cb){
  if (this.topology) { return this.topology; }
  Topology.verify(this.rabbit, this.options, this.defaults, (err, topology) => {
    if (err) { return cb(err); }
    this.topology = topology;
    return cb(undefined, topology);
  });
};

// Exports
// -------

module.exports = Consumer;
