var util = require("util");
var when = require("when");
var EventEmitter = require("events").EventEmitter;

var optionParser = require("./optionParser");
var Shire = require("./shire");

// Consumer
// --------

function Consumer(rabbit, options, defaults){
  EventEmitter.call(this);

  this.rabbit = rabbit;
  this.options = optionParser.parse(options, defaults);
  this.middleware = new Shire.Consumer();
}

util.inherits(Consumer, EventEmitter);

// API
// ---

Consumer.prototype.use = function(fn){
  this.middleware.add(fn);
};

Consumer.prototype.emitError = function(err){
  this.emit("error", err);
};

Consumer.prototype.stop = function(){
  this.removeAllListeners();
  if (this.subscription) {
    this.subscription.remove();
    this.subscription = null;
  }
};

// Exports
// -------

module.exports = Consumer;
