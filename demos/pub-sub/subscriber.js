var util = require("util");
var rabbot = require("rabbot");

var Rabbus = require("../../rabbus/lib");
var connection = require("../connection");

// define a subscriber
// -------------------

function SomeSubscriber(){
  Rabbus.Subscriber.call(this, rabbot, {
    exchange: "pub-sub.exchange",
    queue: "pub-sub.q",
    routingKey: "pub-sub.key"
  });
}

util.inherits(SomeSubscriber, Rabbus.Subscriber);

// connect and subscribe to the published info
// -------------------------------------------

connection(function(){
  var sub = new SomeSubscriber();

  // basic error handler
  sub.use(function(err, msg, props, actions, next){
    setTimeout(function(){ throw err; });
  });

  // subscriber
  sub.subscribe(function(msg, props, actions, next){
    console.log("1: hello", msg.place);
    actions.ack();
  });
});
