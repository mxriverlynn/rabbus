var PubSubDefaults = {
  exchange: {
    autoDelete: false,
    durable: true,
    persistent: true
  },
  queue: {
    autoDelete: false,
    durable: true,
    noBatch: false,
    subscribe: false
  }
};

module.exports = PubSubDefaults;
