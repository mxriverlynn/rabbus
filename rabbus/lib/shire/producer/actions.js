// Constructor
// -----------

function ProducerActions(config, message){
  this.config = config;
  this.message = message;
}

// Action API
// ----------

ProducerActions.prototype.next = function(){
  this.config.emit("next");
};

ProducerActions.prototype.error = function(err){
  this.config.emit("error", err);
};

// Exports
// -------

module.exports = ProducerActions;
