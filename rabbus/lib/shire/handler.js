var util = require("util");
var EventEmitter = require("events").EventEmitter;

// Constructor
// -----------

function Handler(middleware){
  EventEmitter.call(this);
  this.handle = this.handle.bind(this);

  this.middleware = middleware;
}

util.inherits(Handler, EventEmitter);

// API
// ---

Handler.prototype.handle = function(message){
  var handler = this;

  function callHandler(queue, message){
    debugger;
    var fn = queue.next;
    if (!fn){ 
      handler.removeAllListeners();
      return; 
    }

    var body = message.body;
    var properties = message.properties;
    handler.on("next", function(){
      debugger;
      callHandler(queue, message);
    });

    fn.call(null, body, properties, handler);
  }

  var middleware = [].concat(this.middleware);
  if (this.finalFn){
    middleware.push(this.finalFn);
  }

  callHandler(middleware, message);
};

Handler.prototype.last = function(finalFn){
  this.finalFn = finalFn;
};

Handler.prototype.next = function(){
  this.emit("next");
};

Handler.prototype.ack = function(){
  this.message.ack();
  this.emit("ack");
};

Handler.prototype.nack = function(){
  this.message.nack();
  this.emit("nack");
};

Handler.prototype.reject = function(){
  this.message.reject();
  this.emit("reject");
};

// Exports
// -------

module.exports = Handler;
