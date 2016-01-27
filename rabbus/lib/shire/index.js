var Queue = require("./queue");

// Shire Middleware System
// -----------------------

function Shire(){
  this.middleware = new Queue();
  this.afterFuncs = new Queue();
  this.errorFuncs = new Queue();
}

// Methods
// -------

Shire.prototype.add = function(fn){
  this.middleware.add(fn);
};

Shire.prototype.addAfter = function(fn){
  this.afterFuncs.add(fn);
};

Shire.prototype.addErrorHandler = function(fn){
  this.errorFuncs.add(fn);
};

Shire.prototype.process = function(message, properties, actions){
  doStuff.call(this, this.middleware.clone(), message, properties, actions, () => {
    doStuff.call(this, this.afterFuncs.clone(), message, properties, actions, () => {
      return;
    });
  });
};

// Helpers
// -------

function doStuff(queue, message, properties, actions, done){
  var errFuncs = this.errorFuncs.clone();
  function next(err){
    if (err) {
      doError(errFuncs, err, message, properties, actions, done);
    } else {
      iterate(queue, message, properties, actions, next, done);
    }
  }

  next();
}

function doError(queue, err, message, properties, actions, done){
  function next(){
    console.log("ERRRRRR");
    iterate(queue, err, message, properties, actions, next, done);
  }

  next();
}

function iterate(queue){
  var args = Array.prototype.slice.call(arguments, 1);
  var done = args.pop();

  var fn = queue.next;
  if (!fn) { 
    return done(); 
  }

  fn.apply(undefined, args);
}

// Exports
// -------

module.exports = Shire;
