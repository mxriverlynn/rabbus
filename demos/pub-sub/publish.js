var util = require("util");
var wascally = require("wascally");

var Rabbus = require("../../rabbus/lib");
var config = require("../../rabbus/specs/config");

wascally.configure({
  connection: config
}).then(function(){;

  function SomePublisher(){
    Rabbus.Publisher.call(this, wascally, {
      exchange: "pub-sub.exchange",
      routingKey: "pub-sub.key",
      messageType: "pub-sub.messageType"
    });
  }

  util.inherits(SomePublisher, Rabbus.Publisher);

  var publisher = new SomePublisher();
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
