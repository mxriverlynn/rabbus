var util = require("util");
var events = require("events");

// Constructor
// -----------

function ProducerActions(){
  events.call(this);
}

util.inherits(ProducerActions, events);

// Action API
// ----------

ProducerActions.prototype.next = function(){
  this.emit("next");
};

ProducerActions.prototype.error = function(err){
  this.emit("error", err);
};

// Exports
// -------

module.exports = ProducerActions;
