'use strict';
const qs      = require('querystring'),
	  url     = require('url'),
	  got     = require('got'),
	  fs      = require('fs'),
      cheerio = require('cheerio'),
      writer  = require('./writer');


let config = {
			maxToParse: 5
	}
let result = [];
let linksArray = [];
let selector;



function scraper (req, res) {
	const   query          = qs.parse(url.parse(req.url).query),
			queryUrl       = query['input-url'],
			selector       = query['input-selector'],
			baseUrlHostObj = qs.parse(url.parse(queryUrl).host),
			protocolLink   = url.parse(queryUrl).protocol + '//';
	
	config.depth   = query['input-depth'];

	let baseUrlHost,
		pageNumb = 0,
		passedUrl = [];

	// console.log("URL:", queryUrl);
 //    console.log("depth:", config.depth);
 //    console.log("selector:", selector);

	for (let key in baseUrlHostObj) {
		baseUrlHost = key;
	}

	const baseUrl = protocolLink + baseUrlHost;


	let openLink = function (pageUrl) {
		let slashCount = 2;  //   https//  2 sleshes

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

			got(pageUrl)
				.then(response => {
					return new Promise(function (resolve, reject) {

						let contentUrl = response.body,
							$ = cheerio.load(contentUrl);

						let isPassed = function (urlChange) {
							let isResult = false;
							passedUrl.forEach(function (item) { 

								if (urlChange != item){
									isResult = true;
								}
							});
							return isResult;
						};
						
						let voteParseBlock = function () {
							console.log(passedUrl);

							$(selector).each(function contentSave(index, item) {
				                result.push({href: pageUrl, Content: $(item).html()});
				                //console.log({href: pageUrl, Content: $(item).html()});
				            });

							$('a').each(function (index, item) {
								let itemHref = item.attribs.href,
									itemUrlHostObj = qs.parse(url.parse(itemHref).host),
									itemUrlHost,
									itemUrlInside,
									slashitemHrefCount = 0;

								for(let i = 0; i < itemHref.length; i++){
							        if(itemHref[i] == '/')slashitemHrefCount++;
							    }

								if((slashitemHrefCount - slashCount) <= config.depth) {

									for (let key in itemUrlHostObj) {
										itemUrlHost = key;
									}

									if (itemUrlHost == baseUrlHost) {
										//homepage + внутренняя ссылки(сайт/внутрненняя) или ссылка на homepage
										itemUrlInside = url.parse(itemHref).href;
									} 
									else if (itemUrlHost == undefined) {
										let urlPath = url.parse(itemHref).path;
										//только внутренняя ссылки (внутрненняя)
											console.log(url.parse(itemHref));

										if (urlPath != null && urlPath != '/') {
											itemUrlInside = baseUrl + urlPath;
										}
									}
									if (isPassed(itemUrlInside)) {
										linksArray.push(itemUrlInside);

										if (pageNumb < config.maxToParse) {
											if (itemUrlInside != undefined) {
												openLink(itemUrlInside);
												console.log(itemUrlInside);
												resolve(result);
											}
										}
									}

								}
							});
						};


						pageName(pageUrl);
						passedUrl.push(pageUrl);
						voteParseBlock();
					});
				})
				.catch(error => {
					reject();
					console.log(error.response.body);
					//=> 'Internal server error ...' 
				});
		}
	}

	let createPageFile = function (result) {
		writer('./tagsPage.json');
		// fs.writeFile('./tagsPage.json', JSON.stringify(result, null, 2), function (err) {
		// 	if(err) {
		//         return console.log(err);
		//     }
		//     console.log('file saved');
		// });


	}

	openLink(queryUrl);

	Promise.all(linksArray).then(results => {
		createPageFile(result);
		res.end(JSON.stringify(result, null, 2));
	});
};

module.exports = scraper;