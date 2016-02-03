## Contributing To Rabbus

If you would like to contribute to Rabbus, the easiest way is to open an issue
in the issues list and start a discussion. 

The code is always open to pull requests, feature requests, and other forms
of input as well. 

## Reporting Issues

First and foremost, please report any issues you find with Rabbus. I would rather
have an issue reported with insuficient information, than not have it reported
at all.

However, I do prefer to have a common set of useful information when issues are
reported:

* what you're trying to do
* *why* you're trying to do it
* sample code to reproduce the problem
* expected output
* actual output

More information is better, but again, I would rather have less information than
nothing at all.

## Submitting Pull Requests

If you have a feature you would like to add, a fix to make, a change of any
sort, please send in a pull request! 

I'll review it, discuss it as necessary, and we'll see what we can do to get
your code into the next release.

There are a few things, regarding code, that I would like to discuss.

### Code Formatting

I use 2 space indentation, per most JavaScript libraries and standards out
there. 

If you would like to contribute code, I suggest using the [EditorConfig](http://editorconfig.org/)
plugin for your editor of choice. I have included a basic .editorConfig file
in this repository to help.

### Linting / JSHint

I want to see clean code, generally, but that is a very nebulous term that
has a lot of confusion behind it.

To help keep things clean and consistent, though, I use JSHint to lint all code
in Rabbus.

Please use Grunt to run JSHint over the codebase before sending in your PR. 

### Tests / Specs

Rabbus is fairly well tested, with test automation through grunt. Please use
the test suite to make sure your code changes don't break things. 

Whenever possible, write a new test or adjust a test for any new or changed 
code, as well. However this isn't a requirement. If you're not comfortable
writing tests, don't worry about it. 

I'd rather see a pull request or suggested change with no test, so that we can
have a conversation about it and get your needs taken care of.

#### Running The Specs

If you do want to run the tests, you can do so with grunt.

`npm install`
`grunt specs`

or

`grunt` 

will run the file system watcher and run tests for you.

Be sure to confiure a RabbitMQ virtual host that matches the configuration
found at `rabbus/specs/config/index.json`

## Any Other Questions?

I'm always open to feedback on how to contribute, and I would rather hear
from you than not! 

Please get in touch and let me know how I can help... 

and as you interact with Rabbus and the surrounding community, keep this
next secion in mind at all times.

## An Open And Welcoming Community

Open source should be something that anyone and everyone can be involved in,
no matter who they are, what their life or identity or anything about them is.

Everyone is welcome here, and everyone should feel comfortable being a part of
this project. 

To that end, I expect everyone that interacts with this project or anyone
else interested in it, to remember the [code of conduct](CODE_OF_CONDUCT.md).
This will be enforced. It is not negotiable or up for discussion.
