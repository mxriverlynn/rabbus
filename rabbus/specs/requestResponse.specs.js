var rabbit = require("rabbot");

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
  var ex2 = "req-res.ex.2";
  var ex3 = "req-res.ex.3";
  var q1 = "req-res.q";

  var exchangeConfig = {
    name: ex1,
    autoDelete: true
  };

  var exConfig2 = {
    name: ex2,
    autoDelete: true
  };

  var exConfig3 = {
    name: ex3,
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

      res.handle(function(data, properties, actions, next){
        requestMessage = data;
        actions.reply(msg2);
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

  describe("when request/response is used with no message type", function(){
    var req, res;
    var reqHandled, resHandled;
    var requestMessage, responseMessage;

    beforeEach(function(done){
      req = new Requester(rabbit, {
        exchange: exchangeConfig,
        routingKey: routingKey,
      });
      req.on("error", reportErr);

      res = new Responder(rabbit, {
        exchange: exchangeConfig,
        queue: queueConfig,
        routingKey: routingKey,
      });

      spyOn(res, "emit").and.callThrough();

      res.on("error", reportErr);

      res.handle(function(data, properties, actions, next){
        requestMessage = data;
        actions.reply(msg2);
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

  describe("when two requests are made from the same object", function(){
    var req, res;
    var reqHandled, resHandled;
    var requestMessage, responseMessage;

    beforeEach(function(done){
      responseMessage = [];

      req = new Requester(rabbit, {
        exchange: exConfig2,
        messageType: msgType1,
        routingKey: routingKey,
      });
      req.on("error", reportErr);

      res = new Responder(rabbit, {
        exchange: exConfig2,
        queue: queueConfig,
        messageType: msgType1,
        routingKey: routingKey,
      });

      spyOn(res, "emit").and.callThrough();

      res.on("error", reportErr);

      res.handle(function(data, properties, actions, next){
        requestMessage = data;
        actions.reply(msg2);
      });

      function makeRequest(){
        var p1 = new Promise(function(resolve){
          req.request(msg1, function(data){
            responseMessage.push({
              requester: 1
            });
            resolve();
          });
        });

        var p2 = new Promise(function(resolve){
          req.request(msg1, function(data){
            responseMessage.push({
              requester: 2
            });
            resolve();
          });
        });

        Promise
          .all([p1, p2])
          .then(done)
          .catch(reportErr);
      }

      res.on("ready", makeRequest);
    });

    it("should handle both the requests, separately", function(){
      expect(responseMessage.length).toBe(2);
      expect(responseMessage[0].requester).toBe(1);
      expect(responseMessage[1].requester).toBe(2);
    });
  });

  describe("when two requests are made from two objects, and two responses are sent back", function(){
    var req1, req2, res;
    var reqHandled, resHandled;
    var requestMessage, responseMessage;

    beforeEach(function(done){
      responseMessage = [];

      req1 = new Requester(rabbit, {
        exchange: exConfig3,
        messageType: msgType1,
        routingKey: routingKey,
      });
      req1.on("error", reportErr);

      req2 = new Requester(rabbit, {
        exchange: exConfig3,
        messageType: msgType1,
        routingKey: routingKey,
      });
      req2.on("error", reportErr);

      res = new Responder(rabbit, {
        exchange: exConfig3,
        queue: queueConfig,
        messageType: msgType1,
        routingKey: routingKey,
      });

      spyOn(res, "emit").and.callThrough();

      res.on("error", reportErr);

      res.handle(function(data, properties, actions, next){
        requestMessage = data;
        actions.reply(msg2);
      });

      function makeRequest(){
        var p1 = new Promise(function(resolve){
          req1.request(msg1, function(data){
            responseMessage[0] = {
              data: data,
              requester: 1
            };
            resolve();
          });
        });

        var p2 = new Promise(function(resolve){
          req2.request(msg1, function(data){
            responseMessage[1] = {
              data: data,
              requester: 2
            };
            resolve();
          });
        });

        Promise
          .all([p1, p2])
          .then(done)
          .catch(reportErr);
      }

      res.on("ready", makeRequest);
    });

    it("should handle both the requests, separately", function(){
      expect(responseMessage[0].data.baz).toBe(msg2.baz);
      expect(responseMessage[0].requester).toBe(1);
      expect(responseMessage[1].data.baz).toBe(msg2.baz);
      expect(responseMessage[1].requester).toBe(2);
    });
  });

  describe("when a responder throws an error", function(){
    var req, res, err;
    var reqHandled, resHandled;
    var requestMessage, responseMessage;
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

      res.handle(function(data, properties, actions, next){
        throw handlerError;
      });

      res.use(function(ex, data, properties, actions, next){
        err = ex;
        done();
      });

      function makeRequest(){
        req.request(msg1, function(data){
          responseMessage = data;
          done();
        });
      }

      res.on("ready", makeRequest);
    });

    it("should raise an error event", function(){
      expect(err).toBe(handlerError);
    });
  });

});
