const Promise               = require('bluebird');
const rp                    = require('request-promise');
var commonFunctions         = require('./commonFunctions.js'); 
const PAGE_ACCESS_TOKEN     = process.env.PAGE_ACCESS_TOKEN;
exports.sendResponse        = sendResponse;

function sendResponse(event) {
    Promise.coroutine(function* () {
        var fetchUserInfo          = yield fetchUserInformation(event);
        var sendResponse           = yield sendResponseToFb(event, fetchUserInfo);
        var sendQuickResponse      = yield sendQuickResponseToUser(event); 
        return sendQuickResponse;
    })().then((sendQuickResponse) => {
        return sendQuickResponse;
    }, (error) => {
        return error;
    })
}

function fetchUserInformation(event){
    let sender  = event.sender.id;
    var options = {
        uri: 'https://graph.facebook.com/v2.6/'+ sender,
        qs: {
            access_token:  PAGE_ACCESS_TOKEN// -> uri + '?access_token=xxxxx%20xxxxx'
        },
        headers: {
            'User-Agent': 'Request-Promise'
        }
    };
    console.log(options.uri);
    return rp(options)
        .then((result) => {
            result = JSON.parse(result);
            return result;
        })
        .catch((err) => {
            return err;
        });
}

function sendResponseToFb(event, userObj) {
    let sender       = event.sender.id;
    let getStatredObject = "Hi " + userObj.first_name + " ,My name is space bot.\n" +
                            "I share information about International Space Station,NASA "+
                            "or can tell you about news, jokes and quotes. \n"+
                            "Check out my menu to see all these features. \n" +
                            "Well I am chat bot! so we can always talk :\n"+
                            "For better understanding how i work check out video\n"+
                            "https://www.facebook.com/AstroSurferBot/videos/182153342364792/";                   
    var options = {
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: { text: getStatredObject }
        }
    };
    return rp(options)
        .then((result) => {
        })
        .catch((err) => {
        });
}

function sendQuickResponseToUser(event) {
    let sender = event.sender.id;
    var options = {
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: {
                text: 'Have A Quick Look',
                quick_replies: [{
                    content_type: "text",
                    title: "Nasa Picture of the day?",
                    payload: "ASTRONOMICAL_PICTURE"
                },
                {
                    content_type: "text",
                    title: "Mars Rover Photos",
                    payload: "MARS_ROVER_PICTURE"
                },
                {
                    content_type: "text",
                    title: "People in ISS",
                    payload: "PEOPLE_IN_ISS"
                },
                {
                    content_type: "text",
                    title: "ISS Location Now",
                    payload: "ISS_Location_Now"
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
            return err;
        });
}
