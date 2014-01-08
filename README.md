# Passport-Xing

[Passport](http://passportjs.org/) strategy for authenticating with [Xing](http://www.xing.com/)
using the OAuth 1.0a API.

This module lets you authenticate using Xing in your Node.js applications.
By plugging into Passport, Xing authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Installation

    $ npm install passport-xing

## Usage

In order to use this strategy please make sure your Xing application has at 
least the *App User Details* access rights. This access rights can be set
if a production key is generated on the Xing Developer site.

#### Configure Strategy

The Xing authentication strategy authenticates users using a Xing
account and OAuth tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a consumer key, consumer secret, and callback URL.

    passport.use(new XingStrategy({
        consumerKey: XING_API_KEY,
        consumerSecret: XING_SECRET_KEY,
        callbackURL: "http://127.0.0.1:3000/auth/xing/callback"
      },
      function(token, tokenSecret, profile, done) {
        User.findOrCreate({ xingId: profile.id }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'xing'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/xing',
      passport.authenticate('xing'));
    
    app.get('/auth/xing/callback', 
      passport.authenticate('xing', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });
      
#### Profile Fields

The Xing profile is very rich, and may contain a lot of information.  The
strategy can be configured with a `profileFields` parameter which specifies a
list of fields your application needs.  For example, to fetch the user's ID, name and
email address, configure strategy like this.

    passport.use(new XingStrategy({
        // clientID, clientSecret and callbackURL
        profileFields: ['id', 'first_name', 'last_name', 'active_email']
      },
      // verify callback
    ));

by default the following fields will be fetched form Xing: `id,first_name,last_name,display_name,active_email,page_name,permalink,gender,photo_urls,birth_date`

## Examples

For a complete, working example, refer to the [login example](https://github.com/pascal-bach/passport-xing/tree/master/examples/login).

## Tests

    $ npm install
    $ make test

[![Build Status](https://travis-ci.org/pascal-bach/passport-xing.png?branch=master)](https://travis-ci.org/pascal-bach/passport-xing)

## Credits

  - [Jared Hanson](https://github.com/jaredhanson)
  - [Janett Michaylow](https://github.com/jmichaylow)
  - [Pascal Bach](https://github.com/pascal-bach)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2011 Jared Hanson  
Copyright (c) 2012 Janett Michaylow  
Copyright (c) 2013 Pascal Bach  

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
