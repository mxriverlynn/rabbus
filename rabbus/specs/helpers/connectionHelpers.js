var rabbit = require("wascally");
var config = require("../config");

rabbit.configure({
  connection: config
});
