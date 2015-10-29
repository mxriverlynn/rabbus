var util = require("util");

var defaults = require("./defaults");
var Consumer = require("../consumer");

// Subscriber
// --------

function Subscriber(rabbit, options){
  Consumer.call(this, rabbit, options, defaults);
}

util.inherits(Subscriber, Consumer);

// Instance Methods
// ----------------

Subscriber.prototype.subscribe = Consumer.prototype.consume;
  
// Exports
// -------

module.exports = Subscriber;
