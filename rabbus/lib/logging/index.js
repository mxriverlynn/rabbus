var postal = require("postal");
var whistlepunk = require("whistlepunk");

var config =  {
  adapters: {
    stdOut: {
      level: 0
    }
  }
};

var loggerFactory = whistlepunk(postal, config);

function logger(ns){
  ns = ns || "rabbus";
  var l = loggerFactory(ns);
  return l;
}

module.exports = logger;
