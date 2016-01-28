var util = require("util");
var wascally = require("wascally");

var Rabbus = require("../../rabbus/lib");
var config = require("../../rabbus/specs/config");

wascally.configure({
  connection: config
}).then(function(){;
  
  function SomeReceiver(){
    Rabbus.Receiver.call(this, wascally, {
      exchange: "send-rec.exchange",
      queue: "send-rec.queue",
      routingKey: "send-rec.key",
      messageType: "send-rec.messageType"
    });
  }

  util.inherits(SomeReceiver, Rabbus.Receiver);

  var receiver = new SomeReceiver();

  receiver.receive(function(message, properties, actions, next){
    console.log("hello", message.place);
    actions.ack();
  });

}).then(null, function(err){
  setImmediate(function(){
    throw err;
  });
});

function exit(){
  console.log("");
  console.log("shutting down ...");
  wascally.closeAll().then(function(){
    process.exit();
  });
}

process.once("SIGINT", function(){
  exit();
});

process.on("unhandledException", function(err){
  console.log(err);
  exit();
});


