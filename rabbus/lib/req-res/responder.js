var Events = require("events");
var util = require("util");
var when = require("when");

var Consumer = require("../consumer");
var defaults = require("./defaults");

// Responder
// --------

function Responder(rabbit, options){
  Consumer.call(this, rabbit, options, defaults);
}

util.inherits(Responder, Consumer);

// Instance Methods
// ----------------

Responder.prototype.respond = Consumer.prototype.handle;

// Exports
// -------

module.exports = Responder;

