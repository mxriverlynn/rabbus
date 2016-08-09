var util = require("util");
var rabbit = require("rabbot");
var Publisher = require("../lib/pub-sub/publisher");
var Subscriber = require("../lib/pub-sub/subscriber");

function reportErr(err){
  setImmediate(function(){
    console.log(err.stack);
    throw err;
  });
}

describe("producer middleware", function(){
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

  describe("given middleware to use", function(){
    var results, pub, sub;

    beforeEach(function(done){
      results = [];

      pub = new Publisher(rabbit, {
        exchange: exConfig,
        messageType: msgType1
      });
      pub.on("error", reportErr);

      pub.use(function(msg, hdr, next){
        results.push("m1");
        next();
      });

      pub.use(function(msg, hdr, next){
        results.push("m2");
        next();
      });

      sub = new Subscriber(rabbit, {
        exchange: exConfig,
        queue: qConfig,
        messageType: msgType1,
        routingKeys: msgType1,
      });
      sub.on("error", reportErr);

      sub.subscribe(function(msg, properties, actions, next){
        actions.ack();
        setTimeout(done, 250);
      });

      sub.on("ready", function(){
        pub.publish(msg1);
      });
    });

    it("should run the middleware in order", function(){
      expect(results[0]).toBe("m1");
      expect(results[1]).toBe("m2");
    });
  });

  describe("when a middleware does not call next", function(){
    var handled, pub, sub;

    beforeEach(function(done){
      handled = false;

      pub = new Publisher(rabbit, {
        exchange: exConfig,
        messageType: msgType1
      });
      pub.on("error", reportErr);

      pub.use(function(msg, hdr, next){
        setTimeout(done, 250);
      });

      sub = new Subscriber(rabbit, {
        exchange: exConfig,
        queue: qConfig,
        messageType: msgType1,
        routingKeys: msgType1,
      });
      sub.on("error", reportErr);

      sub.subscribe(function(msg, properties, actions, next){
        handled = true;
        actions.ack();
      });

      sub.on("ready", function(){
        pub.publish(msg1);
      });
    });


    it("should NOT run the last function", function(){
      expect(handled).toBe(false);
    });
  });

  describe("when a middleware changes the headers", function(){
    var pub, sub;
    var headers;
    var origMsg = {
      foo: "bar"
    };

    beforeEach(function(done){
      pub = new Publisher(rabbit, {
        exchange: exConfig,
        messageType: msgType1
      });
      pub.on("error", reportErr);

      pub.use(function(msg, hdr, next){
        hdr.foo = "bar";
        next();
      });

      sub = new Subscriber(rabbit, {
        exchange: exConfig,
        queue: qConfig,
        messageType: msgType1,
        routingKeys: msgType1,
      });
      sub.on("error", reportErr);

      sub.subscribe(function(msg, properties, actions, next){
        actions.ack();
        headers = properties.headers;
        setTimeout(done, 250);
      });

      sub.on("ready", function(){
        pub.publish(msg1);
      });
    });

    it("should send the modified headers to the final function", function(){
      expect(headers.foo).toBe("bar");
    });
  });

  describe("when a producer returns an error", function(){
    var pub, sub, err;
    var exampleError = new Error("some error");

    beforeEach(function(done){
      pub = new Publisher(rabbit, {
        exchange: exConfig,
        messageType: msgType1
      });
      pub.on("error", reportErr);

      pub.use(function(pubErr, msg, hdr, next){
        err = pubErr;
        setTimeout(done, 250);
      });

      pub.use(function(msg, hdr, next){
        return next(exampleError);
      });

      pub.publish(msg1);
    });

    it("should run the publish error handler", function(){
      expect(err).toBe(exampleError);
    });
  });
});
