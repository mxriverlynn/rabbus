var Async = require("node-jasmine-async");
var rabbit = require("wascally");

var Sender = require("../lib/sender");
var Receiver = require("../lib/receiver");

function reportErr(err){
  setImmediate(function(){
    console.log(err.stack);
    throw err;
  });
}

describe("send / receive", function(){
  var msgType1 = "send-receive.messageType.1";
  var ex1 = "send-receive.ex.1";
  var q1 = "send-receive.q.1";
  var rKey = "test.key";

  describe("given a receiver in place, when sending a message", function(){
    var async = new Async(this);

    var msg1, send, rec;
    var sendHandled, recHandled;
    var sendMessage;

    async.beforeEach(function(done){
      msg1 = {foo: "bar"};

      send = new Sender(rabbit, {
        exchange: ex1,
        messageType: msgType1,
        routingKey: rKey,
        autoDelete: true
      });
      send.on("error", reportErr);

      rec = new Receiver(rabbit, {
        exchange: ex1,
        queue: q1,
        messageType: msgType1,
        routingKey: rKey,
        autoDelete: true
      });
      rec.on("error", reportErr);

      rec.receive(function(data, ack){
        ack();
        sendMessage = data;
        done();
      });

      function sendIt(){
        send.send(msg1);
      }

      rec.on("ready", sendIt);
    });

    it("receiver should receive the message", function(){
      expect(sendMessage.foo).toBe(msg1.foo);
    });

  });

  describe("when a receiver throws an error", function(){
    var async = new Async(this);

    var msg1, send, rec, err;
    var sendHandled, recHandled;
    var sendMessage;
    var nacked = false;
    var handlerError = new Error("error handling message");

    async.beforeEach(function(done){
      msg1 = {foo: "bar"};

      send = new Sender(rabbit, {
        exchange: ex1,
        messageType: msgType1,
        routingKey: rKey,
        autoDelete: true
      });
      send.on("error", reportErr);

      rec = new Receiver(rabbit, {
        exchange: ex1,
        queue: q1,
        messageType: msgType1,
        routingKey: rKey,
        autoDelete: true
      });

      rec.receive(function(data, ack){
        throw handlerError;
      });

      function sendIt(){
        send.send(msg1);
      }

      rec.on("nack", function(){
        nacked = true;
      });

      rec.on("error", function(ex){
        err = ex;
        done();
      });

      rec.on("ready", sendIt);
    });

    it("should emit the error from the receiver", function(){
      expect(err).toBe(handlerError);
    });

    it("should nack the message", function(){
      expect(nacked).toBe(true);
    });
  });

});
