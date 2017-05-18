var express = require('express');
var path = require('path');
var fs = require('fs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');

var app = express();

var tilestrata = require('tilestrata');
var disk = require('tilestrata-disk');
var sharp = require('tilestrata-sharp');
var mapnik = require('tilestrata-mapnik');
var dependency = require('tilestrata-dependency');

var strata = tilestrata();

function addStrataLayer(name, mapnik_xml_pathname) {
strata.layer(name)
    .route('tile@2x.png')
        .use(mapnik({
            pathname: mapnik_xml_pathname,
            tileSize: 512,
            scale: 2
        }))
    .route('tile.png')
        .use(dependency(name, 'tile@2x.png'))
        .use(sharp(function(image, sharp) {
            return image.resize(256);
        }));
}

addStrataLayer('world', 'mapnik/geotiff_web_merc.xml');
addStrataLayer('grat30', 'mapnik/graticules_30.xml');
addStrataLayer('grat10', 'mapnik/graticules_10.xml');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

app.use(tilestrata.middleware({
  server: strata,
  prefix: '/v1'
}));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
