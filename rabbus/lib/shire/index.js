var Queue = require("./queue");
var Handler = require("./handler");

// Constructor Function
// --------------------

function Shire(){
  this.middleware = new Queue();
}

// Public API
// ----------

Shire.prototype.add = function(middleware){
  this.middleware.push(middleware);
};

Shire.prototype.prepare = function(cb){
  var handler = new Handler(this.middleware);
  cb(handler);
  return handler.handle;
};

// Exports
// -------

module.exports = Shire;
