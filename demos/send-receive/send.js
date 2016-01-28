var util = require("util");
var wascally = require("wascally");

var Rabbus = require("../../rabbus/lib");
var config = require("../../rabbus/specs/config");

wascally.configure({
  connection: config
}).then(function(){;

  function SomeSender(){
    Rabbus.Sender.call(this, wascally, {
      exchange: "send-rec.exchange",
      routingKey: "send-rec.key",
      messageType: "send-rec.messageType"
    });
  }

  util.inherits(SomeSender, Rabbus.Sender);

  var sender = new SomeSender();
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

