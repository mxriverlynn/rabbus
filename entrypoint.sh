#!/bin/sh

alias dir="ls -lai"

npm install -g grunt
npm install

grunt $@
