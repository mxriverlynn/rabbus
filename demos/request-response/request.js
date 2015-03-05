var util = require("util");
var Rabbit = require("wascally");

var Rabbus = require("../../rabbus");
var config = require("../../rabbus/specs/config");

Rabbit.configure({
  connection: config
}).then(function(){;
  
  function SomeRequester(rabbus){
    Rabbus.Requester.call(this, rabbus, {
      exchange: "req-res.exchange",
      messageType: "req-res.messageType",
      routingKey: "req-res.key"
    });
  }

  util.inherits(SomeRequester, Rabbus.Requester);

  var requester = new SomeRequester(Rabbit);

  var msg = {};
  requester.request(msg, function(response, done){
    console.log("Hello", response.place);
    done();
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


