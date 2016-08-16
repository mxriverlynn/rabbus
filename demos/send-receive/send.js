var util = require("util");
var rabbot = require("rabbot");

var Rabbus = require("../../rabbus/lib");
var connection = require("../connection");

// define a sender
// ---------------

function SomeSender(){
  Rabbus.Sender.call(this, rabbot, {
    exchange: "send-rec.exchange",
    routingKey: "send-rec.key"
  });
}

util.inherits(SomeSender, Rabbus.Sender);

// connect and send a message
// --------------------------

connection(function(){
  var sender = new SomeSender();

  // basic error handler
  sender.use(function(err, message, props, actions, next){
    setImmediate(function(){ throw err; });
  });

  var message = {
    place: "world"
  };

  // send the message
  sender.send(message, function(){
    console.log("sent a message");
  });
});
