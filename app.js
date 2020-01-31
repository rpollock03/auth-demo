// import required packages and assign to variable
var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    localStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User = require("./models/user");

// connect to DB
mongoose.connect("mongodb://localhost/auth_demo_app", { useUnifiedTopology: true, useNewUrlParser: true });

// package set up
var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session")({
    secret: "Our cat, Tabby, is whining about something", // this can be anything
    resave: false,
    saveUninitialized: false
}));

// passport set-up
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ===================
//      ROUTES
// ===================

// root route
app.get("/", function (req, res) {
    res.render("home");
})

// middleware checks if user is logged in before showing secret page
app.get("/secret", isLoggedIn, function (req, res) {
    res.render("secret");
})

// registration form
app.get("/register", function (req, res) {
    res.render("register");
});

// handle new user logic
app.post("/register", function (req, res) {
    // user info from parsed body. Pass in username key/value ONLY. 2nd argument to user.register will be hashed. 
    // this will return a user object with username and hashed password. 
    User.register(new User({ username: req.body.username }), req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        // if user created and no error
        passport.authenticate("local")(req, res, function () {
            res.redirect("/secret");
        });
    });
});

// login route
app.get("/login", function (req, res) {
    res.render("login");
})

// login logic - middlware hashes users input password and compares to hash for that user in database.
app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}), function (req, res) {
});

// logout logic
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
})

// define function middleware that determines if user is logged in.
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

// use port 5000 unless there exists a preconfigured port
var port = process.env.port || 5000;
app.listen(port, function () {
    console.log("app is listening on port:" + port);
});
