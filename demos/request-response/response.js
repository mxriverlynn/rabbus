var util = require("util");
var wascally = require("wascally");

var Rabbus = require("../../rabbus/lib");
var connection = require("../connection");

// define a responder
// ------------------

function SomeResponder(){
  Rabbus.Responder.call(this, wascally, {
    exchange: "req-res.exchange",
    queue: "req-res.queue",
    routingKey: "req-res.key",
    limit: 1,
    messageType: "req-res.messageType",
    routingKey: "req-res.key"
  });
}

util.inherits(SomeResponder, Rabbus.Responder);

// connect and respond to requests
// -------------------------------

connection(function(){
  var responder = new SomeResponder();

  responder.handle(function(message, poperties, actions, next){
    actions.reply({
      place: "world"
    });
  });
});
