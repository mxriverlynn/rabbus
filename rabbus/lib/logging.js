var postal = require("postal");
var whistlepunk = require("whistlepunk");

var config =  {
  adapters: {
    stdOut: {
      level: 4
    },
    debug: {
      level: 4
    }
  }
};

var loggerFactory = whistlepunk(postal, config);

function logger(ns){
  var ns = ns || "rabbus";
  var logger = loggerFactory(ns);
  return logger;
}

module.exports = logger;
