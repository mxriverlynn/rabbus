var util = require("util");
var wascally = require("wascally");

var Rabbus = require("../../rabbus/lib");
var config = require("../../rabbus/specs/config");

wascally.configure({
  connection: config
}).then(function(){;
  
  function SomeRequester(){
    Rabbus.Requester.call(this, wascally, {
      exchange: "req-res.exchange",
      messageType: "req-res.messageType",
      routingKey: "req-res.key"
    });
  }

  util.inherits(SomeRequester, Rabbus.Requester);

  var requester = new SomeRequester();

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


