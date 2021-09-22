#!/usr/bin/env node
var path = require('path');
var converter = require(path.resolve(__dirname, '../src/html-to-ssml.js'));
converter(process.argv[2], process.argv[3]);
