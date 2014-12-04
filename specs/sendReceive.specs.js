var Async = require("node-jasmine-async");
var rabbit = require("wascally");

var Sender = require("../lib/sender");
var Receiver = require("../lib/receiver");
var config = require("./config");

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

  var async = new Async(this);
  async.beforeEach(function(done){
    rabbit.configure({
      connection: config
    }).then(function(){
      done();
    }).then(null, function(err){
      reportErr(err);
    });
  });

  describe("given a receiver in place, when sending a message", function(){
    var async = new Async(this);

    var send, rec;
    var sendHandled, recHandled;
    var sendMessage;

    async.beforeEach(function(done){
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

  describe("when sending a message with a correlationId", function(){
    var async = new Async(this);

    var send, rec;
    var sendHandled, recHandled;
    var sendMessage;

    async.beforeEach(function(done){
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

      rec.receive({correlationId: "nope"}, function(data, ack){
        ack();
        sendMessage = data;
        done();
      });

      function sendIt(){
        var correlationIdOptions = {
          correlationId: "foo-bar"
        };
        send.send(msg1, correlationIdOptions);
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

  describe("when sending a message w/ a correlationId, and receiving with no correlationId specified", function(){
    var async = new Async(this);

    var send, rec, sendMessage;
    var sendHandled, recHandled;
    var nacked = false;

    async.beforeEach(function(done){
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
        var correlationIdOptions = {
          correlationId: "foo-bar"
        };
        send.send(msg1, correlationIdOptions);
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

  describe("when a receiver throws an error", function(){
    var async = new Async(this);

    var send, rec, err;
    var sendHandled, recHandled;
    var sendMessage;
    var nacked = false;
    var handlerError = new Error("error handling message");

    async.beforeEach(function(done){
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

      rec.on("ready", sendIt);

      rec.on("nack", function(){
        nacked = true;
      });

      rec.on("error", function(ex){
        err = ex;
        done();
      });

    });

    it("should emit the error from the receiver", function(){
      expect(err).toBe(handlerError);
    });

    it("should nack the message", function(){
      expect(nacked).toBe(true);
    });
  });


  async.afterEach(function(done){
    setTimeout(function(){
      rabbit.closeAll().then(function(){
        done();
      }).then(null, function(err){
        reportErr(err);
      });
    },500);
  });

});
