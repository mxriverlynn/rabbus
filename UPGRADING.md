## Rabbus Upgrade Guide

The following items should be considered when upgrading
to / from various versions of Rabbus.

### From v0.7.0 to v0.8.0

There are a few major changes in how Rabbus works, starting with this version.

0. wascally is replaced with rabbot
0. the introduction of `Topology` to manage topologies in rmq

#### From wascally to rabbot

With v0.8.0, Rabbus is now built on top of the [rabbot](https://github.com/arobson/rabbot) library,
instead of the now deprecated wascally library.

Update your projects to include the latest v1.x rabbot:

`npm uninstall wascally`
`npm install rabbot --save`

#### Topologies

... need to write this


### From &lt;=v0.6.2 To v0.7.0

With v0.7.0, a completely new middleware system was introduced.
This allows Rabbus to be significantly more flexible, while also
creating a significant change in the API for message consumers, and for
message producer middleware. 

#### Updating Consumers

Generally speaking, where a consumer previously had code 
like this:

```js
someSubscriber.subscribe(function(message, done){

  // do stuff
  // ...
  
  // now it's done
  done();

});
```

The new API allows you to provide the full middleware
parameter list. You must also provide an explicit call to
`ack`, `nack` or `reject` a message, once processing is
complete.

```js
someSubscriber.subscribe(function(message, properties, actions, next){

  // do stuff
  // ...

  // now it's done
  actions.ack();

});
```

#### Updating Consumer Middleware

Along with the changes noted for consumers, above, middleware
functions now provide the same parameter list. Instead of
calling `actions.next()`, you must now call the `next()` function
provided as a fourth parameter.

```js
someSubscriber.use(function(message, properties, actions, next){

  // manipulate the message and/or properties here
  // ...

  // time to move on to the next middleware
  next();
});
```

Providing the `actions` parameter allows a middleware function
to `ack`, `nack` and `reject` a message.

If you need to raise an error from middleware, pass the error
object through the `next(err)` call.

#### Updating Producers

Producers generally did not have a change to the primary API,
however, the middleware API did change. There is no longer an
`actions` parameter in producer middleware. The new list of
producer middleware parameters are shown in this example:

```js
somePublisher.use(function(message, headers, next){

  // manipulate the message or message headers, here
  // ...

  // now it's done. move on to the next middleware
  next();

});
```
