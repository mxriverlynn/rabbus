var util = require("util");
var wascally = require("wascally");

var Rabbus = require("../../rabbus/lib");
var config = require("../../rabbus/specs/config");

wascally.configure({
  connection: config
}).then(function(){;

  function SomeSubscriber(){
    Rabbus.Subscriber.call(this, wascally, {
      exchange: "pub-sub.exchange",
      queue: "pub-sub.queue",
      routingKey: "pub-sub.key",
      messageType: "pub-sub.messageType"
    });
  }

  util.inherits(SomeSubscriber, Rabbus.Subscriber);

  var sub1 = new SomeSubscriber();
  sub1.subscribe(function(message, properties, actions, next){
    console.log("1: hello", message.place);
    actions.ack();
  });

  var sub2 = new SomeSubscriber();
  sub2.subscribe(function(message, properties, actions, next){
    console.log("2: hello", message.place);
    actions.ack();
  });

  var sub3 = new SomeSubscriber();
  sub3.subscribe(function(message, properties, actions, next){
    console.log("3: hello", message.place);
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
  console.log(err.stack);
  exit();
});
