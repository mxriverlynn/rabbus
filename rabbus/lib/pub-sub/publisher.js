var Events = require("events");
var util = require("util");

var defaults = require("./defaults");
var Producer = require("../producer");

// Base Publisher
// --------------

function Publisher(rabbit, options){
  Producer.call(this, rabbit, options, defaults);
}

util.inherits(Publisher, Producer);

// Exports
// -------

module.exports = Publisher;
