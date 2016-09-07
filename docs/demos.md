# Rabbus Demos

Rabbus includes demos of the three core patterns that it
provides:

* Send / Receive
* Publish / Subscribe
* Request / Response

Each of these demos is found in the [/demos](/demos) folder
of the repository.

## RabbitMQ Connection

The core RabbitMQ connection for all demos is handled from
the `demos/connection.js` file.

However, this file defers to the connection configuration
found in `rabbus/specs/config/index.json`. 

To change the
connection information used by the demos, you can change either
of the above files.

## Executing The Demos

**Note:** Change directory into the folder for the demo you wish to run.

### Send/Receive

Located in the [demos/send-receive](demos/send-receive) folder.

Demonstrate the send/receive pattern, to send a single message
to a single receiver.

Open a console window and run:

* `node send.js`

If you examine your RabbitMQ queues, you'll see a message
sitting in a queue, waiting to be processed.

Now run the receiver:

* `node receive.js`

You will see the message that was sent.

### Pub/Sub

Located in the [demos/pub-sub](demos/pub-sub) folder.

Demonstrate the publish/subscribe pattern, with multiple
subscribers receiving one published message.

Open at least two console windows for subscribers, and run
the following in each window:

* `node subscriber.js`

Now that you have multiple subscribers, open one additional
console window and run the following to publish a message:

* `node publish.js`

Note that each subscriber received a copy of the message.

To see the net effect of the pub/sub pattern, do this:

0. Stop one of the subscribers
0. Publish another message
0. Note the still-running subscriber(s) received the message
0. Re-start the stopped subscriber
0. Note the re-started subscriber **does not** receive the message

Only subscribers that are active when the message is published,
will receive the message. This is intentional - it is the pub/sub
pattern.

### Request/Response

Located in the [demos/request-response](demos/request-response) folder.

Demonstrate the request/response pattern with a request being
made for a location, and a response being sent with the
location information.

Open a console window and run:

* `node response.js`

This will set up the responder - the code that recieves the
original message and sends back a response.

Now open a second console window and run this:

* `node request.js`

Here, you will send a message. The `response.js` process will
receive it and send a response back. You should see the
response printed to the console of the `request.js` process.
