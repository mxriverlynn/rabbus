var util = require("util");

var defaults = require("./defaults");
var Producer = require("../producer");

// Base Sender
// --------------

function Sender(rabbit, options){
  Producer.call(this, rabbit, options, {
    exchange: defaults.exchange
  });
}

util.inherits(Sender, Producer);

// Sender Instance Members
// ------------------------

Sender.prototype.send = Producer.prototype.publish;

// Exports
// -------

module.exports = Sender;
