var util = require("util");
var wascally = require("wascally");

var Rabbus = require("../../rabbus/lib");
var connection = require("../connection");

// define a requester
// ------------------

function SomeRequester(){
  Rabbus.Requester.call(this, wascally, {
    exchange: "req-res.exchange",
    messageType: "req-res.messageType",
    routingKey: "req-res.key"
  });
}

util.inherits(SomeRequester, Rabbus.Requester);

// connect and send a request
// --------------------------

connection(function(){
  var requester = new SomeRequester();

  var msg = {};
  requester.request(msg, function(response, done){
    console.log("Hello", response.place);
    done();
  });
});
