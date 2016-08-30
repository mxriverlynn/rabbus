# Publish / Subscribe

**Note**: Currently, a `messageType` is required for Pub/Sub.

The Publish / Subscribe object pair uses a fanout exchange inside of RabbitMQ, 
allowing you to have as many subscribers as you need. Think of pub/sub as an
event that gets broadcast to anyone that cares, or no one at all if no one is
listening.

## Set Up A Publisher

```js
// define a publisher
// ------------------

var util = require("util");
var Rabbus = require("rabbus");
var rabbot = require("rabbot");

function SomePublisher(){
  Rabbus.Publisher.call(this, rabbot, {
    exchange: "pub-sub.exchange",
    routingKey: "pub-sub.key"
  });
}

util.inherits(SomePublisher, Rabbus.Publisher);

// publish a message
// -----------------

var publisher = new SomePublisher();

var message = {
  place: "world"
};

publisher.publish(message, function(){
  console.log("published a message");
});
```

### Publisher Options

The following options are available when configuring a publisher:

* **exchange** (string): name of the exchange to create and publish to
* **exchange** (object): object literal with options for the exchange
  * **name** (string): name of the exchange to create and publish to
  * **type** (string): type of exchange to use. default is `fanout`.
  * **autoDelete** (boolean): delete this exchange when there are no more connections using it. default is `false`.
  * **durable** (boolean): this exchange will survive a shut down / restart of RabbitMQ. default is `true`.
  * **persistent** (boolean): messages published through this exchange will be saved to disk / survive restart of RabbitMQ. default is `true`.
* **messageType** (string): *optional* the type of message being published. ([See below.](#the-messagetype-attribute))
* **routingKey** (string): the routing key to use for the published message

## Set Up A Subscriber

```js
// define a subscriber
// -------------------

var util = require("util");
var Rabbus = require("rabbus");
var rabbot = require("rabbot");

function SomeSubscriber(){
  Rabbus.Subscriber.call(this, rabbot, {
    exchange: "pub-sub.exchange",
    queue: "pub-sub.queue",
    routingKey: "pub-sub.key"
  });
}

util.inherits(SomeSubscriber, Rabbus.Subscriber);

// subscribe to a message
// ----------------------

var sub1 = new SomeSubscriber();
sub1.subscribe(function(message, properties, actions, next){
  console.log("1: hello", message.place);
  actions.ack();
});

var sub2 = new SomeSubscriber();
sub2.subscribe(function(message, properties, actions, next){
  console.log("2: hello", message.place);
  actions.ack();
});

var sub3 = new SomeSubscriber();
sub3.subscribe(function(message, properties, actions, next){
  console.log("3: hello", message.place);
  actions.ack();
});
```

### Subscriber Options

See Publisher options for Exchange definition. The exchange
and queue that you specify in these options will be used to
create the binding between the exchange and queue.

* **exchange**: (see Publisher for options)
* **queue** (string): name of the queue to create and subscribe to
* **queue** (object): object literal with options for the queue
  * **name** (string): name of the queue to create and subscriber to
  * **autoDelete** (boolean): delete this queue when there are no more connections using it. default is `false`.
  * **durable** (boolean): this queue will survive a shut down / restart of RabbitMQ. default is `true`.
* **messageType** (string): *optional* the type of message to handle for this subscriber instance. ([See below.](#the-messagetype-attribute))
* **routingKey** (string): the routing key to use for binding the exchange and queue
* **routingKey** ([string]): an array of string for the routing key to use for binding the exchange and queue
