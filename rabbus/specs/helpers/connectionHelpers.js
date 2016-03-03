var rabbit = require("rabbot");
var config = require("../config");

beforeAll(function(done){
  console.log("OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO");
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
  console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
  rabbit.closeAll().then(done);
});

process.on("unhandledRejection", function(err){
  console.log(err.stack);
  process.exit();
});
