var util = require("util");
var events = require("events");

// Constructor
// -----------

function ConsumerActions(message){
  events.call(this);
  this.message = message;
}

util.inherits(ConsumerActions, events);

// Action API
// ----------

ConsumerActions.prototype.next = function(){
  this.emit("next");
};

ConsumerActions.prototype.ack = function(){
  this.message.ack();
  this.emit("ack");
};

ConsumerActions.prototype.nack = function(){
  this.message.nack();
  this.emit("nack");
};

ConsumerActions.prototype.reject = function(){
  this.message.reject();
  this.emit("reject");
};

ConsumerActions.prototype.reply = function(response){
  this.message.reply(response);
  this.emit("reply", response);
};

ConsumerActions.prototype.error = function(err){
  this.emit("error", err);
};

// Exports
// -------

module.exports = ConsumerActions;
