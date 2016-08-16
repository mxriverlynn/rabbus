var util = require("util");

var defaults = require("./defaults");
var Producer = require("../producer");

// Base Publisher
// --------------

function Publisher(rabbit, options){
  Producer.call(this, rabbit, options, {
    exchange: defaults.exchange
  });
}

util.inherits(Publisher, Producer);

// Exports
// -------

module.exports = Publisher;
