# Toplogy Management w/ Rabbus

Rabbus uses the [Rabbot](http://github.com/arobson/rabbot) library under the hood and
can take full advantage of the JSON / object-literal based configuration of Rabbot.

Rabbus, however, does require each message producer and consumer to be configured with
the correct exchange, queue and binding information (as needed).

To allow the most flexibility in building a topology at runtime vs using an existing
topology, Rabbus provides a `Topology` object. You can either create this object
yourself, or you can use the implicit Topology creation found in any of the
producer / consumer objects.

## Implicit Topology Creation

When you create a message producer or consumer with Rabbus, and supply an object literal
for the configuration, Rabbus will implicitly convert this into the required Topology
object.

For example, a Sender object can be configured like this:

```js
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
```

When that `SomeSender` object is instantiated, the implicit object literal configuration
will be turned into a `Topology` object. The topology will then be executed against
the RabbitMQ connection, to create the needed exchange, queues and bindings (as defined).

## Use An Existing Topology

If you wish to use an existing exchange, queue or binding, without attempting to re-build
it at runtime, you can do so by creating your own Topology instance.

The topology definition uses the same format as the message producer / consumer configuration. 
Once you have the topology object defined, pass it into the producer / consumer object
in place of the configuration.

```js
var senderTop = new Rabbus.Topology(rabbot, {
  exchange: "send-rec.ex",
  routingKey: "send-rec.key"
});

function SomeSender(){
  Rabbus.Sender.call(this, rabbot, senderTop);
}

util.inherits(SomeSender, Rabbus.Sender);
```

In this example, the `SomeSender` object will attach to the existing `send-rec.ex` exchange, and will not
attempt to create the exchange.

## Execute a Topology, Manually

You may also wish to execute your topology definition against RabbitMQ, manually. To do this, use the 
`.execute` method of the Topology object.

```js
var senderTop = new Rabbus.Topology(rabbot, {
  exchange: "send-rec.ex",
  routingKey: "send-rec.key"
});

senderTop.execute(function(err, config){
  // check for an error
  // if no err, do some work with the topology
});
```

The `config` parameter of the callback is the expanded configuration of the topology, including a full `.exchange` and/or `.queue` configuration object.
