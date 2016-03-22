var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socketIo = require('socket.io');
var net = require('net');

// Database
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/blueJay');

var app = express();

// Socket.io
var io = socketIo();
app.io = io;


app.net = net;
var tcpServer = require('./tcpServer');

// start up a tcp server
tcpServer.init(net, app.io);


var routes = require('./routes/index')(app.io, tcpServer);
var apiRoutes = require('./routes/api');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/socket.io-client')));
app.use(express.static(path.join(__dirname, 'node_modules/socket.io')));
app.use(express.static(path.join(__dirname, 'test')));


// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', routes);
app.use('/api', apiRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// socket.io events
io.on( "connection", function( socket )
{
    console.log( "A user connected" );
});
module.exports = app;
