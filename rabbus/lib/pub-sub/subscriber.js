var util = require("util");
var os = require( "os" );
var _ = require("underscore");

var defaults = require("./defaults");
var Consumer = require("../consumer");

// Subscriber
// --------

function Subscriber(rabbit, options){
  if (_.isObject(options.queue)){
    options.queue.name = getUniqueName(options.queue.name);
  } else {
    options.queue = getUniqueName(options.queue);
  }

  Consumer.call(this, rabbit, options, defaults);
}

util.inherits(Subscriber, Consumer);

// Instance Methods
// ----------------

Subscriber.prototype.subscribe = Consumer.prototype.consume;

// Helpers
// -------
function getUniqueName(queueName){
  var host = os.hostname();
  var title = process.title;
  var pid = process.pid;
  return util.format('%s.%s.%s.%s.sub.queue', queueName, host, title, pid );
}
  
// Exports
// -------

module.exports = Subscriber;
