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
  var actions = new Actions();
  var headers = {};

  this.middleware(message, headers, actions);
};

// Exports
// -------

module.exports = Handler;
