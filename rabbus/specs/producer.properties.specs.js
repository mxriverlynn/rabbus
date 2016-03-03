var rabbit = require("rabbot");

var Sender = require("../lib/send-rec/sender");
var Receiver = require("../lib/send-rec/receiver");

function reportErr(err){
  setImmediate(function(){
    console.log(err.stack);
    throw err;
  });
}

describe("producer properties", function(){
  var msgType1 = "send-receive.messageType.2";
  var ex1 = "send-receive.ex.2";
  var q1 = "send-receive.q.2";
  var rKey = "test.key.2";

  var exchangeConfig = {
    name: ex1,
    autoDelete: true
  };

  describe("when setting message headers, and middleware also sets headers", function(){
    var msg1, send, rec;
    var sendHandled, recHandled;
    var msgHeaders;

    beforeEach(function(done){
      msg1 = {foo: "bar"};

      send = new Sender(rabbit, {
        exchange: exchangeConfig,
        messageType: msgType1,
        routingKey: rKey
      });

      send.use(function(msg, headers, next){
        headers.what = "wut wut";
        next();
      });
      send.on("error", reportErr);

      rec = new Receiver(rabbit, {
        exchange: exchangeConfig,
        queue: {
          name: q1,
          autoDelete: true
        },
        messageType: msgType1,
        routingKey: rKey
      });
      rec.on("error", reportErr);

      rec.use(function(msg, properties, actions, next){
        msgHeaders = properties.headers;
        next();
      });

      rec.receive(function(data, properties, actions, next){
        actions.ack();
        setTimeout(done, 250);
      });

      function sendIt(){
        send.send(msg1, {
          headers: {
            foo: "bar"
          }
        });
      }

      rec.on("ready", sendIt);
    });

    it("should receive message with the properties", function(){
      expect(msgHeaders.what).toBe("wut wut");
      expect(msgHeaders.foo).toBe("bar");
    });

  });

  describe("when sending properties that include an onComplete function", function(){
    var msg1, send, rec;
    var onCompleteCalled;

    beforeEach(function(done){
      onCompleteCalled = false;
      msg1 = {foo: "bar"};

      send = new Sender(rabbit, {
        exchange: exchangeConfig,
        messageType: msgType1,
        routingKey: rKey
      });

      send.on("error", reportErr);

      rec = new Receiver(rabbit, {
        exchange: exchangeConfig,
        queue: {
          name: q1,
          autoDelete: true
        },
        messageType: msgType1,
        routingKey: rKey
      });
      rec.on("error", reportErr);

      rec.receive(function(message, properties, actions, next){
        actions.ack();
        setTimeout(done, 250);
      });

      function sendIt(){
        send.send(msg1, {
          onComplete: function(){
            onCompleteCalled = true;
          }
        });
      }

      rec.on("ready", sendIt);
    });

    it("should execute onComplete afer sending", function(){
      expect(onCompleteCalled).toBe(true);
    });

  });

});

