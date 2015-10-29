var Events = require("events");
var util = require("util");
var when = require("when");
var _ = require("underscore");

var Consumer = require("../consumer");
var defaults = require("./defaults");

// Receiver
// --------

function Receiver(rabbit, options){
  Consumer.call(this, rabbit, options, defaults);
}

util.inherits(Receiver, Consumer);

// Instance Methods
// ----------------

Receiver.prototype.receive = Consumer.prototype.consume;

// Exports
// -------

module.exports = Receiver;
