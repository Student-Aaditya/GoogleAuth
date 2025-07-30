require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path = require("path");
const mongoose=require("connect-mongo");

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view"));

app.use(session({
    secret: "google12auth56",
    resave: false,
    saveUninitialized: true,
    store: mongoose.create({
        mongoUrl: 'mongodb://localhost:27017/google', 
    })
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback",
    passport.authenticate('google', { failureRedirect: "/" }),
    (req, res) => {
        res.render("thank.ejs", { user: req.user });
    }
);

app.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/");
    });
});

app.listen(3000, () => {
    console.log(`Server working on http://localhost:3000`);
});
