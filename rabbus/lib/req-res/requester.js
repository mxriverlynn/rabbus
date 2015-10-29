var util = require("util");

var defaults = require("./defaults");
var Producer = require("../producer");

// Base Requester
// -----------

function Requester(rabbit, options){
  Producer.call(this, rabbit, options, defaults);
}

util.inherits(Requester, Producer);

// Exports
// -------

module.exports = Requester;
