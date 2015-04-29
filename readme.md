# Rabbus: Micro-ESB For NodeJS/RabbitMQ

A highly opinionated, yet minimal, set of message bus abstractions for NodeJS.
It is built on top of [RabbitMQ](http://rabbitmq.com), 
with [Wascally](https://github.com/LeanKit-Labs/wascally) as the primary library
for working with RabbitMQ.

## About Rabbus

The service bus implementation is basic, but includes several of the most 
common patterns:

* Send / Receive
* Publish / Subscribe
* Request / Response

Please note that the names of these patterns imply certain things both in
semantics and in behaviors. I (@derickbailey) have put my own experience and
opinions in to these names and the RabbitMQ configuration associated with them.
Some of the behavior is inherited from Wascally, as well.

## Installing Rabbus

It's all NPM. You're going to want the 'wascally' package with this, so you will
need to do two things:

```
npm install --save wascally
npm install --save rabbus
```

Please note that Wascally is explicitly NOT mentioned as a dependency in the
Rabbus package.json file for runtime dependencies. This is done with intent, to help prevent library
version conflicts.

## Using Rabbus

There are three pairs of objects that come with Rabbus, as noted in the above
patterns. Each of them is meant to be used in combination with it's pair. You
are encouraged, however, not to use them directly. While this is certainly
possible, I find it is more convenient to inherit from these objects at the
point where they need to be used. The configuration of each object can then be
encapsulated for the intended use, allowing easier testing and maintenance.

There are a few commonalities between all of these object pairs. Most notably,
the object that sends a message to RabbitMQ only needs to know about the 
exchange to which it sends. Conversely, the object that consumes a message
from within RabbitMQ needs to know about both the exchange and the queue to 
which it subscribes.

The following provide basic working examples of each object pair. If you would 
like to run these demos for yourself, please see the [demos folder](demos)
of the repository.

Please see the [Wascally](https://github.com/LeanKit-Labs/wascally) documentation for information
on configuring RabbitMQ.

### General Error Handling

In general, each of the objects in Rabbus will emit an "error"
message when an error occurs. You can use standard NodeJS
EventEmitter functions to subscribe / unsubscribe the error
events.

```js
var sub = new Subscriber(...);
sub.on("error", function(err){
  // do something with the err object, here
});
```

## Send / Receive

The Send / Receive object pair uses a direct exchange inside of RabbitMQ, 
allowing you to specify the binding key.

Set up a Sender:

```js
var util = require("util");
var Rabbus = require("rabbus");

function SomeSender(rabbus){
  Rabbus.Sender.call(this, rabbus, {
    exchange: "send-rec.exchange",
    routingKey: "send-rec.key",
    messageType: "send-rec.messageType"
  });
}

util.inherits(SomeSender, Rabbus.Sender);

var sender = new SomeSender(Rabbus);
var message = {
  place: "world"
};

sender.send(message, function(){
  console.log("sent a message");
});
```

Set up a Receiver:

```js
var util = require("util");
var Rabbus = require("rabbus");

function SomeReceiver(rabbus){
  Rabbus.Receiver.call(this, rabbus, {
    exchange: "send-rec.exchange",
    queue: "send-rec.queue",
    routingKey: "send-rec.key",
    messageType: "send-rec.messageType"
  });
}

util.inherits(SomeReceiver, Rabbus.Receiver);

var receiver = new SomeReceiver(Rabbus);

receiver.receive(function(message, done){
  console.log("hello", message.place);
  done();
});
```

## Publish / Subscribe

The Publish / Subscribe object pair uses a fanout exchange inside of RabbitMQ, 
allowing you to have as many subscribers as you need. Think of pub/sub as an
event that gets broadcast to anyone that cares, or no one at all if no one is
listening.

### Set Up A Publisher

```js
var util = require("util");
var Rabbus = require("rabbus");

function SomePublisher(rabbus){
  Rabbus.Publisher.call(this, rabbus, {
    exchange: "pub-sub.exchange",
    routingKey: "pub-sub.key",
    messageType: "pub-sub.messageType"
  });
}

util.inherits(SomePublisher, Rabbus.Publisher);

var publisher = new SomePublisher(Rabbus);
var message = {
  place: "world"
};

publisher.publish(message, function(){
  console.log("published an event!");
});
```
### Publisher Options

The following options are available when configuring a publisher:

* **exchange** (string): name of the exchange to create and publish to
* **exchange** (object): object literal with options for the exchange
  * **name** (string): name of the exchange to create and publish to
  * **autoDelete** (boolean): delete this exchange when there are no more connections using it. default is `false`.
  * **durable** (boolean): this exchange will survive a shut down / restart of RabbitMQ. default is `true`.
  * **persistent** (boolean): messages published through this exchange will be saved to disk / survive restart of RabbitMQ. default is `true`.
* **messageType** (string): the type of message being published

### Set Up A Subscriber

```js
var util = require("util");
var Rabbus = require("rabbus");

function SomeSubscriber(){
  Rabbus.Subscriber.call(this, rabbus, {
    exchange: "pub-sub.exchange",
    queue: "pub-sub.queue",
    routingKey: "pub-sub.key",
    messageType: "pub-sub.messageType"
  });
}

util.inherits(SomeSubscriber, Rabbus.Subscriber);

// ... 

var sub1 = new SomeSubscriber();
sub1.subscribe(function(message){
  console.log("1: hello", message.place);
});

var sub2 = new SomeSubscriber();
sub2.subscribe(function(message){
  console.log("2: hello", message.place);
});

var sub3 = new SomeSubscriber();
sub3.subscribe(function(message){
  console.log("3: hello", message.place);
});
```

### Subscriber Options



## Request / Response

The request/response pair uses a "topic" exchange. You should set the
routing key via the "routingKey" parameter, but it will default to the 
message type if none is supplied.

With a request/response setup, you can send a request for information and
respond to it. A private, temporary queue will be created for the response
message, ensuring that it gets back to the requester correctly.

Set up a Requester

```js
var util = require("util");
var Rabbus = require("rabbus");

function SomeRequester(rabbus){
  Rabbus.Requester.call(this, rabbus, {
    exchange: "req-res.exchange",
    messageType: "req-res.messageType",
    routingKey: "req-res.key"
  });
}

util.inherits(SomeRequester, Rabbus.Requester);

var requester = new SomeRequester(Rabbus);

var msg = {};
requester.request(msg, function(response, done){
  console.log("Hello", response.place);
  done();
});
```

Set up a Responder:

```js
var util = require("util");
var Rabbus = require("rabbus");

function SomeResponder(rabbus){
  Rabbus.Responder.call(this, rabbus, {
    exchange: "req-res.exchange",
    queue: "req-res.queue",
    routingKey: "req-res.key",
    limit: 1,
    messageType: "req-res.messageType"
  });
}

util.inherits(SomeResponder, Rabbus.Responder);

var responder = new SomeResponder(Rabbus);

responder.handle(function(message, respond){
  respond({
    place: "world"
  });
});
```

Note that the responder does the "work" but sends a response back to the
requester, instead of just saying that the work is done. This allows the
requester to receive the response and do something with it.

Also note the "limit" option for the Resonder. This is the "prefetch" limit
for the queue, allowing you to limit the amount of work being done concurrently.

## Limit Message Processing

If you need to limit the number of messages being processed by any given
messgae handler, you can specify a `limit` in the configuration.

```
function SomeSubscriber(rabbus){
  Rabbus.Subscriber.call(this, rabbus, {
    // ...
    limit: 1
  });
}
```

This will limit your `SomeSubscriber` to only working on one message at a time.
When your processing code calls `done`, the next message will be picked up
and processed.

## Ack / Nack Individual Messages

Wascally's default behavior is to batch process `ack` and `nack`
calls on messages. This can lead to an improvement of up to 400%
throughput in processing small things. In scenarios where there
are very long running processes that leave a message unacknowledged
for extended periods, though, this can be troublesome.

To prevent issues with batching ack / nack calls, Wascally and
Rabbus provide a `noBatch` option for Queue definitions.

```js
var Subscriber = new Rabbus.Subscriber({
  // ...

  noBatch: true
});
```

The following Rabbus objects provide the `noBatch` feature:

* Rabbus.Receiver
* Rabbus.Subscriber
* Rabbus.Responder

## Legalese

Unless otherwise noted, Rabbus is Copyright &copy;2014 Muted Solutions, LLC. All Rights Reserved. 

Rabbus is distributed under the [MIT license](http://mutedsolutions.mit-license.org).
