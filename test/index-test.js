var vows = require('vows');
var assert = require('assert');
var util = require('util');
var xing = require('passport-xing');


vows.describe('passport-xing').addBatch({
  
  'module': {
    'should report a version': function (x) {
      assert.isString(xing.version);
    },
  },
  
}).export(module);
