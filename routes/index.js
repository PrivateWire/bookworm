var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User');
//load index js
var mid = require('../middleware/index');

// mongodb connection
mongoose.connect("mongodb://localhost:27017/bookworm");
var db = mongoose.connection;
// mongo error
db.on('error', console.error.bind(console, 'connection error:'));

// GET /
router.get('/', function(req, res, next) {
  return res.render('index', { title: 'Home' });
});

// GET /about
router.get('/about', function(req, res, next) {
  return res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

// GET /register- add it in in the middle of route
router.get('/register', mid.loggoutOut, function(req, res, next) {
    return res.render('register',{title:'Sign up'});
});

// GET /login - add in middle ware
router.get('/login', mid.loggoutOut, function(req, res, next) {
    return res.render('login', {title:'Log In'});
});


// GET log out
router.get('/logout', function(req, res, next) {
    if(req.session){
        //delete session
        req.session.destroy(function (err) {
            if(err){
                return next(err)
            }else{
                return res.redirect('/')
            }
        })
    }

});

// GET /profile
router.get('/profile', function(req, res, next) {

    User.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                return next(error);
            } else {
                return res.render('profile', { title: 'Profile', name: user.name, favorite: user.favoriteBook });
            }
        });
});
//POST- login
router.post('/login', function(req, res, next) {
    if (req.body.email && req.body.password) {
        User.authenticate(req.body.email, req.body.password, function (error, user) {
            if (error || !user) {
                var err = new Error('Wrong email or password.');
                err.status = 401;
                return next(err);
            }  else {
                req.session.userId = user._id;
                return res.redirect('/profile');
            }
        });
    } else {
        var err = new Error('Email and password are required.');
        err.status = 401;
        return next(err);
    }
});


// POST /register - register user
router.post('/register', function(req, res, next) {
    if (req.body.email &&
        req.body.name &&
        req.body.favoriteBook &&
        req.body.password &&
        req.body.confirmPassword) {

        // confirm that user typed same password twice
        if (req.body.password !== req.body.confirmPassword) {
            var err = new Error('Passwords do not match.');
            err.status = 400;
            return next(err);
        }

        // create object with form input
        var userData = {
            email: req.body.email,
            name: req.body.name,
            favoriteBook: req.body.favoriteBook,
            password: req.body.password
        };

        // use schema's `create` method to insert document into Mongo
        User.create(userData, function (error, user) {
            if (error) {
                return next(error);
            } else {
                //Ensure the user is logged in- registered they are logged in
                req.session.userId = user._id;
                return res.redirect('/profile');
            }
        });

    } else {
        var err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
});

module.exports = router;
