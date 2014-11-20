var Async = require("node-jasmine-async");
var rabbit = require("wascally");
var epa = require("epa").getEnvironment();

var Requester = require("../core/requester");
var Responder = require("../core/responder");

function reportErr(err){
  setImmediate(function(){
    console.log(err.stack);
    throw err;
  });
}

describe("request / response", function(){
  var msg1 = {foo: "bar"};
  var msg2 = {baz: "quux"};
  var msgType1 = "message.type.1";
  var ex1 = "ex.1";
  var q1 = "q.1";

  rabbit.configure({
    connection: epa.get("rabbitmq-specs")
  });

  describe("when making a request, and a response is sent back", function(){
    var async = new Async(this);

    var req, res;
    var reqHandled, resHandled;
    var requestMessage, responseMessage;

    async.beforeEach(function(done){
      req = new Requester(rabbit, {
        exchange: ex1,
        messageType: msgType1
      });
      req.on("error", reportErr);

      res = new Responder(rabbit, {
        exchange: ex1,
        queue: q1,
        messageType: msgType1,
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

});
