var util = require("util");
var rabbot = require("rabbot");

var Rabbus = require("../../rabbus/lib");
var connection = require("../connection");

// define a publisher
// ------------------

function SomePublisher(){
  Rabbus.Publisher.call(this, rabbot, {
    exchange: "pub-sub.exchange",
    routingKey: "pub-sub.key"
  });
}

util.inherits(SomePublisher, Rabbus.Publisher);

// connect and publish a message
// -----------------------------

connection(function(){
  var publisher = new SomePublisher();

  // basic error handler
  publisher.use(function(err, msg, propers, actions, next){
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
