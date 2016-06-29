"use strict";
const express  = require('express'),
      app      = express(),
      path     = require('path'),
      scraper  = require('./lib/scraper.js');



app.set('port', 3000);

app.use(express.static(path.join(__dirname + '/public')));

app.use('/vote', scraper);

app.listen(app.get('port'));
