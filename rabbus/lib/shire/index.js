var Queue = require("./queue");
var Config = require("./config");
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
  var config = new Config();
  cb(config);

  var middleware = this.middleware.clone();
  var handler = new Handler(config, middleware);

  return handler.handle;
};

// Exports
// -------

module.exports = Shire;
