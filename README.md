# balanced.js #

Javascript client library for Balanced that tokenizes cards and bank accounts.

## Documentation ##

https://docs.balancedpayments.com/current/#balanced-js

## Prerequisites ##

    node.js (version >= 0.8.0)

## Installation ##

    git clone git@github.com:nodesocket/balanced-js.git
    cd balanced-js
    npm install -g grunt-cli
    npm install

## Building ###

#### Both JS and Proxy ####

    grunt or grunt build

#### Just JS ####

    grunt build-js

#### Just Proxy ####

    grunt build-proxy

## Cleaning ##

#### Both JS and Proxy ####

    grunt clean

#### Just JS ####

    grunt clean-js

#### Just Proxy ####

    grunt clean-proxy

## Running Tests ##

    grunt test

## View Example HTML Page ##

    open ./example/index.html
