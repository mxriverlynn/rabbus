function Actions(config, message){
  this.config = config;
  this.message = message;
}

Actions.prototype.next = function(){
  this.config.emit("next");
};

Actions.prototype.ack = function(){
  this.message.ack();
  this.config.emit("ack");
};

Actions.prototype.nack = function(){
  this.message.nack();
  this.config.emit("nack");
};

Actions.prototype.reject = function(){
  this.message.reject();
  this.config.emit("reject");
};

Actions.prototype.reply = function(response){
  this.message.reply(response);
  this.config.emit("reply", response);
};

module.exports = Actions;
