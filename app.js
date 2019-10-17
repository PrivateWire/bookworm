var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var app = express();
var mongoose = require('mongoose');

// mongodb connection
mongoose.connect("mongodb://localhost:27017/bookworm");
var db = mongoose.connection;
// mongo error
db.on('error', console.error.bind(console, 'connection error:'));

//app use sessions for tracking logins
app.use(session({
    secret:'Session', //Used to sign session id cookie
    resave:true, //forces session to be saved in session store
    saveUninitialized:false, //uninitialised session is a session which is not intialised
    store:new MongoStore({ // Session constructor function which contains config option
        mongooseConnection:db //Set to our connection
    })
}))

//make user id aviable to templates
app.use(function (req,res,next) {
  //locals allows you to add information to response object
  res.locals.currentUser = req.session.userId;
  next();
})


// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from /public
app.use(express.static(__dirname + '/public'));

// view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// include routes
var routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// listen on port 3000
app.listen(3000, function () {
  console.log('Express app listening on port 3000');
});
