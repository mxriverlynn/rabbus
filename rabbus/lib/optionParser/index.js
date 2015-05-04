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
    options = stringOrObject(options, "exchange", "name");
    options.exchange = _.defaults(options.exchange, defaults);
    return options;
  },

  parseQueue: function(options, defaults){
    options = stringOrObject(options, "queue", "name");
    options.queue = _.defaults(options.queue, defaults);
    return options;
  },
};

// Helpers
// -------

function stringOrObject(options, name, attribute){
  if (!_.isObject(options[name])){
    var value = options[name];
    options[name] = {
      name: value
    };
  }

  return options;
}

function deepClone(obj){
  return JSON.parse(JSON.stringify(obj));
}

// Exports
// -------

module.exports = OptionParser;
