'use strict';

const express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    maxmind = require('maxmind'),
    ip = require('ip'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser');

maxmind.init([path.join(__dirname, "/data/GeoLiteCity.dat"), path.join(__dirname, "/data/GeoLiteCityv6.dat")]);

const routes = require('./routes/index');
const publicDirs = ['public', 'bower_components'];
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  req['sas'] = {};
  let ip_address = "116.203.72.25", //ip.address(),
    location = {};
  if(ip.isV4Format(ip_address)) {
    location = maxmind.getLocation(ip_address) || location;
  } else if(ip.isV6Format(ip_address)) {
    location = maxmind.getLocationV6(ip_address) || location;
  }
  req.sas.ip = ip_address;
  req.sas.location = location;
  next();
});

publicDirs.forEach((d) => { app.use("/" + d, express.static(path.join(__dirname, d))); });

app.use('/', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
