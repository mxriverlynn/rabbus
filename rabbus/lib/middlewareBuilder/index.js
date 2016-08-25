var GenericMiddleware = require("generic-middleware");

// Middleware Proxy
// ----------------
// Due to the way the producer#publish method works, middleware 
// cannot be pre-configured. It must be build at the last second, 
// when publishing the message. This object collects the middleware
// configuration and produces the actual middleware when needed

function Middleware(params){
  this.params = params;

  this.handlers = {
    methods: [],
    errorHandlers: []
  };
}

// Methods
// -------

Middleware.prototype.use = function(fn){
  // +2 for the "err" and "next" params
  var errorHandlerParamLength = this.params.length + 2; 
  var isErrorHandler = (fn.length === errorHandlerParamLength);

  if (isErrorHandler){
    this.handlers.errorHandlers.push(fn);
  } else {
    this.handlers.methods.push(fn);
  }
};

Middleware.prototype.build = function(finalFn){
  var genMid = new GenericMiddleware();
  genMid.setParams(this.params);

  this.handlers.methods.forEach((fn) => genMid.use(fn));
  this.handlers.errorHandlers.forEach((fn) => genMid.use(fn));

  if (finalFn){
    genMid.use(finalFn);
  }

  return genMid;
};

// exports
// -------

module.exports = Middleware;
