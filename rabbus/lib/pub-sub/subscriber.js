var Events = require("events");
var util = require("util");
var when = require("when");

var Consumer = require("../consumer");
var defaults = require("./defaults");

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
