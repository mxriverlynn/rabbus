var util = require("util");
var wascally = require("wascally");

var Rabbus = require("../../rabbus/lib");
var connection = require("../connection");

// Define a receiver
// -----------------

function SomeReceiver(){
  Rabbus.Receiver.call(this, wascally, {
    exchange: "send-rec.exchange",
    queue: "send-rec.queue",
    routingKey: "send-rec.key",
    messageType: "send-rec.messageType"
  });
}

util.inherits(SomeReceiver, Rabbus.Receiver);

// connect and wait for messages
// -----------------------------

connection(function(){
  var receiver = new SomeReceiver();

  receiver.receive(function(message, properties, actions, next){
    console.log("hello", message.place);
    actions.ack();
  });
});
