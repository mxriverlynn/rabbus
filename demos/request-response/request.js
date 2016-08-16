var util = require("util");
var rabbot = require("rabbot");

var Rabbus = require("../../rabbus/lib");
var connection = require("../connection");

// define a requester
// ------------------

function SomeRequester(){
  Rabbus.Requester.call(this, rabbot, {
    exchange: "req-res.exchange",
    routingKey: "req-res.key"
  });
}

util.inherits(SomeRequester, Rabbus.Requester);

// connect and send a request
// --------------------------

connection(function(){
  var requester = new SomeRequester();

  // basic error handler
  requester.use(function(err, msg, props, actions, next){
    setImmediate(function(){ throw err; });
  });

  var msg = {
    some: "cool stuff"
  };

  console.log("Sending request:", msg);
  // send the request
  requester.request(msg, function(response){
    console.log("Got a response. Hello", response.place);
  });
});
