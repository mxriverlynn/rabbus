# Error Handling

Rabbus uses a [middleware structure](middleware.md) to both produce and consume 
messages, similar to that of Express.js. As such, errors are generally 
pushed through the `next(err)` call, and handled through an error handling 
middleware function.

```js
myProducer.use(function(err, message, properties, actions, next){

  // handle the error, here
  console.log(err.stack);

});
```

## Non-Middleware Errors

Each of the objects in Rabbus will also emit an "error"
message when an error occurs outside of the middleware stack. 
You can use standard NodeJS EventEmitter functions to 
subscribe / unsubscribe the error events.

```js
var sub = new Subscriber(...);
sub.on("error", function(err){
  // do something with the err object, here
});
```
