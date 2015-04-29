var _ = require("underscore");

// Option Parser
// -------------

var OptionParser = {

  publisher: function(originalOptions){
    var options = deepClone(originalOptions);

    if (_.isString(options.exchange)){
      var exchangeName = options.exchange;
      options.exchange = {
        name: exchangeName
      };
    }

    options.exchange = _.defaults(options.exchange, {
      durable: true,
      persistent: true,
      autoDelete: !!options.exchange.autoDelete
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
