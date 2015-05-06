var Actions = require("./actions");

// Constructor
// -----------

function Handler(config, queue, actions){
  this.handle = this.handle.bind(this);
  this.config = config;
  this.queue = queue;
  this.actions = actions;
}

// API
// ---

Handler.prototype.handle = function(message){
  var config = this.config;
  var actions = this.actions;
  var headers = {};

  function processMiddlewareFunction(queue, message, headers){
    var fn = queue.next;
    if (!fn){ 
      config.removeAllListeners();
      config.emit("complete");
      return; 
    }

    config.on("next", function(){
      processMiddlewareFunction(queue, message, headers);
    });

    var actions = new Actions(config, message);
    fn.call(null, message, headers, actions);
  }

  processMiddlewareFunction(this.queue, message, headers);
};

// Exports
// -------

module.exports = Handler;
