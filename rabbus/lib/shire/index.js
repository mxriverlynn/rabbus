var Queue = require("./queue");
var Config = require("./config");

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
  var config = new Config(this.middleware);
  cb(config);
  return config.handle;
};

// Exports
// -------

module.exports = Shire;
