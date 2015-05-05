var util = require("util");
var Consumer = require("../lib/consumer");

describe("consumer middleware", function(){

  function SampleConsumer(){
    Consumer.call(this, {}, {}, {});
  }

  util.inherits(SampleConsumer, Consumer);

  SampleConsumer.prototype.handle = function(msg){
    var that = this;
    var handler = this.middleware.prepare(function(config){
      config.last(function(msg, properties, actions){
        that.emit("handled");
      });
    });

    handler(msg);
  };

  describe("given a last function with no other middleware, when running", function(){
    var consumer, result;

    beforeEach(function(){
      consumer = new SampleConsumer();

      consumer.on("handled", function(){
        result = true;
      });

      consumer.handle({});
    });

    it("should run the last function", function(){
      expect(result).toBe(true);
    });

  });

  describe("given a last function and a middleware that calls ack, when running", function(){
    var consumer;
    var handled = false;
    var acked = false;

    beforeEach(function(){
      consumer = new SampleConsumer();

      consumer.use(function(msg, properties, actions){
        actions.ack();
      });

      consumer.on("handled", function(){
        handled = true;
      });

      consumer.handle({
        ack: function(){
          acked = true;
        }
      });
    });

    it("should not call the last middleware", function(){
      expect(handled).toBe(false);
    });

    it("should call the message ack", function(){
      expect(acked).toBe(true);
    });
  });

  describe("given a last function and a middleware that calls nack, when running", function(){
    var consumer;
    var handled = false;
    var nacked = false;

    beforeEach(function(){
      consumer = new SampleConsumer();

      consumer.use(function(msg, properties, actions){
        actions.nack();
      });

      consumer.on("handled", function(){
        handled = true;
      });

      consumer.handle({
        nack: function(){
          nacked = true;
        }
      });
    });

    it("should not call the last middleware", function(){
      expect(handled).toBe(false);
    });

    it("should call the message nack", function(){
      expect(nacked).toBe(true);
    });
  });

  describe("given a last function and a middleware that calls reject, when running", function(){
    var consumer;
    var handled = false;
    var rejected = false;

    beforeEach(function(){
      consumer = new SampleConsumer();

      consumer.use(function(msg, properties, actions){
        actions.reject();
      });

      consumer.on("handled", function(){
        handled = true;
      });

      consumer.handle({
        reject: function(){
          rejected = true;
        }
      });
    });

    it("should not call the last middleware", function(){
      expect(handled).toBe(false);
    });

    it("should call the message reject", function(){
      expect(rejected).toBe(true);
    });
  });

  describe("given multiple middleware and a last, when handling multiple messages and calling next on all of them", function(){
    var consumer;
    var m1=[], m2=[], m3=[], last=[];

    beforeEach(function(){
      consumer = new SampleConsumer();

      consumer.use(function(msg, properties, actions){
        m1.push(true);
        actions.next();
      });

      consumer.use(function(msg, properties, actions){
        m2.push(true);
        actions.next();
      });

      consumer.use(function(msg, properties, actions){
        m3.push(true);
        actions.next();
      });

      consumer.on("handled", function(){
        last.push(true);
      });

      consumer.handle({});
      consumer.handle({});
    });

    it("should handle all of them", function(){
      expect(m1[0]).toBe(true);
      expect(m1[1]).toBe(true);
      expect(m2[0]).toBe(true);
      expect(m2[1]).toBe(true);
      expect(m3[0]).toBe(true);
      expect(m3[1]).toBe(true);
      expect(last[0]).toBe(true);
      expect(last[1]).toBe(true);
    });
  });

});
