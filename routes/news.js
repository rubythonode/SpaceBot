const inshorts         = require('inshorts').init();
const Promise          = require('bluebird');
var commonFunctions    = require('./commonFunctions.js');
const fbPageToken      = process.env.PAGE_ACCESS_TOKEN;
const rp               = require('request-promise');

exports.sendResponse   = sendResponse;

function sendResponse(event) {
    Promise.coroutine(function* () {
        var getNews = yield getLatestNews(event);
        var LatestNews = yield sendTextResponseToUser(event, getNews);
        return LatestNews;
    })().then((LatestNews) => {
        return LatestNews;
    }, (error) => {
        return error;
    })
}

function getLatestNews(event) {
    return new Promise((resolve, reject) => {
        var items = ['national', 'business', 'sports', 'world', 'politics',
            'technology', 'startup', 'entertainment', 'miscellaneous', 'hatke', 'science', 'automobile'];
        var items = items[Math.floor(Math.random() * items.length)];
        inshorts.getNews(items, (err, result) => {
            if (err || !result && !result.body && !Array.isArray(result.body)) {
                var newsObj = "Could not fetch news at this instant"
            } else {
                newsObj = result.body[0];
            }
            resolve(newsObj);
        });
    });
}

function sendTextResponseToUser(event, getNews) {
    let sender = event.sender.id;
    var options = {
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: fbPageToken },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: {
                text: getNews,
                quick_replies: [{
                    content_type: "text",
                    title: "More News?",
                    payload: "NEWS"
                },
                {
                    content_type: "text",
                    title: "No",
                    payload: ""
                }
                ]
            }
        }
    };
    rp(options)
        .then((result) => {
            return result;
        })
        .catch((err) => {
            console.log(err);
            return err;
        });
}
