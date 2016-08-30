# Send / Receive

The Send / Receive object pair uses a direct exchange inside of RabbitMQ, 
allowing you to specify the binding key.

## Set Up A Sender

```js
// define a sender
// ---------------

var util = require("util");
var Rabbus = require("rabbus");
var rabbot = require("rabbot");

function SomeSender(){
  Rabbus.Sender.call(this, rabbot, {
    exchange: "send-rec.exchange",
    routingKey: "send-rec.key"
  });
}

util.inherits(SomeSender, Rabbus.Sender);

// send a message
// --------------

var sender = new SomeSender();

var message = {
  place: "world"
};

sender.send(message, function(){
  console.log("message has been sent!");
});
```

### Sender Options

The following options are available when configuring a sender:

* **exchange** (string): name of the exchange to create and publish to
* **exchange** (object): object literal with options for the exchange
  * **name** (string): name of the exchange to create and publish to
  * **type** (string): type of exchange to use. default is `direct`.
  * **autoDelete** (boolean): delete this exchange when there are no more connections using it. default is `false`.
  * **durable** (boolean): this exchange will survive a shut down / restart of RabbitMQ. default is `true`.
  * **persistent** (boolean): messages published through this exchange will be saved to disk / survive restart of RabbitMQ. default is `true`.
* **messageType** (string): *required* the type of message being published. ([See below.](#the-messagetype-attribute))
* **routingKey** (string): the routing key to use for the published message

**Note**: Currently, a `messageType` is required for Pub/Sub.

## Set Up A Receiver

```js
// define a receiver
// -----------------

var util = require("util");
var Rabbus = require("rabbus");
var rabbot = require("rabbot");

function SomeReceiver(){
  Rabbus.Receiver.call(this, rabbot, {
    exchange: "send-rec.exchange",
    queue: "send-rec.queue",
    routingKey: "send-rec.key"
  });
}

util.inherits(SomeReceiver, Rabbus.Receiver);

// receive a message
// -----------------

var receiver = new SomeReceiver();

receiver.receive(function(message, properties, actions, next){
  console.log("hello", message.place);

  // mark this message as complete, by acknowledging it
  actions.ack();
});
```

### Receiver Options

See Sender options for Exchange definition. The exchange
and queue that you specify in these options will be used to
create the binding between the two.

* **exchange**: (see Sender for options)
* **queue** (string): name of the queue to create and subscribe to
* **queue** (object): object literal with options for the queue
  * **name** (string): name of the queue to create and subscriber to
  * **autoDelete** (boolean): delete this queue when there are no more connections using it. default is `false`.
  * **durable** (boolean): this queue will survive a shut down / restart of RabbitMQ. default is `true`.
* **messageType** (string): *required* the type of message to handle for this subscriber instance. ([See below.](#the-messagetype-attribute))
* **routingKey** (string): the routing key to use for binding the exchange and queue
* **routingKey** ([string]): an array of string for the routing key to use for binding the exchange and queue

