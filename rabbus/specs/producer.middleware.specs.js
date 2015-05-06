var util = require("util");
var Producer = require("../lib/producer");

describe("producer middleware", function(){

  function SampleProducer(){
    Producer.call(this, {}, {}, {});
  }

  util.inherits(SampleProducer, Producer);

  SampleProducer.prototype.send = function(msg){
    var that = this;
    var handler = this.middleware.prepare(function(config){
      config.last(function(msg, headers, actions){
        that.emit("handled", msg, headers);
      });
    });

    handler(msg);
  };

  describe("given a last function with no other middleware, when running", function(){
    var message;
    var result = false;
    var origMsg = {
      foo: "bar"
    };

    beforeEach(function(){
      var producer = new SampleProducer();
      producer.on("handled", function(msg){
        message = msg;
        result = true;
      });
      producer.send(origMsg);
    });

    it("should run the last function", function(){
      expect(result).toBe(true);
    });

    it("should send the message through", function(){
      expect(message).toBe(origMsg);
    });
  });

  describe("given a last function with middleware, when running", function(){
    var message;
    var results = [];
    var origMsg = {
      foo: "bar"
    };

    beforeEach(function(){
      var producer = new SampleProducer();
      producer.on("handled", function(msg){
        message = msg;
        results.push("final");
      });

      producer.use(function(msg, hdr, actions){
        results.push("m1");
        actions.next();
      });

      producer.use(function(msg, hdr, actions){
        results.push("m2");
        actions.next();
      });

      producer.send(origMsg);
    });

    it("should run the middleware in order", function(){
      expect(results[0]).toBe("m1");
      expect(results[1]).toBe("m2");
      expect(results[2]).toBe("final");
    });

    it("should send the message through", function(){
      expect(message).toBe(origMsg);
    });
  });

  describe("when a middleware does not call next", function(){
    var result = false;
    var origMsg = {
      foo: "bar"
    };

    beforeEach(function(){
      var producer = new SampleProducer();

      producer.on("handled", function(msg){
        result = true;
      });

      producer.use(function(){
        // DO NOT CALL NEXT in this one
      });

      producer.send(origMsg);
    });

    it("should NOT run the last function", function(){
      expect(result).toBe(false);
    });
  });

  describe("when a middleware changes the headers", function(){
    var headers;
    var origMsg = {
      foo: "bar"
    };

    beforeEach(function(){
      var producer = new SampleProducer();

      producer.on("handled", function(msg, hdr){
        headers = hdr;
      });

      producer.use(function(msg, headers, actions){
        headers.foo = "bar";
        actions.next();
      });

      producer.send(origMsg);
    });

    it("should send the modified headers to the final function", function(){
      expect(headers.foo).toBe("bar");
    });
  });

  describe("when sending multiple messages through the middleware", function(){
    var messages = [];
    var results = [];
    var msg1 = {
      foo: "bar"
    };
    var msg2 = {
      baz: "quux"
    };

    beforeEach(function(){
      var producer = new SampleProducer();
      producer.on("handled", function(msg){
        messages.push(msg);
        results.push("final");
      });

      producer.use(function(msg, hdr, actions){
        results.push("m1");
        actions.next();
      });

      producer.use(function(msg, hdr, actions){
        results.push("m2");
        actions.next();
      });

      producer.send(msg1);
      producer.send(msg2);
    });

    it("should run the middleware in order, on both messages", function(){
      expect(results[0]).toBe("m1");
      expect(results[1]).toBe("m2");
      expect(results[2]).toBe("final");
      expect(results[3]).toBe("m1");
      expect(results[4]).toBe("m2");
      expect(results[5]).toBe("final");
    });

    it("should send the messages through", function(){
      expect(messages[0]).toBe(msg1);
      expect(messages[1]).toBe(msg2);
    });
  });

});
