var _ = require("underscore");

// Option Parser
// -------------

var OptionParser = {

  parse: function(options, defaults){
    defaults = defaults || {};
    options = deepClone(options);

    options = this.parseExchange(options, defaults.exchange);
    options = this.parseQueue(options, defaults.queue);
    
    return options;
  },

  parseExchange: function(options, defaults){
    if (!_.isObject(options.exchange)){
      var exchangeName = options.exchange;
      options.exchange = {
        name: exchangeName
      };
    }

    options.exchange = _.defaults(options.exchange, defaults);
    return options;
  },

  parseQueue: function(options, defaults){
    if (!_.isObject(options.queue)){
      var queueName = options.queue;
      options.queue = {
        name: queueName
      };
    }

    options.queue = _.defaults(options.queue, defaults);
    return options;
  }
};

// Helpers
// -------

function deepClone(obj){
  return JSON.parse(JSON.stringify(obj));
}

// Exports
// -------

module.exports = OptionParser;
