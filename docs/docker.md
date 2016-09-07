# Docker Configuration for Rabbus

Rabbus uses Docker for test automation, and general development
efforts. This greatly simplifies the process as it prevents
you from having to install, configure and maintain specific
versions of RabbitMQ, Node.js, and other libraries.

> If you need help getting Docker up and running, check out
> [my Docker screencasts at WatchMeCode](https://watchmecode.net/series/docker). The series includes
> free installation episodes.

You can find all the details of the configuration in the
[dockerfile](/dockerfile) and [docker-compose](/docker-compose.yml) file.

## Basic Configuration

The core docker image for Rabbus is built on the [mhart/alpine-node:4](https://github.com/mhart/alpine-node/)
image, using the latest Node.js v4 tag.

This image provides the core services needed for Node.js, while
maintaining a small / lightweight footprint.

You may wish to change this image to use the official Node.js,
but the image size will be significantly larger.

## Setup: Docker-Compose

Once you have Docker installed and running, use `docker-compose`
to setup and run the tests.

`docker-compose up`

With Docker Compose, you'll get:

* A Node.js container for Rabbus
* A RabbitMQ container
* A Rabbus network (bridge)
* Volume mounts for core Rabbus files

The startup script for the Rabbus container will `npm install`
everything you need, into the container.

You can see the complete configuration in the [docker-compose](/docker-compose.yml) file

Once you have run `docker-compose up`, you will see the log
output of both the `rabbitmq` and `rabbus` containers. 

## Editing Rabbus Code / Specs

The Rabbus configuration for Docker-Compose mounts all required
folders and files into Docker volumes.

Once you have the containers up and running with Docker-Compose,
you can edit the files directly in the Rabbus folders on your
computer - no need to go into the Docker container to edit.

In general, the mounted files / folders include

* `./demos`
* `./rabbus`
* misc other bits

Edit any file in the `demos` folder, `rabbus/lib`, or 
`rabbus/specs` and the changes will be immediately reflected
in the docker container.

To see a complete list of which files and folders are mounted
in the container, please see [the docker-compose file](/docker-compose.yml).

## Execution: Grunt-Watch

For the test suite (and other features), Rabbus uses Grunt.

The Docker configuration has already installed Grunt and
the required modules, include a file system watcher to run
the specs any time code or spec files are changed.

With your favorite editor, you can edit and save any file
in the mounted volumes. Once you write a file to disk, you 
should see output similar to this in the docker container
logs:

```
rabbus      | >> File "rabbus/specs/helpers/connectionHelpers.js" changed.
rabbus      | Running "jasmine_nodejs:rabbus" (jasmine_nodejs) task
rabbus      | 
rabbus      | >> Executing 40 defined specs...
rabbus      | 
rabbus      | Test Suites & Specs:

[ ... ]

rabbus      | Suites:  43 of 43
rabbus      | Specs:   40 of 40
rabbus      | Expects: 52 (0 failures)
rabbus      | Finished in 7.950 seconds
rabbus      | 
rabbus      | >> Successful!
rabbus      | 
rabbus      | Done.
```

## Advanced Debugging / Techniques

If you need to anything more than just running the grunt watch
tasks, you can `docker exec` into a shell in the running container:

`docker exec -it rabbbus /bin/sh`

Now you have complete shell access to the rabbus container,
including node.js, grunt, etc.

