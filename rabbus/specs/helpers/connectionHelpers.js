var rabbit = require("rabbot");
var config = require("../config");

beforeAll(function(done){
  rabbit.configure({ connection: config })
  .then(() => { 
    done();
  })
  .catch(function(err){
    console.log(err.stack);
    process.exit();
  });
});

afterAll(function(done){
  rabbit.closeAll().then(done);
});

process.on("unhandledRejection", function(err){
  console.log(err.stack);
  process.exit();
});
