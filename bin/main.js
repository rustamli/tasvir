#!/usr/bin/env node

var app = require('../app'),
    pjson = require('../package.json'),
    flattenMode = false,
    overwriteMode = false;

console.log('=== tasvir ' + pjson.version + ' ===');

process.argv.slice(2).forEach(function (val, index, array) {
    if (val === 'overwrite') {
        overwriteMode = true;
    }

    if (val === 'flattenMode') {
        flattenMode = true;
    }
});

if (flattenMode) {
  app.flatten(process.cwd());
} else {
  app.run(process.cwd(), overwriteMode);
}
