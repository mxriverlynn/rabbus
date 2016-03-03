var util = require("util");
var rabbot = require("rabbot");
var moment = require("moment");

var Rabbus = require("../../rabbus/lib");
var connection = require("../connection");

// config stuff
// ------------

var maxCount = 10000;

// define a sender
// ---------------

function SomeSender(){
  Rabbus.Sender.call(this, rabbot, {
    exchange: "send-rec.exchange",
    routingKey: "send-rec.key"
  });
}

util.inherits(SomeSender, Rabbus.Sender);

// Define a receiver
// -----------------

function SomeReceiver(){
  Rabbus.Receiver.call(this, rabbot, {
    exchange: "send-rec.exchange",
    queue: "send-rec.queue",
    routingKey: "send-rec.key"
  });
}

util.inherits(SomeReceiver, Rabbus.Receiver);

// run a speed test
// ----------------
//
// see how long it takes to process 10,000 messages

connection(function(){
  var startSend, endSend, startReceive, endReceive;

  var sender = new SomeSender();
  var receiver = new SomeReceiver();

  // basic error handlers
  receiver.use(function(err, msg, props, actions, next){
    setTimeout(function(){ throw err; }, 0);
  });

  sender.use(function(err, msg, headers, next){
    setTimeout(function(){ throw err; }, 0);
  });

  startSend = moment();
  console.log("Sending", maxCount, "messages");
  console.log("Send Start:", startSend.toString());

  var pList = [];
  // send messages
  for(var i=1; i<=maxCount; i++){
    var p = new Promise(function(resolve){
      sender.send({foo: "bar"}, resolve);
    });
    pList.push(p);
  }

  Promise
  .all(pList)
  .then(() => {
    endSend = moment();
    console.log("Send End:", endSend.toString());

    startReceive = moment();
    console.log("Receiving", maxCount, "messages");
    console.log("Start Receiving:", startReceive.toString());

    // receive messages
    var receiveCount = 0;
    receiver.receive(function(message, properties, actions, next){
      receiveCount += 1;
      actions.ack();

      if (receiveCount >= maxCount){
        endReceive = moment();
        console.log("End Receiving:", endReceive.toString());

        var sendDiff = moment.duration(endSend.diff(startSend));
        var receiveDiff = moment.duration(endReceive.diff(startReceive));

        var sendSeconds = sendDiff.asSeconds();
        var sendPerSecond = Math.round(maxCount / sendSeconds);
        var receiveSeconds = receiveDiff.asSeconds();
        var receivePerSecond = Math.round(maxCount / receiveSeconds);

        console.log("-------");
        console.log("Totals:");
        console.log("Send Time:", sendSeconds);
        console.log("Send/sec:", sendPerSecond);
        console.log("Receive Time:", receiveSeconds);
        console.log("Receive/sec:", receivePerSecond);

        setTimeout(process.exit, 1000);
      }
    });
  })
  .catch((err) => {
    console.log(err.stack);
    process.exit();
  });

});
