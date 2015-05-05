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
  this.middleware = new Shire();
}

util.inherits(Consumer, EventEmitter);

// API
// ---

Consumer.prototype.use = function(fn){
  this.middleware.add(fn);
};

// Exports
// -------

module.exports = Consumer;
