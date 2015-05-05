var rabbit = require("wascally");
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

  describe("when publishing a message with a subscriber", function(){
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
        routingKeys: msgType1,
      });
      sub.on("error", reportErr);

      sub.subscribe(function(data){
        publishMessage = data;
        done();
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
    var nacked = false;
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
        routingKeys: msgType1,
      });

      sub.subscribe(function(data){
        throw handlerError;
      });

      function pubIt(){
        pub.publish(msg1);
      }

      sub.on("ready", pubIt);

      sub.on("error", function(ex){
        err = ex;
        done();
      });

      sub.on("nack", function(){
        nacked = true;
      });

    });

    it("should raise an error event", function(){
      expect(err).toBe(handlerError);
    });

    xit("should nack the message", function(){
      expect(nacked).toBe(true);
    });
  });

});
