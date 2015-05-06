var Events = require("events");
var util = require("util");
var when = require("when");

var defaults = require("./defaults");
var Producer = require("../producer");

// Base Requester
// -----------

function Requester(rabbit, options){
  Producer.call(this, rabbit, options, defaults);
}

util.inherits(Requester, Producer);

// Requester Instance Members
// ------------------------

Requester.prototype.request = function(data, cb){
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
          .request(exchange.name, properties)
          .then(function(reply){
            cb(reply.body);
            reply.ack();
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

module.exports = Requester;
