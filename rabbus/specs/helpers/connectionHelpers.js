var rabbit = require("rabbot");
var config = require("../config");

beforeAll(function(done){
  rabbit.configure({ connection: config })
  .then(() => { 
    done();
  })
  .catch(function(err){
    console.log(err);
    if (err.stack){
      console.log(err.stack);
    }
    process.exit();
  });
});

afterAll(function(done){
  var shutdown = rabbit.shutdown();
  shutdown.catch(function(err){
    console.log(err.stack);
    done();
  });
  done();
});

process.on("unhandledRejection", function(err){
  console.log(err.stack);
  process.exit();
});
