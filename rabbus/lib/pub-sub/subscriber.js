var util = require("util");
var _ = require("underscore");
var uuid = require("uuid");

var defaults = require("./defaults");
var Consumer = require("../consumer");

// Subscriber
// --------

function Subscriber(rabbit, options){
  if (_.isObject(options.queue)){
    options.queue.name = getUniqueName(options.queue.name);
  } else {
    options.queue = getUniqueName(options.queue);
  }

  Consumer.call(this, rabbit, options, defaults);
}

util.inherits(Subscriber, Consumer);

// Instance Methods
// ----------------

Subscriber.prototype.subscribe = Consumer.prototype.consume;

// Helpers
// -------
function getUniqueName(queueName){
  var id = uuid.v4();
  var name = util.format('%s.sub.queue.%s', queueName, id);
  return name;
}
  
// Exports
// -------

module.exports = Subscriber;
