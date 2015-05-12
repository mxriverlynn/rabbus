// Constructor
// -----------

function ConsumerActions(config, message){
  this.config = config;
  this.message = message;
}

// Action API
// ----------

ConsumerActions.prototype.next = function(){
  this.config.emit("next");
};

ConsumerActions.prototype.ack = function(){
  this.message.ack();
  this.config.emit("ack");
};

ConsumerActions.prototype.nack = function(){
  this.message.nack();
  this.config.emit("nack");
};

ConsumerActions.prototype.reject = function(){
  this.message.reject();
  this.config.emit("reject");
};

ConsumerActions.prototype.reply = function(response){
  this.message.reply(response);
  this.config.emit("reply", response);
};

ConsumerActions.prototype.error = function(err){
  this.config.emit("error", err);
};

// Exports
// -------

module.exports = ConsumerActions;
