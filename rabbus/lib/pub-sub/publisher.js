var Events = require("events");
var util = require("util");
var when = require("when");

var defaults = require("./defaults");
var optionParser = require("../optionParser");

// Base Publisher
// --------------

function Publisher(rabbit, options){
  this.rabbit = rabbit;
  this.options = optionParser.parse(options, defaults);
}

util.inherits(Publisher, Events.EventEmitter);

// Publisher Instance Members
// ------------------------

Publisher.prototype._start = function(){
  if (this._startPromise){ return this._startPromise; }

  var name = this.options.exchange.name;
  var type = this.options.exchange.type;
  this._startPromise = this.rabbit.addExchange(name, type, this.options.exchange);

  return this._startPromise;
};

Publisher.prototype.publish = function(data, done){
  var that = this;
  var rabbit = this.rabbit;
  var exchangeName = this.options.exchange.name;
  var messageType = this.options.messageType;

  this._start().then(function(){

    console.log("sending message to", exchangeName);
    rabbit.publish(exchangeName, {
      type: messageType,
      body: data
    }).then(function(){
      if (done){ done(); }
    }).then(null, function(err){
      that.emitError(err);
    });
      
  }).then(null, function(err){
    that.emitError(err);
  });
};

Publisher.prototype.emitError = function(err){
  this.emit("error", err);
};

Publisher.prototype.stop = function(){
  this.removeAllListeners();
};

// Exports
// -------

module.exports = Publisher;
