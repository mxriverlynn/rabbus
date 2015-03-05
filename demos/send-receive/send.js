var util = require("util");
var Rabbit = require("wascally");

var Rabbus = require("../../rabbus");
var config = require("../../rabbus/specs/config");

Rabbit.configure({
  connection: config
}).then(function(){;

  function SomeSender(rabbus){
    Rabbus.Sender.call(this, rabbus, {
      exchange: "send-rec.exchange",
      routingKey: "send-rec.key",
      messageType: "send-rec.messageType"
    });
  }

  util.inherits(SomeSender, Rabbus.Sender);

  var sender = new SomeSender(Rabbit);
  var message = {
    place: "world"
  };

  sender.send(message, function(){
    console.log("sent a message");
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

