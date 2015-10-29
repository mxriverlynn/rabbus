var util = require("util");

var defaults = require("./defaults");
var Consumer = require("../consumer");

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
