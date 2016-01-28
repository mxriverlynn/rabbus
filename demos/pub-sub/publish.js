var util = require("util");
var wascally = require("wascally");

var Rabbus = require("../../rabbus/lib");
var connection = require("../connection");

// define a publisher
// ------------------

function SomePublisher(){
  Rabbus.Publisher.call(this, wascally, {
    exchange: "pub-sub.exchange",
    routingKey: "pub-sub.key",
    messageType: "pub-sub.messageType"
  });
}

util.inherits(SomePublisher, Rabbus.Publisher);

// connect and publish a message
// -----------------------------

connection(function(){
  var publisher = new SomePublisher();

  // basic error handler
  publisher.use(function(err, message, headers, next){
    setImmediate(function(){ throw err; });
  });

  var message = {
    place: "world"
  };

  // publish the message
  publisher.publish(message, function(){
    console.log("published an event!");
  });
});
