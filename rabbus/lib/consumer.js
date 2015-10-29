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

// Private methods
// ---------------

Consumer.prototype._start = function(){
  if (this._startPromise){
    return this._startPromise;
  }

  var that = this;
  var rabbit = this.rabbit;
  var options = this.options;
  var queueOptions = options.queue;
  var exchangeOptions = options.exchange;
  var routingKey = options.routingKey;

  this._startPromise = when.promise(function(resolve, reject){

    var qP = rabbit.addQueue(queueOptions.name, queueOptions);
    var exP = rabbit.addExchange(
      exchangeOptions.name, 
      exchangeOptions.type, 
      exchangeOptions
    );

    when.all([exP, qP]).then(function(){

      rabbit
        .bindQueue(exchangeOptions.name, queueOptions.name, routingKey)
        .then(function(){
          resolve();
        })
        .then(null, function(err){
          reject(err);
        });

    }).then(null, function(err){
      reject(err);
    });
  
  });

  return this._startPromise;
};

// Exports
// -------

module.exports = Consumer;
