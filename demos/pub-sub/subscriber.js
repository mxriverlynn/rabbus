var util = require("util");
var Rabbit = require("wascally");
var Rabbus = require("../../index");
var config = require("../../specs/config");

Rabbit.configure({
  connection: config
}).then(function(){;

  function SomeSubscriber(rabbus){
    Rabbus.Subscriber.call(this, rabbus, {
      exchange: "pub-sub.exchange",
      queue: "pub-sub.queue",
      routingKey: "pub-sub.key",
      messageType: "pub-sub.messageType"
    });
  }

  util.inherits(SomeSubscriber, Rabbus.Subscriber);

  var sub1 = new SomeSubscriber(Rabbit);
  sub1.subscribe(function(message){
    console.log("1: hello", message.place);
  });

  var sub2 = new SomeSubscriber(Rabbit);
  sub2.subscribe(function(message){
    console.log("2: hello", message.place);
  });

  var sub3 = new SomeSubscriber(Rabbit);
  sub3.subscribe(function(message){
    console.log("3: hello", message.place);
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
