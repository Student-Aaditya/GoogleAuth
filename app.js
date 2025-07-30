require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path = require("path");
const mongoose=require("mongoose");
const User=require("./MODEL/User.js");

const app = express();
const mongoURI = 'mongodb://localhost:27017/google'; 

main()
.then(()=>{
    console.log("mongodb connected succesull");
})
.catch((err)=>{
    console.log(err);
})


async function main(){
    await mongoose.connect(process.env.MONGO, {
      useNewUrlParser: true, // Recommended for new connections
      useUnifiedTopology: true,})
} 

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view"));

app.use(session({
    secret: "google12auth56",
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
}, async(accessToken, refreshToken, profile, done) => {
    try{
        let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        displayName: profile.displayName,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        profilePhoto: profile.photos[0].value
      });
    }
        return done(null, profile);
    }
    catch(err){
        console.log(err);
    }
    
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


app.get("/data",async(req,res)=>{
    const data=await User.find({});
    res.render("user.ejs",{data});
})
app.listen(3000, () => {
    console.log(`Server working on http://localhost:3000`);
});
