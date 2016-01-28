// Actions
// -----------

function ConsumerActions(message){
  this.message = message;
}

// Methods
// -------

ConsumerActions.prototype.ack = function(){
  this.message.ack();
};

ConsumerActions.prototype.nack = function(){
  this.message.nack();
};

ConsumerActions.prototype.reject = function(){
  this.message.reject();
};

ConsumerActions.prototype.reply = function(response){
  this.message.reply(response);
};

// Exports
// -------

module.exports = ConsumerActions;
