# Rabbus

A highly opinionated set of message bus abstractions for NodeJS, built on top of
[RabbitMQ](http://rabbitmq.com), with [Wascally](https://github.com/LeanKit-Labs/wascally).

## About Rabbus

Rabbus is a basic "service bus" implementation for NodeJS, built on top of
RabbitMQ with the Wascally library to manage RabbitMQ. The service bus
implementation is basic, but includes several of the most common patterns:

* Send / Receive
* Publish / Subscribe
* Request / Response

## Installing Rabbus

It's all NPM. You're going to want the 'wascally' package with this, so you will
need to do two things:

```
npm install --save wascally
npm install --save rabbus
```

Please note that Wascally is explicitly NOT mentioned as a dependency in the
Rabbus package.json file. This is done with intent, to help prevent library
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

The following provide basic working examples of each object pair. Please see the
[Wascally](https://github.com/LeanKit-Labs/wascally) documentation for information
on configuring RabbitMQ connections.

### Send / Receive

The Send / Receive object pair uses a direct exchange inside of RabbitMQ, 
allowing you to specify the binding key.

Set up a Sender:

```js
var Rabbus = require("rabbus");

function SomeSender(rabbus){
  Rabbus.Sender.apply(this, rabbus, {
    exchange: "send-rec.exchange",
    routingKey: "send-rec.key",
    messageType: "send-rec.messageType"
  });
}

var sender = new SomeSender(Rabbit);
var message = {
  place: "world"
};

sender.send(msg, function(){
  console.log("sent a message");
});
```

Set up a Receiver:

```js
var Rabbus = require("rabbus");

function SomeReceiver(rabbus){
  Rabbus.Receiver.apply(this, rabbus, {
    exchange: "send-rec.exchange",
    queue: "send-rec.queue",
    routingKey: "send-rec.key",
    messageType: "send-rec.messageType"
  });
}

var receiver = new SomeReceiver(Rabbit);

receiver.receive(function(message, done){
  console.log("hello", message.place);
  done();
});
```

### Publish / Subscribe

The Publish / Subscribe object pair uses a fanout exchange inside of RabbitMQ, 
allowing you to have as many subscribers as you need. Think of pub/sub as an
event that gets broadcast to anyone that cares, or no one at all if no one is
listening.

Set up a Publisher:

```js
var Rabbus = require("rabbus");

function SomePublisher(rabbus){
  Rabbus.Publisher.apply(this, rabbus, {
    exchange: "pub-sub.exchange",
    routingKey: "pub-sub.key",
    messageType: "pub-sub.messageType"
  });
}

var publisher = new SomePublisher(Rabbit);
var message = {
  place: "world"
};

publisher.publish(msg, function(){
  console.log("published an event!");
});
```

Set up a Subscriber:

```js
var Rabbus = require("rabbus");

function SomeSubscriber(rabbus){
  Rabbus.Subscriber.apply(this, rabbus, {
    exchange: "pub-sub.exchange",
    queue: "pub-sub.queue",
    routingKey: "pub-sub.key",
    messageType: "pub-sub.messageType"
  });
}

var sub1 = new SomeSubscriber(Rabbit);
sub1.subscribe(function(message){
  console.log("1: hello", message.place);
});

var sub2 = new SomeSubscriber(Rabbit);
sub2.subscribe(function(message){
  console.log("2: hello", message.place);
});

var sub3 = new SomeSubscriber(Rabbit);
sub3.subscribe(function(message){
  console.log("3: hello", message.place);
});
```

### Request / Response

The request/response pair uses a fanout exchange right now, but this will
likely be changed to topic queue in the near future.

With a request/response setup, you can send a request for information and
respond to it. A private, temporary queue will be created for the response
message, ensuring that it gets back to the requester correctly.

Set up a Requester

```js
var Rabbus = require("rabbus");

function SomeRequester(rabbus){
  Rabbus.Requester.apply(this, rabbus, {
    exchange: "req-res.exchange",
    messageType: "req-res.messageType"
  });
}

var requester = new SomeRequester(Rabbit);

var msg = {};
requester.request(msg, function(response, done){
  console.log("Hello", response.place);
  done();
});
```

Set up a Responder:

```js
var Rabbus = require("rabbus");

function SomeResponder(rabbus){
  Rabbus.Responder.apply(this, rabbus, {
    exchange: "req-res.exchange",
    queue: "req-res.queue",
    routingKey: "req-res.key",
    limit: 1,
    messageType: "req-res.messageType"
  });
}

var responder = new SomeResponder(Rabbit);

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

## Legalese

Unless otherwise noted, Rabbus is Copyright &copy;2014 Muted Solutions, LLC. All Rights Reserved. 

Rabbus is distributed under the [MIT license](http://mutedsolutions.mit-license.org).
