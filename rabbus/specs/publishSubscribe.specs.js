var rabbit = require("rabbot");
var Publisher = require("../lib/pub-sub/publisher");
var Subscriber = require("../lib/pub-sub/subscriber");

function reportErr(err){
  setImmediate(function(){
    console.log(err.stack);
    throw err;
  });
}

describe("publish / subscribe", function(){
  var msg1 = {foo: "bar"};
  var msg2 = {baz: "quux"};
  var msgType1 = "pub-sub.messageType.1";
  var routingKey1 = "pub-sub.routing.key.1";
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

  describe("when publishing and subscribing", function(){
    var pub, sub;
    var pubHandled, subHandled;
    var publishMessage;

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
        routingKey: msgType1,
      });
      sub.on("error", reportErr);

      sub.subscribe(function(data, properties, actions, next){
        publishMessage = data;
        setTimeout(done, 250);
      });

      function pubIt(){
        pub.publish(msg1);
      }

      sub.on("ready", pubIt);
    });

    it("subscriber should receive the message", function(){
      expect(publishMessage.foo).toBe(msg1.foo);
    });

  });

  describe("when publishing and subscribing with no message type, and a routing key", function(){
    var pub, sub;
    var pubHandled, subHandled;
    var publishMessage;

    beforeEach(function(done){
      pub = new Publisher(rabbit, {
        exchange: exConfig,
        routingKey: routingKey1
      });
      pub.on("error", reportErr);

      sub = new Subscriber(rabbit, {
        exchange: exConfig,
        queue: qConfig,
        routingKey: routingKey1
      });
      sub.on("error", reportErr);

      sub.subscribe(function(data, properties, actions, next){
        publishMessage = data;
        setTimeout(done, 250);
      });

      function pubIt(){
        pub.publish(msg1);
      }

      sub.on("ready", pubIt);
    });

    it("subscriber should receive the message", function(){
      expect(publishMessage.foo).toBe(msg1.foo);
    });

  });

  describe("when the subscriber handler throws an error", function(){
    var pub, sub, err;
    var pubHandled, subHandled;
    var publishMessage;
    var handlerError = new Error("error handling message");

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
        routingKey: msgType1,
      });

      sub.subscribe(function(data){
        throw handlerError;
      });

      sub.use(function(ex, message, properties, actions, next){
        err = ex;
        setTimeout(done, 250);
      });

      function pubIt(){
        pub.publish(msg1);
      }

      sub.on("ready", pubIt);
    });

    it("should raise an error event", function(){
      expect(err).toBe(handlerError);
    });
  });

});
