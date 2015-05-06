var Queue = require("../queue");
var Config = require("../config");
var Handler = require("./handler");

// Constructor Function
// --------------------

function Consumer(){
  this.middleware = new Queue();
}

// Public API
// ----------

Consumer.prototype.add = function(middleware){
  this.middleware.add(middleware);
};

Consumer.prototype.prepare = function(cb){
  var config = new Config();
  cb(config);

  var middleware = this.middleware.clone();
  if (config.finalFn){
    middleware.add(config.finalFn);
  }

  var handler = new Handler(config, middleware);
  return handler.handle;
};

// exports
// -------

module.exports = Consumer;
