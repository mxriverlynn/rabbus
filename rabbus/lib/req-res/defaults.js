var RequestResponseDefault = {
  exchange: {
    type: "topic",
    autoDelete: false,
    durable: true,
    persistent: true
  },
  queue: {
    autoDelete: false,
    durable: true,
    noBatch: false,
    subscribe: false
  },
  routingKey: ""
};

module.exports = RequestResponseDefault;
