var util = require("util");
var rabbot = require("rabbot");

var Rabbus = require("../../rabbus/lib");
var connection = require("../connection");

// define a subscriber
// -------------------

function SomeSubscriber(){
  Rabbus.Subscriber.call(this, rabbot, {
    exchange: "pub-sub.exchange",
    queue: "pub-sub.queue",
    routingKey: "pub-sub.key"
  });
}

util.inherits(SomeSubscriber, Rabbus.Subscriber);

// connect and subscribe to the published info
// -------------------------------------------

connection(function(){
  // first subscriber
  var sub1 = new SomeSubscriber();

  // basic error handler
  sub1.use(function(err, msg, props, actions, next){
    setTimeout(function(){ throw err; });
  });

  sub1.subscribe(function(message, properties, actions, next){
    console.log("1: hello", message.place);
    actions.ack();
  });

  // second subscriber
  var sub2 = new SomeSubscriber();
 
  // basic error handler
  sub2.use(function(err, msg, props, actions, next){
    setTimeout(function(){ throw err; });
  });

  sub2.subscribe(function(message, properties, actions, next){
    console.log("2: hello", message.place);
    actions.ack();
  });
});
