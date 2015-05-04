var rabbit = require("wascally");

var Requester = require("../lib/req-res/requester");
var Responder = require("../lib/req-res/responder");

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

  var exchangeConfig = {
    name: ex1,
    autoDelete: true
  };

  var queueConfig = {
    name: q1,
    autoDelete: true,
    limit: 1
  };

  describe("when making a request, and a response is sent back", function(){
    var req, res;
    var reqHandled, resHandled;
    var requestMessage, responseMessage;

    beforeEach(function(done){
      req = new Requester(rabbit, {
        exchange: exchangeConfig,
        messageType: msgType1,
        routingKey: routingKey,
      });
      req.on("error", reportErr);

      res = new Responder(rabbit, {
        exchange: exchangeConfig,
        queue: queueConfig,
        messageType: msgType1,
        routingKey: routingKey,
      });

      spyOn(res, "emit").and.callThrough();

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

    it("should emit a reply event with the response message", function(){
      expect(res.emit).toHaveBeenCalledWith("reply", responseMessage);
    });

  });

  describe("when a responder throws an error", function(){
    var req, res, err;
    var reqHandled, resHandled;
    var requestMessage, responseMessage;
    var nacked = false;
    var handlerError = new Error("error handling message");

    beforeEach(function(done){
      req = new Requester(rabbit, {
        exchange: exchangeConfig,
        messageType: msgType1,
        routingKey: routingKey,
      });
      req.on("error", reportErr);

      res = new Responder(rabbit, {
        exchange: exchangeConfig,
        queue: queueConfig,
        messageType: msgType1,
        routingKey: routingKey
      });

      res.handle(function(data, respond){
        throw handlerError;
      });

      function makeRequest(){
        req.request(msg1, function(data){
          responseMessage = data;
          done();
        });
      }

      res.on("ready", makeRequest);

      res.on("error", function(ex){
        err = ex;
        done();
      });

      res.on("nack", function(){
        nacked = true;
      });
    });

    it("should raise an error event", function(){
      expect(err).toBe(handlerError);
    });

    it("should nack the message", function(){
      expect(nacked).toBe(true);
    });
  });

});
