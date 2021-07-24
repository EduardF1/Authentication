require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();

const port = 4200;
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
};

//  Server config
app.use(express.static(`${__dirname}/public`));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

//  Session setup
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

// Use passport for session management
app.use(passport.initialize());
app.use(passport.session());

//  DB connection setup
try {
    mongoose.connect(`${process.env.DB_URL}`, options);
} catch (e) {
    console.error(e);
}

// Define User Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String
});

// Add passportLocalMongoose as a DB plugin (handles hashing and salting)
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// Define Schema Model
const User = mongoose.model('User', userSchema);

// Configure Session strategy
passport.use(User.createStrategy());
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: 'http://localhost:4200/auth/google/secrets',
        userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
    },
    (accessToken, refreshToken, profile, cb) => {
        User.findOrCreate(
            {googleId: profile.id},
            {
                provider: 'google',
                email: profile._json.email
            }, {},
            (err, user) => {
                return cb(err, user);
            }
        );
    }
));

app.get('/', ((req, res) => {
    res.render('home');
}));

app.get('/submit', (req, res) => {
    res.render('submit');
});

app.get('/login', ((req, res) => {
    res.render('login');
}));

app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

app.get('/auth/google/secrets', passport.authenticate('google', {failureRedirect: '/login'}), (req, res) => {
    // Successful authentication, redirect to secrets.
    res.redirect('/secrets');
});

app.get('/submit', ((req, res) => {
    if (req.isAuthenticated()) {
        res.render('submit');
    } else {
        res.redirect('/login');
    }
}));

app.get('/logout', ((req, res) => {
    req.logout();
    res.redirect('/');
}));

app.get('/secrets', (req, res) => {
    User.find({'secret': {$ne: null}}, ((err, foundUsers) => {
        if (!err) {
            res.render('secrets', {usersWithSecrets: foundUsers});
        } else {
            console.error(err);
        }
    }));
});

app.post('/login', ((req, res) => {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, {}, (err) => {
        if (!err) {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets');
            });
        } else {
            console.log(err);
        }
    });
}));

app.post('/submit', ((req, res) => {
    const submittedSecret = req.body.secret;

    User.findById(req.user.id, (err, foundUser) => {
        if (!err && foundUser) {
            foundUser.secret = submittedSecret;
            foundUser.save(() => {
                res.redirect('/secrets');
            })
        }
    });
}));

app.route('/register')
    .get((req, res) => {
        res.render('register');
    })
    .post(function (req, res) {
        const username = req.body.username;
        const password = req.body.password;

        User.register({username: username, email: username, provider: 'local'}, password, (err, user) => {
            if (err) {
                console.log(err);
                res.redirect('/register');
            } else {
                passport.authenticate('local')(req, res, () => {
                    res.redirect('/secrets');
                });
            }
        });
    });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});