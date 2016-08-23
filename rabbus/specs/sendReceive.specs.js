var rabbit = require("rabbot");

var Sender = require("../lib/send-rec/sender");
var Receiver = require("../lib/send-rec/receiver");

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

  var exchangeConfig = {
    name: ex1,
    autoDelete: true
  };

  describe("given a receiver in place, when sending a message", function(){
    var msg1, send, rec;
    var sendHandled, recHandled;
    var sendMessage;

    beforeEach(function(done){
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

      rec.receive(function(msg, properties, actions){
        sendMessage = msg;
        actions.ack();
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

    it("should not fail", function(){
      expect(1).toBe(1);
    });
  });

  describe("when sending more than one message", function(){
    var msg1, msg2, send, rec;
    var sendHandled, recHandled;
    var sendMessage, count;

    beforeEach(function(done){
      count = 0;
      sendMessage = [];
      msg1 = {foo: "bar"};
      msg2 = {foo: "quux"};

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

      rec.receive(function(msg, properties, actions){
        sendMessage.push(msg);
        actions.ack();

        count += 1;
        if (count === 2){ done(); }
      });

      function sendIt(){
        send.send(msg1);
        setTimeout(() => send.send(msg2), 50);
      }

      rec.on("ready", sendIt);
    });

    it("receiver should receive the message", function(){
      expect(sendMessage[0].foo).toBe(msg1.foo);
      expect(sendMessage[1].foo).toBe(msg2.foo);
    });

    it("should not fail", function(){
      expect(1).toBe(1);
    });
  });

  describe("when sending and receiving without a message type", function(){
    var msg1, send, rec;
    var sendHandled, recHandled;
    var sendMessage;

    beforeEach(function(done){
      msg1 = {foo: "bar"};

      send = new Sender(rabbit, {
        exchange: exchangeConfig,
        routingKey: rKey
      });
      send.on("error", reportErr);

      rec = new Receiver(rabbit, {
        exchange: exchangeConfig,
        queue: {
          name: q1,
          autoDelete: true
        },
        routingKey: rKey
      });
      rec.on("error", reportErr);

      rec.receive(function(msg, properties, actions){
        sendMessage = msg;
        actions.ack();
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
    var msg1, send, rec, err;
    var sendHandled, recHandled;
    var sendMessage;
    var handlerError = new Error("error handling message");

    beforeEach(function(done){
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

      rec.receive(function(message, properties, actions, next){
        throw handlerError;
      });

      rec.use(function(ex, message, properties, actions, next){
        err = ex;
        done();
      });

      function sendIt(){
        send.send(msg1);
      }

      rec.on("ready", sendIt);
    });

    it("should call the error handler", function(){
      expect(err).toBe(handlerError);
    });
  });

  describe("when a receiver returns an error", function(){
    var msg1, send, rec, err;
    var sendHandled, recHandled;
    var sendMessage;
    var handlerError = new Error("error handling message");

    beforeEach(function(done){
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

      rec.receive(function(message, properties, actions, next){
        return next(handlerError);
      });

      rec.use(function(ex, message, properties, actions, next){
        err = ex;
        done();
      });

      function sendIt(){
        send.send(msg1);
      }

      rec.on("ready", sendIt);
    });

    it("should call the error handler", function(){
      expect(err).toBe(handlerError);
    });
  });

});
