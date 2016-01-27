var util = require("util");
var rabbit = require("wascally");
var Consumer = require("../lib/consumer");
var Publisher = require("../lib/pub-sub/publisher");
var Subscriber = require("../lib/pub-sub/subscriber");

function reportErr(err){
  setImmediate(function(){
    console.log(err.stack);
    throw err;
  });
}

xdescribe("consumer middleware", function(){

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

  describe("given a last function and a middleware that calls reply, when running", function(){
    var consumer;
    var handled = false;
    var replied = false;
    var message;

    beforeEach(function(){
      consumer = new SampleConsumer();

      consumer.use(function(msg, properties, actions){
        actions.reply("some response");
      });

      consumer.on("handled", function(){
        handled = true;
      });

      consumer.handle({
        reply: function(msg){
          replied = true;
          message = msg;
        }
      });
    });

    it("should not call the last middleware", function(){
      expect(handled).toBe(false);
    });

    it("should call the message reply", function(){
      expect(replied).toBe(true);
    });

    it("should send the response", function(){
      expect(message).toBe("some response");
    });
  });

  describe("given multiple middleware, when handling multiple messages and calling next on all of them", function(){
    var pub, sub;
    var msg1 = {foo: "bar"};
    var msg2 = {baz: "quux"};
    var msgType1 = "pub-sub.middleware.1";

    var exConfig = {
      name: "pub-sub.middleware.ex.1",
      autoDelete: true
    };

    var qConfig = {
      name: "pub-sub.middleware.q.1",
      autoDelete: true
    };
    var m1=[], m2=[], m3=[], last=[];

    beforeEach(function(done){
      pub = new Publisher(rabbit, {
        exchange: exConfig,
        messageType: msgType1
      });
      pub.on("error", reportErr);

      sub = new Subscriber(rabbit, {
        exchange: exConfig,
        queue: qConfig,
        messageType: msgType1,
        routingKeys: msgType1,
      });
      sub.on("error", reportErr);

      sub.use(function(msg, properties, actions){
        m1.push(true);
        actions.next();
      });

      sub.use(function(msg, properties, actions){
        m2.push(true);
        actions.next();
      });

      sub.use(function(msg, properties, actions){
        m3.push(true);
        actions.next();
      });

      var subCount = 0;
      sub.subscribe(function(data){
        subCount += 1;
        last.push(true);

        if (subCount === 2){
          done();
        }
      });

      function pubIt(){
        pub.publish(msg1);
        pub.publish(msg2);
      }

      sub.on("ready", pubIt);
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
