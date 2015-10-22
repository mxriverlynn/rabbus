var SendReceiveDefaults = {
  exchange: {
    type: "direct",
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

module.exports = SendReceiveDefaults;
