var util = require("util");
var wascally = require("wascally");

var Rabbus = require("../../rabbus/lib");
var connection = require("../connection");

// define a subscriber
// -------------------

function SomeSubscriber(){
  Rabbus.Subscriber.call(this, wascally, {
    exchange: "pub-sub.exchange",
    queue: "pub-sub.queue",
    routingKey: "pub-sub.key",
    messageType: "pub-sub.messageType"
  });
}

util.inherits(SomeSubscriber, Rabbus.Subscriber);

// connect and subscribe to the published info
// -------------------------------------------

connection(function(){
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
});
