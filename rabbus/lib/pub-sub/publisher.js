var Events = require("events");
var util = require("util");
var when = require("when");

var defaults = require("./defaults");
var Producer = require("../producer");

// Base Publisher
// --------------

function Publisher(rabbit, options){
  Producer.call(this, rabbit, options, defaults);
}

util.inherits(Publisher, Producer);

// Publisher Instance Members
// ------------------------

Publisher.prototype.publish = function(data, done){
  var that = this;
  var rabbit = this.rabbit;
  var exchange = this.options.exchange;
  var messageType = this.options.messageType;
  var routingKey = this.options.routingKey;
  var middleware = this.middleware;

  this._start().then(function(){
    that.emit("ready");
    console.log("sending message to", exchange.name);

    var handler = middleware.prepare(function(config){
      config.last(function(message, headers, actions){

        var properties = {
          routingKey: routingKey,
          type: messageType,
          body: data,
          headers: headers
        };

        rabbit
          .publish(exchange.name, properties)
          .then(function(){
            if (done){ done(); }
          })
          .then(null, function(err){
            that.emitError(err);
          });

      });
    });

    handler(data);
      
  }).then(null, function(err){
    that.emitError(err);
  });
};

// Exports
// -------

module.exports = Publisher;
