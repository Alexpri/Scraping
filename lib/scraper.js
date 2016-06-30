'use strict';
const qs         = require('querystring'),
      url        = require('url'),
      got        = require('got'),
      fs         = require('fs'),
      cheerio    = require('cheerio'),
      writer     = require('./writer'),
      result     = [],
      config     = {
                        maxToParse: 5
                   },
      passedUrl  = [];

let selector;



function scraper (req, res) {
    const   query          = qs.parse(url.parse(req.url).query),
            queryUrl       = query.url,
            selector       = query.selector,
            baseUrlHost    = url.parse(queryUrl).host,
            protocolLink   = url.parse(queryUrl).protocol + '//',
            baseUrl        = protocolLink + baseUrlHost;
    
    config.depth   = query.depth;

    let pageNumb = 0;
    let linksArray = [openLink(queryUrl)];


    function openLink (pageUrl) {
        const slashCount = pageUrl.split('/').length - 2;

        if (!pageUrl || !isPassed(pageUrl)) return;

            return got(pageUrl)
                        .then(response => {
                                pageName(pageUrl);
                                passedUrl.push(pageUrl);
                                voteParseBlock(pageUrl, response);
                        })
                        .catch(error => {
                            console.log("error 1", error.response.body);
                            //=> 'Internal server error ...' 
                        });
    }

    function pageName (pageUrl) {
        pageNumb =+ 1;
        // result.push({
        //     pageUrlLink: pageUrl
        // }); 
    };

     function isPassed (urlChange) {
        //console.log(8888, passedUrl, urlChange, urlChange.indexOf(passedUrl) != -1);
        return urlChange.indexOf(passedUrl) != -1;
    };


    function voteParseBlock (pageUrl, data) {
        let contentUrl = data.body;
        let $ = cheerio.load(contentUrl);

        $('' + selector).each(function contentSave(index, item) {
            result.push({
                href: pageUrl,
                Content: $(item).html()
            });
        });


        $('a').each(function (index, item) {
            let itemHref = item.attribs.href,
                itemUrlHost = url.parse(itemHref).host,
                itemUrlInside,
                slashitemHrefCount = 0;

                // console.log(232323, itemHref, itemUrlHost);

            const slashCount = itemHref.split('/').length - 2;

            if((slashitemHrefCount - slashCount) <= config.depth) {

                if (itemUrlHost == baseUrlHost) {
                    //homepage + внутренняя ссылки(сайт/внутрненняя) или ссылка на homepage
                    itemUrlInside = url.parse(itemHref).href;
                } 
                else if (itemUrlHost == undefined) {
                    let urlPath = url.parse(itemHref).path;
                    //только внутренняя ссылки (внутрненняя)

                    if (urlPath != null && urlPath != '/') {
                        itemUrlInside = baseUrl + urlPath;
                    }
                }
                if (itemUrlInside != undefined) {
                    if (isPassed(itemUrlInside)) {
                        console.log(5555, itemUrlInside);
                        if (pageNumb < config.maxToParse) {
                            if (itemUrlInside != undefined) {
                                linksArray.push(openLink(itemUrlInside));
                                //console.log(itemUrlInside);
                            }
                        }
                    }
                }
            }
        });
    };

    function createPageFile (result) {
        //console.log(result);
        //writer('./tagsPage.json', result);
        fs.writeFile('./tagsPage.json', JSON.stringify(result, null, 2), function (err) {
         if(err) {
                return console.log(err);
            }
            console.log('file saved');
        });
    }

    // linksArray.forEach(queryArray =>  {
    //     console.log(11111, queryArray);
    //     // queryPromise.then(data =>
    //     //     voteParseBlock(queryPageUrl, data));
    // })

    Promise.all(linksArray)
        .then(data => {
            console.log("Promise.all", linksArray);
            createPageFile(data);
            res.end(JSON.stringify(data, null, 2));
        })
        .catch(function(err) {
          console.log("Promise.all  error", err);
        });

};

module.exports = scraper;
