var vows = require('vows');
var assert = require('assert');
var util = require('util');
var XingStrategy = require('passport-xing/strategy');


vows.describe('XingStrategy').addBatch({
  
  'strategy': {
    topic: function() {
      return new XingStrategy({
        consumerKey: 'ABC123',
        consumerSecret: 'secret'
      },
      function() {});
    },
    
    'should be named xing': function (strategy) {
      assert.equal(strategy.name, 'xing');
    },
  },
  
  'strategy when loading user profile': {
    topic: function() {
      var strategy = new XingStrategy({
        consumerKey: 'ABC123',
        consumerSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth.get = function(url, token, tokenSecret, callback) {
        if (url == 'https://api.xing.com/v1/users/me.json?fields=id,first_name,last_name,display_name,active_email,page_name,permalink,gender,photo_urls,birth_date') {
          var body = '{ "users": [ { "active_email": "jaredhanson@example.com", "id": "_XX0XXX00X", "first_name": "Jared", "last_name": "Hanson", "display_name": "Jared Hanson",  "gender": "m", "page_name": "Jared_HansonX", "birth_date": { "year": 1678, "month": 4, "day": 24 }, "photo_urls": { "large": "https://x1.xingassets.com/pubimg/users/c/140x185.jpg", "maxi_thumb": "https://x1.xingassets.com/pubimg/users/c/70x93.jpg", "medium_thumb": "https://x1.xingassets.com/pubimg/users/c/57x75.jpg", "mini_thumb": "https://x1.xingassets.com/pubimg/users/c/18x24.jpg", "thumb": "https://x1.xingassets.com/pubimg/users/c/30x40.jpg"}, "permalink": "https://www.xing.com/profile/Jared_HansonX"  } ]}';
          callback(null, body, undefined);
        } else {
          callback(new Error('Incorrect user profile URL'));
        }
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('token', 'token-secret', {}, done);
        });
      },
      
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'xing');
        assert.equal(profile.id, '_XX0XXX00X');
        assert.equal(profile.displayName, 'Jared Hanson');
        assert.equal(profile.name.familyName, 'Hanson');
        assert.equal(profile.name.givenName, 'Jared');
        assert.equal(profile.emails[0].value, 'jaredhanson@example.com');
        assert.equal(profile.profileUrl, 'https://www.xing.com/profile/Jared_HansonX');
        assert.equal(profile.photos.length, 5);
        assert.equal(profile.photos[0].type, 'large');
        assert.equal(profile.photos[0].value, 'https://x1.xingassets.com/pubimg/users/c/140x185.jpg');
        assert.equal(profile.photos[1].type, 'maxi_thumb');
        assert.equal(profile.photos[1].value, 'https://x1.xingassets.com/pubimg/users/c/70x93.jpg');
        assert.equal(profile.photos[2].type, 'medium_thumb');
        assert.equal(profile.photos[2].value, 'https://x1.xingassets.com/pubimg/users/c/57x75.jpg');
        assert.equal(profile.photos[3].type, 'mini_thumb');
        assert.equal(profile.photos[3].value, 'https://x1.xingassets.com/pubimg/users/c/18x24.jpg');
        assert.equal(profile.photos[4].type, 'thumb');
        assert.equal(profile.photos[4].value, 'https://x1.xingassets.com/pubimg/users/c/30x40.jpg');
        assert.equal(profile.gender, 'm');
        assert.equal(profile.birthday.getTime(), (new Date(Date.UTC(1678, 3, 24)).getTime());
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      },
    },
  },
  
  'strategy when loading user profile with email address': {
    topic: function() {
      var strategy = new XingStrategy({
        consumerKey: 'ABC123',
        consumerSecret: 'secret',
        profileFields: ['emails']
      },
      function() {});
      
      // mock
      strategy._oauth.get = function(url, token, tokenSecret, callback) {
        if (url == 'https://api.xing.com/v1/users/me.json?fields=id,first_name,last_name,display_name,active_email') {
          var body = '{ "users" : [ { "id": "_XX0XXX00X", "active_email": "jaredhanson@example.com", "first_name": "Jared", "last_name": "Hanson", "display_name": "Jared Hanson" } ]}';
          callback(null, body, undefined);
        } else {
          callback(new Error('Incorrect user profile URL'));
        }
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('token', 'token-secret', {}, done);
        });
      },
      
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'xing');
        assert.equal(profile.id, '_XX0XXX00X');
        assert.equal(profile.displayName, 'Jared Hanson');
        assert.equal(profile.name.familyName, 'Hanson');
        assert.equal(profile.name.givenName, 'Jared');
        assert.equal(profile.emails[0].value, 'jaredhanson@example.com');
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      },
    },
  },
  
  'strategy when loading user profile with unmapped Xing profile fields': {
    topic: function() {
      var strategy = new XingStrategy({
        consumerKey: 'ABC123',
        consumerSecret: 'secret',
        profileFields: ['wants', 'organisation_member', 'private_address', 'business_address.email']
      },
      function() {});
      
      // mock
      strategy._oauth.get = function(url, token, tokenSecret, callback) {
        if (url == 'https://api.xing.com/v1/users/me.json?fields=id,first_name,last_name,display_name,wants,organisation_member,private_address,business_address.email') {
          var body = '{ "users": [ { "wants": "A job", "id": "_XX0XXX00X", "organisation_member": "ACME", "first_name": "Jared", "last_name": "Hanson", "display_name": "Jared Hanson", "business_address": { "email": "jaredhanson@example.biz" }, "private_address": { "email": "jaredhanson@example.name" } } ]}';
          callback(null, body, undefined);
        } else {
          callback(new Error('Incorrect user profile URL: ' + url));
        }
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('token', 'token-secret', {}, done);
        });
      },
      
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'xing');
        assert.equal(profile.id, '_XX0XXX00X');
        assert.equal(profile.displayName, 'Jared Hanson');
        assert.equal(profile.name.familyName, 'Hanson');
        assert.equal(profile.name.givenName, 'Jared');
        assert.equal(profile.emails[0].value, 'jaredhanson@example.name');
        assert.equal(profile.emails[1].value, 'jaredhanson@example.biz');
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      },
    },
  },

  'strategy when loading user profile with redundant Xing profile fields': {
    topic: function() {
      var strategy = new XingStrategy({
        consumerKey: 'ABC123',
        consumerSecret: 'secret',
        profileFields: ['id', 'name', 'emails', 'photos', 'profileUrl']
      },
      function() {});

      // mock
      strategy._oauth.get = function(url, token, tokenSecret, callback) {
        if (url == 'https://api.xing.com/v1/users/me.json?fields=id,first_name,last_name,display_name,active_email,photo_urls,permalink') {
          var body = '{ "users": [ { "wants": "A job", "id": "_XX0XXX00X", "first_name": "Jared", "last_name": "Hanson", "display_name": "Jared Hanson",  "photo_urls": { "large": "https://x1.xingassets.com/pubimg/users/c/140x185.jpg", "maxi_thumb": "https://x1.xingassets.com/pubimg/users/c/70x93.jpg", "medium_thumb": "https://x1.xingassets.com/pubimg/users/c/57x75.jpg", "mini_thumb": "https://x1.xingassets.com/pubimg/users/c/18x24.jpg", "thumb": "https://x1.xingassets.com/pubimg/users/c/30x40.jpg"}, "permalink": "https://www.xing.com/profile/Jared_HansonX"  } ]}';
          callback(null, body, undefined);
        } else {
          callback(new Error('Incorrect user profile URL: ' + url));
        }
      }

      return strategy;
    },

    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }

        process.nextTick(function () {
          strategy.userProfile('token', 'token-secret', {}, done);
        });
      },

      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'xing');
        assert.equal(profile.id, '_XX0XXX00X');
        assert.equal(profile.displayName, 'Jared Hanson');
        assert.equal(profile.name.familyName, 'Hanson');
        assert.equal(profile.name.givenName, 'Jared');
        assert.equal(profile.profileUrl, 'https://www.xing.com/profile/Jared_HansonX');
        assert.equal(profile.photos.length, 5);
        assert.equal(profile.photos[0].type, 'large');
        assert.equal(profile.photos[0].value, 'https://x1.xingassets.com/pubimg/users/c/140x185.jpg');
        assert.equal(profile.photos[1].type, 'maxi_thumb');
        assert.equal(profile.photos[1].value, 'https://x1.xingassets.com/pubimg/users/c/70x93.jpg');
        assert.equal(profile.photos[2].type, 'medium_thumb');
        assert.equal(profile.photos[2].value, 'https://x1.xingassets.com/pubimg/users/c/57x75.jpg');
        assert.equal(profile.photos[3].type, 'mini_thumb');
        assert.equal(profile.photos[3].value, 'https://x1.xingassets.com/pubimg/users/c/18x24.jpg');
        assert.equal(profile.photos[4].type, 'thumb');
        assert.equal(profile.photos[4].value, 'https://x1.xingassets.com/pubimg/users/c/30x40.jpg');

      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      },
    },
  },

  'strategy when loading user profile with birthday and gender Xing profile fields': {
    topic: function() {
      var strategy = new XingStrategy({
        consumerKey: 'ABC123',
        consumerSecret: 'secret',
        profileFields: ['birthday', 'gender']
      },
      function() {});

      // mock
      strategy._oauth.get = function(url, token, tokenSecret, callback) {
        if (url == 'https://api.xing.com/v1/users/me.json?fields=id,first_name,last_name,display_name,birth_date,gender') {
          var body = '{ "users": [ { "wants": "A job", "id": "_XX0XXX00X", "first_name": "Jared", "last_name": "Hanson", "display_name": "Jared Hanson", "gender": "m", "birth_date": { "year": 1678, "month": 4, "day": 24 } } ]}';
          callback(null, body, undefined);
        } else {
          callback(new Error('Incorrect user profile URL: ' + url));
        }
      }

      return strategy;
    },

    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }

        process.nextTick(function () {
          strategy.userProfile('token', 'token-secret', {}, done);
        });
      },

      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'xing');
        assert.equal(profile.id, '_XX0XXX00X');
        assert.equal(profile.displayName, 'Jared Hanson');
        assert.equal(profile.name.familyName, 'Hanson');
        assert.equal(profile.name.givenName, 'Jared');
        assert.equal(profile.gender, 'm');
        assert.equal(profile.birthday.getTime(), (new Date(1678, 4, 24)).getTime());
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      },
    },
  },

  'strategy when loading user profile and encountering an error': {
    topic: function() {
      var strategy = new XingStrategy({
        consumerKey: 'ABC123',
        consumerSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth.get = function(url, token, tokenSecret, callback) {
        callback(new Error('something went wrong'));
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('token', 'token-secret', {}, done);
        });
      },
      
      'should error' : function(err, req) {
        assert.isNotNull(err);
      },
      'should wrap error in InternalOAuthError' : function(err, req) {
        assert.equal(err.constructor.name, 'InternalOAuthError');
      },
      'should not load profile' : function(err, profile) {
        assert.isUndefined(profile);
      },
    },
  },
  
  'strategy handling a request that has been denied': {
    topic: function() {
      var strategy = new XingStrategy({
          consumerKey: 'ABC123',
          consumerSecret: 'secret'
        },
        function() {}
      );
      return strategy;
    },
    
    'after augmenting with actions': {
      topic: function(strategy) {
        var self = this;
        var req = {};
        strategy.success = function(user) {
          self.callback(new Error('should not be called'));
        }
        strategy.fail = function() {
          self.callback(null, req);
        }
        
        req.query = {};
        req.query.oauth_problem = 'user_refused';
        process.nextTick(function () {
          strategy.authenticate(req);
        });
      },
      
      'should not call success' : function(err, req) {
        assert.isNull(err);
      },
      'should call fail' : function(err, req) {
        assert.isNotNull(req);
      },
    },
  },

}).export(module);
