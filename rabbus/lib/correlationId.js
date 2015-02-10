var correlationId = {

  resolve: function(expected, actual, cb){
    var msgHasCorrId = !!actual;
    var corrIdMatches = (expected === actual);
    var success = (corrIdMatches || (!msgHasCorrId));

    var result = {
      hasCorrelationId: msgHasCorrId,
      matches: corrIdMatches,
      success: success
    };

    cb(result);
  }

};

module.exports = correlationId;
