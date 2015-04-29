var _ = require("underscore");

// Option Parser
// -------------

var OptionParser = {

  parse: function(options, defaults){
    defaults = defaults || {};
    options = deepClone(options);

    options = this.parseExchange(options, defaults.exchange);
    
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

  subscriber: function(originalOptions){
    var options = deepClone(originalOptions);

    if (_.isString(options.queue)){
      var queueName = options.queueName;
      options.queue = {
        name: queueName
      };
    }

    options.queue = _.defaults(options.queue, {
      autoDelete: false,
      limit: options.limit,
      noBatch: false
    });

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
