// Constructor
// -----------

function Handler(config, queue, message){
  this.run = this.run.bind(this);

  this.config = config;
  this.queue = queue;
  this.message = message;
}

// API
// ---

Handler.prototype.run = function(){
  var handler = this;
  var config = this.config;

  function callConfig(queue, message){
    var fn = queue.next;
    if (!fn){ 
      config.removeAllListeners();
      config.emit("complete");
      return; 
    }

    var body = message.body;
    var properties = message.properties;
    config.on("next", function(){
      callConfig(queue, message);
    });

    fn.call(null, body, properties, handler);
  }

  if (this.config.finalFn){
    this.queue.add(this.config.finalFn);
  }

  callConfig(this.queue, this.message);
};

Handler.prototype.next = function(){
  this.config.emit("next");
};

Handler.prototype.ack = function(){
  this.message.ack();
  this.config.emit("ack");
};

Handler.prototype.nack = function(){
  this.message.nack();
  this.config.emit("nack");
};

Handler.prototype.reject = function(){
  this.message.reject();
  this.config.emit("reject");
};

// Exports
// -------

module.exports = Handler;
