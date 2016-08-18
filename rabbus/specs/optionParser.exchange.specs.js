var optionParser = require("../lib/optionParser");

describe("option parser: exchange - ", function(){

  describe("when given an exchange as a string", function(){
    var result;
    var ex = "ex.name";
    
    beforeEach(function(){
      var options = {
        exchange: ex
      };

      result = optionParser.parse(options);
    });

    it("should return an exchange.name", function(){
      expect(result.exchange.name).toBe(ex);
    });
  });

  describe("when given an exchange as an object with a name", function(){
    var result;
    var ex = "ex.name";
    
    beforeEach(function(){
      var options = {
        exchange: {
          name: ex
        }
      };

      result = optionParser.parse(options);
    });

    it("should return an exchange.name", function(){
      expect(result.exchange.name).toBe(ex);
    });
  });

  describe("when not given an exchange name or object", function(){
    var result;
    
    beforeEach(function(){
      var options = {};
      result = optionParser.parse(options);
    });

    it("should return an empty exchange config", function(){
      expect(result.exchange).toBe(undefined);
    });
  });

  describe("when given default exchange settings with an empty exchange options", function(){
    var result;
    var defaults = {
      exchange: {
        durable: true,
        persistent: true,
        foo: "bar"
      }
    };

    beforeEach(function(){
      var options = {};
      result = optionParser.parse(options, defaults);
    });

    it("should return an empty exchange", function(){
      expect(result.exchange).toBe(undefined);
    });
  });

  describe("when given default exchange settings with overrides", function(){
    var result;
    var defaults = {
      exchange: {
        durable: true,
        persistent: true,
        foo: "bar"
      }
    };

    beforeEach(function(){
      var options = {
        exchange: {
          name: "foo",
          durable: false
        }
      };
      result = optionParser.parse(options, defaults);
    });

    it("should override the defaults with the provided values", function(){
      expect(result.exchange.durable).toBe(false);
      expect(result.exchange.name).toBe("foo");
    });

    it("should retain defaults that were not overridden", function(){
      expect(result.exchange.persistent).toBe(true);
      expect(result.exchange.foo).toBe("bar");
    });
  });

});
