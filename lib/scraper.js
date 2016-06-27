'use strict';
const qs      = require('querystring'),
	  url     = require('url'),
	  got     = require('got'),
	  fs      = require('fs'),
      cheerio = require('cheerio');


let config = {
			maxToParse: 5
	}
let result = [];
let selector;

module.exports = scraper;

function scraper (req, res) {
	const   query          = qs.parse(url.parse(req.url).query),
			queryUrl       = query['input-url'],
			selector       = query['input-selector'],
			baseUrlHostObj = qs.parse(url.parse(queryUrl).host),
			protocolLink   = url.parse(queryUrl).protocol + '//';
	
	config.depth   = query['input-depth'];

	let baseUrlHost,
		pageNumb = 1,
		passedUrl = [];

	console.log ("URL:", queryUrl);
    console.log("depth:", config.depth);
    console.log("selector:", selector);

	for (let key in baseUrlHostObj) {
		baseUrlHost = key;
	}

	const baseUrl = protocolLink + baseUrlHost;


	let openLink = function (pageUrl) {
		let slashCount = 0;

	    for(let i = 0; i < pageUrl.length; i++){
	        if(pageUrl[i] == '/')slashCount++;
	    }

		if (pageUrl) {
			console.log(pageUrl);
			let pageName = function (pageUrl) {
				pageNumb = pageNumb + 1;
				result.push({
					pageUrlLink: pageUrl
				});	
			}

			let isPassed = function (urlChange) {
				let isResult = false;
				passedUrl.forEach(function (item) { 

					if (urlChange != item){
						isResult = true;
					}
				});
				return isResult;
			};
			got(pageUrl)
				.then(response => {
					return new Promise(function (resolve, reject) {

						let contentUrl = response.body,
							$ = cheerio.load(contentUrl);

						let createPageFile = function (pageNumb) {
							// fs.writeFile('./tagsPage' + pageNumb + '.json', JSON.stringify(result, null, 2), function (err) {
							// 	if(err) {
							//         return console.log(err);
							//     }
							//     console.log('file saved');
							// });
							fs.writeFile('./tagsPage' + pageNumb + '.json', JSON.stringify(passedUrl, null, 2), function (err) {
								if(err) {
							        return console.log(err);
							    }
							    console.log('file saved');
							});
						}

						let voteParseBlock = function () {
							titlePage = $('title').text();

							$(selector).each(function contentSave(index, sel) {
				                results.push({href: url, Content: $(sel).html()});
				                console.log({href: url, Content: $(sel).html()});
				            });

							$('a').each(function (index, item) {
								let itemUrlHostObj = qs.parse(url.parse(item.attribs.href).host),
									itemUrlHost,
									itemUrlInside;

								for (let key in itemUrlHostObj) {
									itemUrlHost = key;
								}


								if (itemUrlHost == baseUrlHost) {
									//homepage + внутренняя ссылки(сайт/внутрненняя) или ссылка на homepage
									itemUrlInside = url.parse(item.attribs.href).href;

									//console.log(url.parse(item.attribs.href).host, url.parse(item.attribs.href).href);

									result.push({
										number: index,
										insideUrl: itemUrlInside,
										text:  $(item).text().trim()
									});
								}

								if (itemUrlHost == null) {
									//только внутренняя ссылки (внутрненняя)

									if (url.parse(item.attribs.href).path != null) {
										itemUrlInside = baseUrl + url.parse(item.attribs.href).href;

										result.push({
											number: index,
											insideUrl: itemUrlInside,
											text:  $(item).text().trim()
										});
									}
								}


								//console.log(itemUrlInside);
								if (pageNumb < config.maxToParse) {
									if (itemUrlInside != undefined) {
										if (isPassed(itemUrlInside)) {
											//console.log('Open next Page!!!!!!!!!!');
											//console.log(itemUrlInside);
											openLink(itemUrlInside);
										}
									}
								}
							});
						};

						pageName(pageUrl);
						passedUrl.push(pageUrl);
						voteParseBlock();
						createPageFile(pageNumb);
						res.end(JSON.stringify(result, null, 2));
						resolve();
					});
				})
				.catch(error => {
					reject();
					console.log(error.response.body);
					//=> 'Internal server error ...' 
				});
		}
	}

	openLink(queryUrl);
	Promise.all(result).then(function () {
		
	});
};