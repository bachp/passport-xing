/**
 * Module dependencies.
 */
var util = require('util')
  , OAuthStrategy = require('passport-oauth').OAuthStrategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The Xing authentication strategy authenticates requests by delegating to
 * Xing using the OAuth protocol.
 *
 * Applications must supply a `verify` callback which accepts a `token`,
 * `tokenSecret` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `consumerKey`     identifies client to Xing
 *   - `consumerSecret`  secret used to establish ownership of the consumer key
 *   - `callbackURL`     URL to which Xing will redirect the user after obtaining authorization
 *
 * Examples:
 *
 *     passport.use(new XingStrategy({
 *         consumerKey: '123-456-789',
 *         consumerSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/xing/callback'
 *       },
 *       function(token, tokenSecret, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.requestTokenURL = options.requestTokenURL || 'https://api.xing.com/v1/request_token';
  options.accessTokenURL = options.accessTokenURL || 'https://api.xing.com/v1/access_token';
  options.userAuthorizationURL = options.userAuthorizationURL || 'https://api.xing.com/v1/authorize';
  options.sessionKey = options.sessionKey || 'oauth:xing';

  OAuthStrategy.call(this, options, verify);
  this.name = 'xing';
  this._profileFields = options.profileFields || null;
}

/**
 * Inherit from `OAuthStrategy`.
 */
util.inherits(Strategy, OAuthStrategy);

/**
 * Authenticate request by delegating to Xing using OAuth.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req) {
  // When a user denies authorization on Xing, they are presented with a
  // link to return to the application in the following format:
  //
  //     http://www.example.com/auth/xing/callback?oauth_problem=user_refused
  //
  // Following the link back to the application is interpreted as an
  // authentication failure.
  if (req.query && req.query.oauth_problem) {
    return this.fail();
  }
  
  // Call the base class for standard OAuth authentication.
  OAuthStrategy.prototype.authenticate.call(this, req);
}

/**
 * Retrieve user profile from Xing.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `id`
 *   - `displayName`
 *   - `name.familyName`
 *   - `name.givenName`
 *
 * @param {String} token
 * @param {String} tokenSecret
 * @param {Object} params
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(token, tokenSecret, params, done) {
  var url = 'https://api.xing.com/v1/users/me.json?fields=id,first_name,last_name,display_name,active_email,page_name,permalink,gender,photo_urls,birth_date';
  if (this._profileFields) {
    var fields = this._convertProfileFields(this._profileFields);
    url = 'https://api.xing.com/v1/users/me.json?fields=' + fields;
  }
  this._oauth.get(url, token, tokenSecret, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }
    
    try {
      var json = JSON.parse(body);
      var profile = { provider: 'xing' };
      // Xing returns an array of user, currently only the first is used
      var user = json.users[0];

      profile.id = user.id;
      profile.displayName = user.display_name;
      profile.name = { familyName: user.last_name,
                       givenName: user.first_name };

      // The following fields are optional and only populated if they are provided by Xing
      if (user.page_name) { profile.username = user.page_name };
      if (user.permalink) { profile.profileUrl = user.permalink };
      if (user.gender) { profile.gender = user.gender }
      if (user.birth_date && user.birth_date.year && user.birth_date.month && user.birth_date.day) {
          profile.birthday = new Date(Date.UTC(user.birth_date.year, (user.birth_date.month-1), user.birth_date.day));
      }


      profile.emails = [];
      if (user.active_email) { profile.emails.push({type: "home", value: user.active_email, primary: true}); };
      if (user.private_address) { profile.emails.push({type: "home", value: user.private_address.email}); };
      if (user.business_address) { profile.emails.push({type: "work", value: user.business_address.email}); };
      if (profile.emails.length === 0) { delete profile.emails };

      if (user.photo_urls) {
        profile.photos = [];
        Object.keys(user.photo_urls).forEach(function(key) {
          profile.photos.push({value: user.photo_urls[key],
                               type: key});
        });
      }
      
      profile._raw = body;
      profile._json = user;
      
      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
}

Strategy.prototype._convertProfileFields = function(profileFields) {
  var map = {
    'id':          'id',
    'displayName': 'display_name',
    'name':       ['first_name', 'last_name'],
    'emails':      'active_email',
    'photos':      'photo_urls',
    'profileUrl':  'permalink',
    'gender':      'gender',
    'username':    'page_name',
    'birthday':    'birth_date'
  };
  
  var fields = ['id', 'first_name', 'last_name', 'display_name'];
  
  profileFields.forEach(function(f) {
    // return raw Xing profile field to support the many fields that don't
    // map cleanly to Portable Contacts
    if (typeof map[f] === 'undefined') { return fields.push(f); };

    if (Array.isArray(map[f])) {
      Array.prototype.push.apply(fields, map[f]);
    } else {
      fields.push(map[f]);
    }
  });

  // Make sure the fields are unique
  var unique = [];
  for (var i = 0; i < fields.length; i++) {
    if (unique.indexOf(fields[i]) == -1) {
      unique.push(fields[i]);
    }
  }

  return unique.join(',');
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
