var util = require("util");
var Rabbit = require("wascally");

var Rabbus = require("../../index");
var config = require("../../specs/config");

Rabbit.configure({
  connection: config
}).then(function(){;

  function SomePublisher(rabbus){
    Rabbus.Publisher.call(this, rabbus, {
      exchange: "pub-sub.exchange",
      routingKey: "pub-sub.key",
      messageType: "pub-sub.messageType"
    });
  }

  util.inherits(SomePublisher, Rabbus.Publisher);

  var publisher = new SomePublisher(Rabbit);
  var message = {
    place: "world"
  };

  publisher.publish(message, function(){
    console.log("published an event!");
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
