var util = require("util");
var rabbit = require("rabbot");
var Consumer = require("../lib/consumer");
var Publisher = require("../lib/pub-sub/publisher");
var Subscriber = require("../lib/pub-sub/subscriber");

function reportErr(err){
  setImmediate(function(){
    console.log(err.stack);
    throw err;
  });
}

describe("consumer middleware", function(){
  var msg1 = {foo: "bar"};
  var msg2 = {baz: "quux"};
  var msgType1 = "pub-sub.messageType.1";
  var ex1 = "pub-sub.ex.1";
  var q1 = "pub-sub.q.1";

  var exConfig = {
    name: ex1,
    autoDelete: true
  };

  var qConfig = {
    name: q1,
    autoDelete: true
  };

  describe("given handler function with no other middleware", function(){
    var pub, sub, result;

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

      result = false;

      sub.subscribe(function(msg, properties, actions, next){
        result = true;
        actions.ack();
        setTimeout(done, 250);
      });

      function pubIt(){
        pub.publish(msg1);
      }

      sub.on("ready", pubIt);
    });

    it("should run the handler", function(){
      expect(result).toBe(true);
    });
  });

  describe("given a handler function and a middleware that calls ack, when running", function(){
    var pub, sub, result;

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

      result = false;

      sub.use(function(msg, properties, actions, next){
        actions.ack();
        setTimeout(done, 250);
      });

      sub.subscribe(function(msg, properties, actions, next){
        result = true;
      });

      function pubIt(){
        pub.publish(msg1);
      }

      sub.on("ready", pubIt);
    });

    it("should not run the handler", function(){
      expect(result).toBe(false);
    });
  });

  describe("given a handler function and a middleware that calls next, when running", function(){
    var pub, sub, result;

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

      result = false;

      sub.use(function(msg, properties, actions, next){
        next();
      });

      sub.subscribe(function(msg, properties, actions, next){
        result = true;
        actions.ack();
        setTimeout(done, 250);
      });

      function pubIt(){
        pub.publish(msg1);
      }

      sub.on("ready", pubIt);
    });

    it("should run the handler", function(){
      expect(result).toBe(true);
    });
  });

  describe("when a subscriber returns an error", function(){
    var pub, sub, err;
    var exampleError = new Error("some error");

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

      sub.use(function(subErr, msg, props, actions, next){
        err = subErr;
        actions.ack();
        setTimeout(done, 250);
      });

      sub.subscribe(function(msg, properties, actions, next){
        return next(exampleError);
      });

      function pubIt(){
        pub.publish(msg1);
      }

      sub.on("ready", pubIt);
    });

    it("should run the error handler", function(){
      expect(err).toBe(exampleError);
    });
  });
});
