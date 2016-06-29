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
    let linksArray = [[queryUrl ,got(queryUrl)]];
    //console.log(linksArray);


    function openLink (pageUrl) {
        //console.log(1111, pageUrl);
        const slashCount = pageUrl.split('/').length;


        if (!pageUrl) return;

        got(pageUrl)
            .then(response => {
                    pageName(pageUrl);
                    passedUrl.push(pageUrl);
                    voteParseBlock(response);
            })
            .catch(error => {
                console.log(error.response.body);
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
        return passedUrl.includes(urlChange);
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

            const slashCount = itemHref.split('/').length;

            if((slashitemHrefCount - slashCount) <= config.depth) {

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
                    if (pageNumb < config.maxToParse) {
                        if (itemUrlInside != undefined) {
                            linksArray.push([itemUrlInside, got(itemUrlInside)]);
                            console.log(linksArray);
                            //console.log(itemUrlInside);
                        }
                    }
                }
            }
        });
    };

    let createPageFile = function (result) {
        console.log(result);
        //writer('./tagsPage.json');
        // fs.writeFile('./tagsPage.json', JSON.stringify(result, null, 2), function (err) {
        //  if(err) {
        //         return console.log(err);
        //     }
        //     console.log('file saved');
        // });
    }

    //console.log(linksArray);

    linksArray.forEach(queryArray =>  {
        const queryPageUrl = queryArray[0];
        const queryPromise = queryArray[1];
        queryPromise.then(data =>
            voteParseBlock(queryPageUrl, data));
    })

    //openLink(linksArray);

    Promise.all(linksArray[0]).then(data => {
        createPageFile(data);
        res.end(JSON.stringify(data, null, 2));
    });
};

module.exports = scraper;
