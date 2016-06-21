const express = require('express');
const app = express();
const qs = require('querystring');
const http = require('http');
const url = require('url');
const got = require('got');
const queue = [];
//const indexPage = require(__dirname + '/public/tmpl');

//app.set('views', __dirname + '/template');
//app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.use(function (req, res) {
	const query = qs.parse(url.parse(req.url).query);
	const queryUrl = query["input-url"];
	var contentUrl;

	if (queryUrl) {
		got(queryUrl)
			.then(response => {
				contentUrl = response.body;
				//=> '<!doctype html> ...' 
				res.end(contentUrl);
			})
			.catch(error => {
				console.log(error.response.body);
				//=> 'Internal server error ...' 
			});
	}
	//res.render("index", function (req, res, next) {
	//	page: '' + 	contentUrl;
	//});
	//res.end('yes');
});


/*app.use(function (req, res) {
	if (req.url == '/vote') {
	 	console.log('vote');
	 	res.end('yes');
	}
});*/

app.listen(3000);

/*function accept(req, res) {

  // если URL запроса /vote, то...
  if (req.url == '/vote') {
    // через 1.5 секунды ответить сообщением
    setTimeout(function() {
      res.end('Ваш голос принят: ' + new Date());
    }, 1500);
  } else {
    // иначе считаем это запросом к обычному файлу и выводим его
    file.serve(req, res); // (если он есть)
  }
}*/