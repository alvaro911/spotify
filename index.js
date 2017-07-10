const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('passport');
const swig = require('swig');
const unirest = require('unirest');
const events = require('events');
const SpotifyStrategy = require('passport-spotify').Strategy;
const consolidate = require('consolidate');

const app = express();
const PORT = 3030;

//SPOTIFY KEYS
const appKey = '39755b9ae9ee43468e048e5a3e0ac3d9';
const appSecret = 'b248cd5e3e484182b38b31c7bfff3223';
let token = ''

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj)
});

passport.use(new SpotifyStrategy({
    clientID: appKey,
    clientSecret: appSecret,
    callbackURL: 'http://localhost:3030/callback',
  },
  (accessToken, refreshToken, profile, done) => {
    process.nextTick(function () {
      token = accessToken;
      return done(null, profile);
    });
  }
));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(bodyParser());
app.use(methodOverride());
app.use(session( { secret: 'Why so serious' } ));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'));

app.engine('html', consolidate.swig);

app.get('/', (req, res) => {
  res.render('sign.html', { user: req.user});
});

app.get('/auth/spotify',
  passport.authenticate('spotify',
    {
      scope: ['user-read-email', 'user-read-private'],
      showDialog: true,
    }
  ),
  (req, res) => {
    console.log('==================', res.body);
  }
);

app.get('/callback',
  passport.authenticate('spotify',
  {
    failureRedirect: '/login'
  }),
  (req, res) => {
    res.redirect('/');
  }
);

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
})

app.get('/login', (req, res) => {
  res.render('login.html', {user: req.user});
});

app.get('/account', ensureAuthenticated, (req, res) => {
  res.render('account.html', {user: req.user});
});

const getGenreRes = (genre) => {
  const emitter = new events.EventEmitter();
  console.log('========== TOKEN', token);
  unirest.get(`https://api.spotify.com/v1/search?q="${genre}"&type=artist&limit=50`)
    .header('Accept', 'application/json')
    .header('Authorization', `Bearer ${token}`)
    .end((res) => {
      if(res.ok) {
        emitter.emit('end', res.body)
      }
      else {
        emitter.emit('error', res.code);
      }
    })
  return emitter;
}

app.get('/genre/:genre', ensureAuthenticated, (req, res) => {
  const searchReq = getGenreRes(req.params.genre)

  searchReq.on('end', item => {
    return res.json(item);
  });

  searchReq.on('error', code => {
    return res.json(code);
  })
});

//Middleware to make sure user is authenticated whenver making a request
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
