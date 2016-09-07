# Running The Test Suite

The test suite is generally designed to run within Docker, though
it can be run without it.

> If you need help getting Docker up and running, check out
> [my Docker screencasts at WatchMeCode](https://watchmecode.net/series/docker). The series includes
> free installation episodes.

See the [Docker config documentation](/docs/docker.md) for more information
on the Docker configuration for Rabbus.

## Run The Test Suite With Docker

Rabbus uses Docker-Compose with mounted volumes so you can edit
the Rabbus files on your computer, with your favorite editor.

Use the following to edit and run the test suites:

0. `docker-compose up`
0. Open your favorite editor
0. Edit any file in `rabbus/lib` folder
0. Edit any file in `rabbus/specs` folder
0. Save any file changes
0. Watch grunt run the specs in the Docker containers

## Run The Test Suite Without Docker

Before you run the test suite, you need to make sure you have
all of the development dependency libraries installed.

* `npm install -g grunt-cli`
* `npm install`

To run the test suite, Rabbus uses a file system watcher from
within grunt. You only need to run the `grunt` command for
it to pick up the default task with the file system watcher.

* `grunt`

Now you can edit files in rabbus and it's specs. Saving files
will cause grunt to run the specs.

## Configure RabbitMQ Connection / vhost

To change the RabbitMQ connection configuration used in the
specs, edit the `rabbus/specs/config/index.json` file.

The default configuration assumes you are using Docker, but
you can change this file to connect to any RabbitMQ instance.
