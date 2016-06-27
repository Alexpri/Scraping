"use strict";
const express  = require('express'),
      app      = express(),
      scraper  = require('./lib/scraper.js'),
	  http     = require('http');



app.set('port', 3000);

http.createServer(app).listen(app.get('port'));

app.use(express.static(__dirname + '/public'));

app.use('/vote', scraper);
