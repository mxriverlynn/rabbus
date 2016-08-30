# Request / Response

The request/response pair uses a "topic" exchange. You should set the
routing key via the "routingKey" parameter, but it will default to the 
message type if none is supplied.

With a request/response setup, you can send a request for information and
respond to it. A private, temporary queue will be created for the response
message, ensuring that it gets back to the requester correctly.

## Set Up A Requester

```js
// define a requester
// ------------------

var util = require("util");
var Rabbus = require("rabbus");
var rabbot = require("rabbot");

function SomeRequester(){
  Rabbus.Requester.call(this, rabbot, {
    exchange: "req-res.exchange",
    routingKey: "req-res.key"
  });
}

util.inherits(SomeRequester, Rabbus.Requester);

// make a request
// --------------

var requester = new SomeRequester(Rabbus);

var msg = {};

requester.request(msg, function(response){
  console.log("Hello", response.place);
});
```

### Requester Options

The following options are available when configuring a requester:

* **exchange** (string): name of the exchange to create and publish to
* **exchange** (object): object literal with options for the exchange
  * **name** (string): name of the exchange to create and publish to
  * **type** (string): type of exchange to use. default is `topic`.
  * **autoDelete** (boolean): delete this exchange when there are no more connections using it. default is `false`.
  * **durable** (boolean): this exchange will survive a shut down / restart of RabbitMQ. default is `true`.
  * **persistent** (boolean): messages published through this exchange will be saved to disk / survive restart of RabbitMQ. default is `true`.
* **messageType** (string): *optional* the type of message being published. ([See below.](#the-messagetype-attribute))
* **routingKey** (string): the routing key to use for the published message

## Set up a Responder

```js
// define a responder
// ------------------

var util = require("util");
var Rabbus = require("rabbus");
var rabbot = require("rabbot");

function SomeResponder(){
  Rabbus.Responder.call(this, rabbot, {
    exchange: "req-res.exchange",
    queue: {
      name: "req-res.queue",
      limit: 1
    },
    routingKey: "req-res.key"
  });
}

util.inherits(SomeResponder, Rabbus.Responder);

// handle a request and send a response
// ------------------------------------

var responder = new SomeResponder(Rabbus);

responder.handle(function(message, properties, actions, next){
  actions.reply({
    place: "world"
  });
});
```

Note that the responder does the "work" but sends a response back to the
requester, instead of just saying that the work is done. This allows the
requester to receive the response and do something with it.

Also note the "limit" option for the Resonder. This is the "prefetch" limit
for the queue, allowing you to limit the amount of work being done concurrently.

### Responder Options

See Requester options for Exchange definition. The exchange
and queue that you specify in these options will be used to
create the binding between the two.

* **exchange**: (see Requester for options)
* **queue** (string): name of the queue to create and subscribe to
* **queue** (object): object literal with options for the queue
  * **name** (string): name of the queue to create and subscriber to
  * **autoDelete** (boolean): delete this queue when there are no more connections using it. default is `false`.
  * **durable** (boolean): this queue will survive a shut down / restart of RabbitMQ. default is `true`.
* **messageType** (string): *optional* the type of message to handle for this subscriber instance. ([See below.](#the-messagetype-attribute))
* **routingKey** (string): the routing key to use for binding the exchange and queue
* **routingKey** ([string]): an array of string for the routing key to use for binding the exchange and queue
