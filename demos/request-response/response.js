var util = require("util");
var rabbot = require("rabbot");

var Rabbus = require("../../rabbus/lib");
var connection = require("../connection");

// define a responder
// ------------------

function SomeResponder(){
  Rabbus.Responder.call(this, rabbot, {
    exchange: "req-res.exchange",
    queue: "req-res.queue",
    routingKey: "req-res.key",
    limit: 1,
    routingKey: "req-res.key"
  });
}

util.inherits(SomeResponder, Rabbus.Responder);

// connect and respond to requests
// -------------------------------

connection(function(){
  var responder = new SomeResponder();
  
  // basic error handler
  responder.use(function(err, msg, props, actions, next){
    setTimeout(function(){ throw err; });
  });

  // handle the request and send a response
  responder.handle(function(msg, props, actions, next){
    console.log("Received request:", msg);

    var data = { place: "world" };
    actions.reply(data);

    console.log(" - Replying:", data);
  });
});
