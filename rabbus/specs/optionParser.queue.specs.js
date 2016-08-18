var optionParser = require("../lib/optionParser");

describe("option parser: queue - ", function(){
  var qName = "q.name";

  describe("when given an queue as a string", function(){
    var result;
    
    beforeEach(function(){
      var options = {
        queue: qName
      };

      result = optionParser.parse(options);
    });

    it("should return an queue.name", function(){
      expect(result.queue.name).toBe(qName);
    });
  });

  describe("when given an queue as an object with a name", function(){
    var result;
    
    beforeEach(function(){
      var options = {
        queue: {
          name: qName
        }
      };

      result = optionParser.parse(options);
    });

    it("should return a queue.name", function(){
      expect(result.queue.name).toBe(qName);
    });
  });

  describe("when not given an queue name or object", function(){
    var result;
    
    beforeEach(function(){
      var options = {};
      result = optionParser.parse(options);
    });

    it("should return an empty queue", function(){
      expect(result.queue).toBe(undefined);
    });
  });

  describe("when given default queue settings with no queue options", function(){
    var result;
    var defaults = {
      queue: {
        durable: true,
        persistent: true,
        foo: "bar"
      }
    };

    beforeEach(function(){
      var options = {};
      result = optionParser.parse(options, defaults);
    });

    it("should return an empty queue", function(){
      expect(result.queue).toBe(undefined);
    });
  });

  describe("when given default queue settings with overrides", function(){
    var result;
    var defaults = {
      queue: {
        durable: true,
        persistent: true,
        foo: "bar"
      }
    };

    beforeEach(function(){
      var options = {
        queue: {
          name: "foo",
          durable: false
        }
      };
      result = optionParser.parse(options, defaults);
    });

    it("should override the defaults with the provided values", function(){
      expect(result.queue.durable).toBe(false);
      expect(result.queue.name).toBe("foo");
    });

    it("should retain defaults that were not overridden", function(){
      expect(result.queue.persistent).toBe(true);
      expect(result.queue.foo).toBe("bar");
    });
  });

});
