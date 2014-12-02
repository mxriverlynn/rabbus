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
  var msg1 = {foo: "bar"};
  var msg2 = {baz: "quux"};
  var msgType1 = "send-receive.messageType.1";
  var ex1 = "send-receive.ex.1";
  var q1 = "send-receive.q.1";
  var rKey = "test.key";

  describe("given a receiver in place, when sending a message", function(){
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

  describe("when sending a message with a correlationId", function(){
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

      var correlationIdOptions = {
        correlationId: "foo-bar"
      };

      rec.receive(correlationIdOptions, function(data, ack){
        ack();
        sendMessage = data;
        done();
      });

      function sendIt(){
        send.send(msg1, correlationIdOptions);
      }

      rec.on("ready", sendIt);
    });

    it("receiver should receive the message with the correlationId", function(){
      expect(sendMessage.foo).toBe(msg1.foo);
    });
  });

  describe("when waiting for a different correlationId than was sent", function(){
    var async = new Async(this);

    var send, rec, nacked;
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

      var receiveOptions = {
        correlationId: "a-different-one"
      };
      rec.receive(receiveOptions, function(data, ack){
        ack();
        sendMessage = data;
        done();
      });

      function sendIt(){
        var sendOptions = {
          correlationId: "some.correlation.id"
        };
        send.send(msg1, sendOptions);
      }

      rec.on("ready", sendIt);

      rec.on("nack", function(){
        nacked = true;
        done();
      });
    });

    it("receiver should nack the message, due to wrong correlationid", function(){
      expect(sendMessage).toBe(undefined);
      expect(nacked).toBe(true);
    });
  });

  // give wascally some time to 
  // batch things up and complete
  var async = new Async(this);
  async.afterEach(function(done){
    setTimeout(function(){
      done();
    },500);
  });

});
