var rabbit = require("rabbot");

var Topology = require("../lib/topology");
var Sender = require("../lib/send-rec/sender");
var Receiver = require("../lib/send-rec/receiver");

function reportErr(err){
  setImmediate(function(){
    console.log(err.stack);
    throw err;
  });
}

describe("topology", function(){
  var msgType1 = "preconfigured.messageType.1";
  var ex1 = "preconfigured.ex.1";
  var q1 = "preconfigured.q.1";
  var rKey = "test.key";

  var exchangeConfig = {
    name: ex1,
    autoDelete: true
  };

  describe("given preconfigured topologies, when sending a message", function(){
    var msg1, send, rec;
    var sendHandled, recHandled;
    var sendMessage;

    beforeEach(function(done){
      msg1 = {foo: "bar"};

      var sP = new Promise(function(res, rej){
        var sendTopology = new Topology(rabbit, {
          exchange: exchangeConfig,
          messageType: msgType1,
          routingKey: rKey
        });

        sendTopology.execute(function(err){
          if (err) { return rej(err); }
          res();
        });
      });

      var rP = new Promise(function(res, rej){
        var receiveTopology = new Topology(rabbit, {
          exchange: exchangeConfig,
          queue: {
            name: q1,
            autoDelete: true
          },
          messageType: msgType1,
          routingKey: rKey
        });

        receiveTopology.execute(function(err){
          if (err) { return rej(err); }
          res();
        });
      });

      Promise.all([sP, rP]).then(function(){
        var preConfigSendTop = new Topology(rabbit, {
          exchange: ex1,
          messageType: msgType1,
          routingKey: rKey
        });
        send = new Sender(rabbit, preConfigSendTop);
        send.on("error", reportErr);

        var preConfigRecTop = new Topology(rabbit, {
          queue: q1,
          messageType: msgType1
        });
        rec = new Receiver(rabbit, preConfigRecTop);
        rec.on("error", reportErr);

        rec.receive(function(msg, properties, actions){
          sendMessage = msg;
          actions.ack();
          done();
        });

        send.send(msg1);
      }).catch(reportErr);
    });

    it("receiver should receive the message", function(){
      expect(sendMessage.foo).toBe(msg1.foo);
    });

  });
});
