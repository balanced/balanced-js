# balanced.js #

Javascript client library for Balanced that tokenizes cards and bank accounts. Read more about tokenization and how balanced.js works at https://docs.balancedpayments.com/current/overview.html#balanced-js.

## Prerequisites ##

    node.js (version >= 0.8.0)

## Installation ##

    git clone git@github.com:balanced/balanced-js.git
    cd balanced-js
    git checkout rev1
    npm install -g grunt-cli
    npm install -g karma
    npm install

## Building ###

    grunt

or

    grunt build

## Cleaning (deletes builds) ##

    grunt clean

## Running Example ##

![Screenshot](http://i.imgur.com/M7Wd9rq.png)

Creates a node.js connect http web server *(port 3000)* and blocks, waiting for requests. Serves from `/build`.

    grunt serve

## Running Tests ##

    grunt test

## Deploying To S3 ##

    grunt deploy

To view coverage reports view html files in `/report`.