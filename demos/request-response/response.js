var util = require("util");
var wascally = require("wascally");

var Rabbus = require("../../rabbus/lib");
var config = require("../../rabbus/specs/config");

wascally.configure({
  connection: config
}).then(function(){;
  
  function SomeResponder(){
    Rabbus.Responder.call(this, wascally, {
      exchange: "req-res.exchange",
      queue: "req-res.queue",
      routingKey: "req-res.key",
      limit: 1,
      messageType: "req-res.messageType",
      routingKey: "req-res.key"
    });
  }

  util.inherits(SomeResponder, Rabbus.Responder);

  var responder = new SomeResponder();

  responder.handle(function(message, poperties, actions, next){
    actions.reply({
      place: "world"
    });
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



