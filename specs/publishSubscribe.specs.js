var Async = require("node-jasmine-async");
var rabbit = require("wascally");
var config = require("./config");

var Publisher = require("../lib/publisher");
var Subscriber = require("../lib/subscriber");

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

  rabbit.configure({
    connection: config
  });

  describe("when publishing a message with a subscriber", function(){
    var async = new Async(this);

    var pub, sub;
    var pubHandled, subHandled;
    var publishMessage;

    async.beforeEach(function(done){
      pub = new Publisher(rabbit, {
        exchange: ex1,
        messageType: msgType1
      });
      pub.on("error", reportErr);

      sub = new Subscriber(rabbit, {
        exchange: ex1,
        queue: q1,
        messageType: msgType1
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

});

