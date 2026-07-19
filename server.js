const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const path = require('path')
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const session = require('express-session')
const challengeCtrl = require('./controllers/challenges.js')
const { MongoStore } = require('connect-mongo')

const authCtrl = require('./controllers/auth')

// Set the port from environment variable or default to 3000
const port = process.env.PORT ? process.env.PORT : "3000";


mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }));
// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride("_method"));
const passUserToView = require('./middleware/pass-user-to-view.js')
const isSignedIn = require('./middleware/is-signed-in.js')
// Morgan for logging HTTP requests
app.use(morgan('dev'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
}))

app.use(express.static('public'))
app.use(passUserToView)

app.get('/', (req, res) => {
    res.render('home.ejs', {
        user: req.session.user,
    })
})


// Authenticating
app.get('/auth/sign-up', authCtrl.showSignUpForm )
app.post('/auth/sign-up', authCtrl.signUp)
app.get('/auth/sign-in', authCtrl.showSignInForm)
app.post('/auth/sign-in', authCtrl.signIn)
app.delete('/auth/sign-out', authCtrl.signOut)

app.get('/dashboard', async (req, res) => {
    if (!req.session.user){
        return res.redirect('/auth/sign-in')
    }
    res.render('dashboard.ejs', {
        user: req.session.user
    })
})

app.get('/challenges', challengeCtrl.index)
app.get('/challenges/new', isSignedIn, challengeCtrl.showNewForm)
app.post('/challenges', isSignedIn, challengeCtrl.createChallenge)

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
