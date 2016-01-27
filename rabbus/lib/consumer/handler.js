var Actions = require("./actions");

// Constructor
// -----------

function Handler(middleware){
  this.handle = this.handle.bind(this);
  this.middleware = middleware;
}

// API
// ---

Handler.prototype.handle = function(message){
  var actions = new Actions(message);
  var body = message.body;
  var properties = message.properties;

  this.middleware.process(body, properties, actions);
};

// Exports
// -------

module.exports = Handler;
