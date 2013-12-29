var express = require('express')
  , http = require('http')
  , passport = require('passport')
  , util = require('util')
  , XingStrategy = require('passport-xing').Strategy;

var app = express();

// configure Express
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'keyboard cat' }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

var XING_API_KEY = "--insert-xing-api-key-here--"
var XING_SECRET_KEY = "--insert-xing-secret-key-here--";

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Xing profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the XingStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Xing profile), and
//   invoke a callback with a user object.
passport.use(new XingStrategy({
    consumerKey: XING_API_KEY,
    consumerSecret: XING_SECRET_KEY,
    callbackURL: "http://127.0.0.1:3000/auth/xing/callback"
  },
  function(token, tokenSecret, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // To keep the example simple, the user's Xing profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Xing account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/xing
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Xing authentication will involve
//   redirecting the user to xing.com.  After authorization, Xing will
//   redirect the user back to this application at /auth/xing/callback
app.get('/auth/xing',
  passport.authenticate('xing'),
  function(req, res){
    // The request will be redirected to Xing for authentication, so this
    // function will not be called.
  });

// GET /auth/xing/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/xing/callback',
  passport.authenticate('xing', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}
