var util = require("util");
var wascally = require("wascally");

var Rabbus = require("../../rabbus/lib");
var connection = require("../connection");

// define a requester
// ------------------

function SomeRequester(){
  Rabbus.Requester.call(this, wascally, {
    exchange: "req-res.exchange"
    routingKey: "req-res.key"
  });
}

util.inherits(SomeRequester, Rabbus.Requester);

// connect and send a request
// --------------------------

connection(function(){
  var requester = new SomeRequester();

  // basic error handler
  requester.use(function(err, message, headers, next){
    setImmediate(function(){ throw err; });
  });

  var msg = {
    some: "cool stuff"
  };

  // send the request
  requester.request(msg, function(response, done){
    console.log("Hello", response.place);
    done();
  });
});
