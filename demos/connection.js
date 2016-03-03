var util = require("util");
var rabbot = require("rabbot");

var config = require("../rabbus/specs/config");

function connect(cb){
  rabbot
    .configure({ connection: config })
    .then(cb)
    .catch(function(err){
      setImmediate(function(){ throw err; });
    });
}

process.once("SIGINT", function(){
  exit();
});

process.on("unhandledException", function(err){
  console.log(err);
  exit();
});

function exit(){
  console.log("");
  console.log("shutting down ...");
  rabbot.closeAll().then(function(){
    process.exit();
  });
}

module.exports = connect;
