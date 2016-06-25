const express = require('express');
const app = express();
const qs = require('querystring');
const http = require('http');
const url = require('url');
const got = require('got');
const fs = require('fs');
//const htmlparser = require("htmlparser2");
const cheerio = require('cheerio');
var queue = [];

app.set('port', 3000)

http.createServer(app).listen(app.get('port'));

app.use(express.static(__dirname + '/public'));

app.use(function (req, res) {
	const query = qs.parse(url.parse(req.url).query);
	const queryUrl = query["input-url"];
	const queryUrlHostObj = qs.parse(url.parse(queryUrl).host);
	var queryUrlHost;
	for (key in queryUrlHostObj) {
		queryUrlHost = key;
	}

	if (queryUrl) {
		got(queryUrl)
			.then(response => {
				var contentUrl = response.body;
				var $ = cheerio.load(contentUrl);

				$('a').each(function (index, item) {
					var itemUrlHostObj = qs.parse(url.parse(item.attribs.href).host),
						itemUrlHost,
						itemUrlInside;

					for (key in itemUrlHostObj) {
						itemUrlHost = key;
					}


					if (itemUrlHost == queryUrlHost) {
						//homepage + внутренняя ссылки(сайт/внутрненняя) или ссылка на homepage
						console.log(url.parse(item.attribs.href).host, url.parse(item.attribs.href).href);
						//console.log(url.parse(item.attribs.href).host, itemUrlHost);
						queue.push({
							number: index,
							text:  $(item).text().trim()
						});
					}

					if (itemUrlHost == null) {
						//только внутренняя ссылки (внутрненняя)
						itemUrlInside = url.parse(item.attribs.href).path;

						queue.push({
							baseUrl: queryUrlHost,
							insideUrl: itemUrlInside,
							number: index,
							text:  $(item).text().trim()
						});
					}
				});

				fs.writeFile('./tagsInfo.json', JSON.stringify(queue, null, 2), function (err) {
					if(err) {
				        return console.log(err);
				    }
				    console.log('file saved');
					
				});

				res.end(JSON.stringify(queue, null, 2));
			})
			.catch(error => {
				console.log(error.response.body);
				//=> 'Internal server error ...' 
			});
	}
});