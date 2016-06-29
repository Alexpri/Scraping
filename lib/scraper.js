'use strict';
const qs      = require('querystring'),
      url     = require('url'),
      got     = require('got'),
      fs      = require('fs'),
      cheerio = require('cheerio'),
      config = {
        maxToParse: 5
      },
      result = [];

module.exports = scraper;

function scraper (req, res) {
    const   query          = qs.parse(url.parse(req.url).query),
            queryUrl       = query.url,
            selector       = query.selector,
            baseUrlHost    = url.parse(queryUrl).host,
            protocolLink   = url.parse(queryUrl).protocol + '//',
            baseUrl        = protocolLink + baseUrlHost;

    config.depth = query.depth;

    let pageNumb = 1,
        passedUrl = [];

    console.log('URL', queryUrl);
    console.log('depth', config.depth);
    console.log('selector', selector);

    let openLink = function (pageUrl) {
        const slashCount = pageUrl.split('/').length;

        if (!pageUrl) return;

        console.log(pageUrl);

        function pageName(pageUrl) {
            pageNumb += 1;
            result.push({
                pageUrlLink: pageUrl
            });
        }

        function isPassed(urlChange) {
            return passedUrl.includes(urlChange);
        };

        const myPromise = got(pageUrl)
            .then(response => {
                // TODO: не нужно, т.к. got сам вернет промис
                return new Promise(function (resolve, reject) {

                    let contentUrl = response.body,
                        $ = cheerio.load(contentUrl);

                    let createPageFile = function (pageNumb) {
                        // fs.writeFile('./tagsPage' + pageNumb + '.json', JSON.stringify(result, null, 2), function (err) {
                        //  if(err) {
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
                        const titlePage = $('title').text();

                        $(selector).each(function contentSave(index, sel) {
                            results.push({href: url, Content: $(sel).html()});
                            console.log({href: url, Content: $(sel).html()});
                        });

                        $('a').each(function (index, item) {
                            let itemUrlHost = url.parse(item.attribs.href).host,
                                itemUrlInside;

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
                    // TODO: не может так работать
                    // res.end(JSON.stringify(result, null, 2));
                    resolve();
                });
            })
            .catch(error => {
                reject(error);
                console.error(error.response.body);
                //=> 'Internal server error ...'
            });
        }
    }

    openLink(queryUrl);
    Promise.all(result).then(function () {

    });
};