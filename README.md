# balanced.js #

Javascript client library for Balanced that tokenizes cards and bank accounts. Read more about tokenization and how balanced.js works at https://docs.balancedpayments.com/current/overview.html#balanced-js.

## Prerequisites ##

    node.js (version >= 0.8.0)

## Installation ##

    git clone git@github.com:balanced/balanced-js.git
    cd balanced-js
    npm install -g grunt-cli
    npm install

## Building ###

##### Both JS and Proxy #####

    grunt

or

    grunt build

##### Just JS #####

    grunt build-js

##### Just Proxy #####

    grunt build-proxy

## Cleaning (deletes builds) ##

##### Everything #####

    grunt clean

##### Just JS #####

    grunt clean-js

##### Just Proxy #####

    grunt clean-proxy

## Running Example ##

![Screenshot](http://i.imgur.com/M7Wd9rq.png)

Creates a node.js connect http web server *(port 3000)* and blocks, waiting for requests. Serves from `/build`.

    grunt serve

Then

    open http://localhost:3000

## Running Tests ##

    grunt test

Alternatively, you may run tests individually via:

    grunt serve
    open http://localhost:3000/test/runner.html
