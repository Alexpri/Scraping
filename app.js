"use strict";
const path     = requre('path'),
      express  = require('express'),
      app      = express(),
      scraper  = require('./lib/scraper.js');

app.set('port', 3000);

app.use(express.static(path.join(__dirname, 'public'));

app.get('/vote', scraper);

app.listen(app.get('port'));