# Extending Rabbus w/ Middleware

Rabbus message Producers and Consumers use a middleware system that allows you 
to extend the capabilities of the bus. To use it, call the `.use` method of any 
given message Consumer object (Receiver, Responder, Subscriber) or Producer 
(Sender, Requester, Publisher). 

The `use` method takes a callback function with a signature that varies depending
on whether you're using a producer or consumer.

## Consumer Middleware

The `use` method on consumers takes a callback with this signature:

```js
consumer.use(function(message, properties, actions, next){

});
```

The parameters are as follows:

* **message**: the message body
* **properties**: the properties of the message, including headers, etc.
* **actions**: an object containing various methods for interaction with the RabbitMQ message, and to continue the middleware chain
  * **ack()**: the message is completely processed. acknowledge to the server. prevents any additional middleware from running
  * **nack()**: the message cannot be processed, and should be re-queued for later. prevents any additional middleware from running
  * **reject()**: the message cannot be processed and should not be re-queued. be sure you have a dead-letter queue before using this. prevents any additional middleware from running
  * **reply(msg)**: send a reply back to the requester, during a request/response scenario. prevents any additional middleware from running
* **next()**: this middleware is done, and the next one can be called; call `next(err)` to forward an error to error handling middleware functions

### Consumer Middleware Examples

As an example, you could log every message that gets sent through your consumer:

```js
var mySubscriber = new MySubscriber();

mySubscriber.use(function(message, properties, actions, next){

  console.log("Got a message. Doing stuff with middleware.");
  console.log(message);

  // allow the middleware chain to continue
  next();
});
```

In another scenario, you may want the middleware to `nack` the message because
some condition is not yet met.

```js
var rec = new SomeReceiver();

rec.use(function(message, properties, actions, next){

  // check some conditions
  if (message.someData && someOtherSystem.stuffNotReady()){

    // conditions not met. nack the message and try again later
    actions.nack();

  } else {

    // everything is good to go, allow the next middleware to run
    next();

  }
});
```

**WARNING:** If you forget to call `next()` or one of the other actions,
your message will be stuck in limbo, unacknowledged. 

## Producer Middleware

The `use` method on consumers takes a callback with this signature:

```js
producer.use(function(message, headers, next){

});
```

The parameters are as follows:

* **message**: the message body, which you can transform as needed
* **headers**: the headers of the message, which can be altered in any way you need
* **next()**: this middleware is done, and the next one can be called; call `next(err)` to forward an error to the error handlers

### Producer Middleware Examples

You can easily add / change headers or the actual message content in your
producer middleware. Any change you make to the `message` or `headers` objects
will make their way to the next middleware, and ultimately to RabbitMQ as part
of the message.

```js
var myPub = new MyPublisher();

myPub.use(function(message, headers, actions, next){

  var hasFoo = !!(message.foo);

  if (hasFoo){
    // add data to the message body
    message.bar = "foo is there";
    message.baz = true;
  }

  // add a header to the message properties
  headers.hasFoo = hasFoo;

  // allow the middleware chain to continue
  next();
});
```

**WARNING:** If you forget to call `next()` in your middleware,
the message will never be published. While this is generally dangerous, it can
be used to stop messages that should not be sent.

## Order Of Middleware Processing

Whether you are using a Producer or Consumer, middleware is processed in the 
order in which it was added: first in, first out.

For example, if you have a consumer that handles a message and then adds
some middleware, you will have the middleware processed first.

```js
responder.handle("message.type", function(msg, properties, actions, next){
  console.log("handler fires last");
  actions.ack();
});

responder.use(function(msg, props, actions, next){
  console.log("first middleware");
  next();
});

responder.use(function(msg, props, actions, next){
  console.log("second middleware");
  next();
});

responder.use(function(msg, props, actions, next){
  console.log("third middleware");
  next();
});
```

When this subscriber receives a message to handle, you will see the following:

```
first middleware
second middleware
third middleware
handler fires last
```

It is recommended you add the middleware before adding the `handle`
call. Adding middleware after calling `handle` could allow messages to be
handled before the middleware is in place.


