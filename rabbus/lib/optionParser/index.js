var _ = require("underscore");

// Option Parser
// -------------

var OptionParser = {

  parse: function(options, defaults){
    defaults = defaults || {};
    options = deepClone(options);

    options.exchange = parseOptions(options.exchange, defaults.exchange);
    options.queue = parseOptions(options.queue, defaults.queue);
    
    return options;
  }

};

// Helpers
// -------

function parseOptions(options, defaults, name, attr){
  var hasOptions = !!options;
  if (hasOptions) {
    options = stringOrObject(options, name, attr);
  }

  var hasDefaults = !!defaults;
  if (hasDefaults){
    options = _.defaults(options, defaults);
  }
  return options;
}

function stringOrObject(options){
  if (!_.isObject(options)){
    var value = options;
    options = {
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
