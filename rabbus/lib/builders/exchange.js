// Exchange Builder
// ----------------

function ExchangeBuilder(wascally){
  this.wascally = wascally;
}

// Public API
// ----------

ExchangeBuilder.prototype.build = function(type, options){
  console.log(type, options);
  type = options.exchange.type;
  var name = options.exchange.name;

  console.log("---------------------");
  console.log(name, type);

};

// Exports
// -------

module.exports = ExchangeBuilder;
