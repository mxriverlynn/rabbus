var Async = require("node-jasmine-async");
var rabbit = require("wascally");

var Requester = require("../lib/requester");
var Responder = require("../lib/responder");

function reportErr(err){
  setImmediate(function(){
    console.log(err.stack);
    throw err;
  });
}

describe("request / response", function(){
  var msg1 = {foo: "bar"};
  var msg2 = {baz: "quux"};
  var msgType1 = "req-res.message.type";
  var routingKey = "req-res.key";
  var ex1 = "req-res.ex";
  var q1 = "req-res.q";

  describe("when making a request, and a response is sent back", function(){
    var async = new Async(this);

    var req, res;
    var reqHandled, resHandled;
    var requestMessage, responseMessage;

    async.beforeEach(function(done){
      req = new Requester(rabbit, {
        exchange: ex1,
        messageType: msgType1,
        routingKey: routingKey
      });
      req.on("error", reportErr);

      res = new Responder(rabbit, {
        exchange: ex1,
        queue: q1,
        messageType: msgType1,
        routingKey: routingKey,
        limit: 1
      });
      res.on("error", reportErr);

      res.handle(function(data, respond){
        requestMessage = data;
        respond(msg2);
      });

      function makeRequest(){
        req.request(msg1, function(data){
          responseMessage = data;
          done();
        });
      }

      res.on("ready", makeRequest);
    });

    it("should handle the request", function(){
      expect(requestMessage.foo).toBe(msg1.foo);
    });

    it("should handle the response", function(){
      expect(responseMessage.baz).toBe(msg2.baz);
    });

  });

  // give wascally some time to 
  // batch things up and complete
  var async = new Async(this);
  async.afterEach(function(done){
    setTimeout(function(){
      done();
    },500);
  });

});
