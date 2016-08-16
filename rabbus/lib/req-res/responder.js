var util = require("util");

var defaults = require("./defaults");
var Consumer = require("../consumer");

// Responder
// --------

function Responder(rabbit, options){
  Consumer.call(this, rabbit, options, defaults);
}

util.inherits(Responder, Consumer);

// Instance Methods
// ----------------

Responder.prototype.respond = Consumer.prototype.consume;
Responder.prototype.handle = Consumer.prototype.consume;

// Exports
// -------

module.exports = Responder;
