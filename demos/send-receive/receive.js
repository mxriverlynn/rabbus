var util = require("util");
var Rabbit = require("wascally");

var Rabbus = require("../../index");
var config = require("../../specs/config");

Rabbit.configure({
  connection: config
}).then(function(){;
  
  function SomeReceiver(rabbus){
    Rabbus.Receiver.call(this, rabbus, {
      exchange: "send-rec.exchange",
      queue: "send-rec.queue",
      routingKey: "send-rec.key",
      messageType: "send-rec.messageType"
    });
  }

  util.inherits(SomeReceiver, Rabbus.Receiver);

  var receiver = new SomeReceiver(Rabbit);

  receiver.receive(function(message, done){
    console.log("hello", message.place);
    done();
  });

}).then(null, function(err){
  setImmediate(function(){
    throw err;
  });
});

function exit(){
  console.log("");
  console.log("shutting down ...");
  Rabbit.closeAll().then(function(){
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


