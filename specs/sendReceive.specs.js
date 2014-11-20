var Async = require("node-jasmine-async");
var rabbit = require("wascally");
var config = require("./config");

var Sender = require("../lib/sender");
var Receiver = require("../lib/receiver");

function reportErr(err){
  setImmediate(function(){
    console.log(err.stack);
    throw err;
  });
}

describe("send / receive", function(){
  var msg1 = {foo: "bar"};
  var msg2 = {baz: "quux"};
  var msgType1 = "send-receive.messageType.1";
  var ex1 = "send-receive.ex.1";
  var q1 = "send-receive.q.1";
  var rKey = "test.key";

  rabbit.configure({
    connection: config
  });

  describe("when sending a message with a receiver", function(){
    var async = new Async(this);

    var send, rec;
    var sendHandled, recHandled;
    var sendMessage;

    async.beforeEach(function(done){
      send = new Sender(rabbit, {
        exchange: ex1,
        messageType: msgType1,
        routingKey: rKey
      });
      send.on("error", reportErr);

      rec = new Receiver(rabbit, {
        exchange: ex1,
        queue: q1,
        messageType: msgType1,
        routingKey: rKey
      });
      rec.on("error", reportErr);

      rec.receive(function(data, ack){
        ack();
        console.log("GOT THE MESSAGE");
        sendMessage = data;
        done();
      });

      function sendIt(){
        send.send(msg1);
      }

      rec.on("ready", sendIt);
    });

    async.afterEach(function(done){
      setTimeout(function(){
        done();
      },500);
    });

    it("receiver should receive the message", function(){
      expect(sendMessage.foo).toBe(msg1.foo);
    });

  });

});

