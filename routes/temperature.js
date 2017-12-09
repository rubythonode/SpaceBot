const rp            = require('request-promise');
const Promise       = require('bluebird');
const weather       = require('weather-js');
var commonFunctions = require('./commonFunctions.js');
const fbPageToken   = process.env.PAGE_ACCESS_TOKEN;

exports.sendLocationResponse = sendLocationResponse;
exports.sendResponse         = sendResponse;
///////////////////////////////////////////////////////////////////////
////////////////////////FETCH LOCATION////////////////////////////////
/////////////////////////////////////////////////////////////////////S

function sendLocationResponse(event) {
    Promise.coroutine(function* () {
        var sendLocResponse = yield sendLocationTextResponseToUser(event);
        return sendLocResponse;
    })().then((sendLocResponse) => {
        return sendLocResponse;
    }, (error) => {
        return error;
    })
}

function sendLocationTextResponseToUser(event, quoteToUser) {
    let sender = event.sender.id;
    var options = {
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: fbPageToken },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: {
                text: "I can tell you Temperature of your region",
                quick_replies: [
                    {
                        "content_type": "location",
                        "payload": "TEMPERATURE_FROM_LOCATION",
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
////////////////////////////////////////////////////////////////////////
////////////////// FINAL TEMPERATURE RESPONSE////////////////////////
////////////////////////////////////////////////////////////////////

function sendResponse(event, locationObj) {
    Promise.coroutine(function* () {
        var getLocation = yield findLocation(event, locationObj);
        var sendWeatherResponse = yield findWeather(event, getLocation);
        var sendFinalResponse = yield sendResponseToFb(event, sendWeatherResponse);

        return sendFinalResponse;
    })().then((sendFinalResponse) => {
        return sendFinalResponse;
    }, (error) => {
        return error;
    })
}

/////////////////////////////////////////////////////////////////////////////
///////////////////////////////AFTER USER ENTERS LOCATION/////////////////////
/////////////////////////////////////////////////////////////////////////////

function findLocation(event, locationObj) {
    return new Promise((resolve, reject) => {
        let sender = event.sender.id;
        var options = {
            uri: 'http://maps.googleapis.com/maps/api/geocode/json',
            qs: { latlng: locationObj.latitude + "," + locationObj.longitude },
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true
        };
        rp(options)
            .then((result) => {
                if (result.results != "undefined" && Array.isArray(result.results) && result.results[0].hasOwnProperty("address_components")
                    && Array.isArray(result.results[0].address_components), result.results[0].address_components[3]
                    && result.results[0].address_components[3].hasOwnProperty("long_name")) {
                    var resultObj = result.results[0].address_components[3].long_name;
                } else {
                    var resultObj = "earth";
                }
                return resolve(resultObj);
            })
            .catch((err) => {
                console.log(err);
                return reject(err);
            });
    })

}

function findWeather(event, regionObj) {
    return new Promise((resolve, reject) => {
        weather.find({ search: regionObj, degreeType: 'C' }, function (err, result) {
            if (result
                && result[0]
                && Object.keys(result[0]).length
                && result[0].current
                && result[0].current.temperature
                && result[0].current.humidity
                && result[0].current.windspeed
                && result[0].current.skytext) {
                resultObj = 'The temperature of ' + regionObj + ' is ' + result[0].current.temperature + '°C ' +
                    ' humidity level is ' + result[0].current.humidity + '%' +
                    ' wind speed is ' + result[0].current.windspeed +
                    ' and it is ' + result[0].current.skytext;
            }
            else {
                resultObj = "Sorry I couldnt find temperature of " + regionObj + " :(";
            }
            return resolve(resultObj);
        });
    });

}

function sendResponseToFb(event, WeathObj) {
    return new Promise((resolve, reject) => {
        commonFunctions.sendTextResponseToUser(event, WeathObj, {
            send: function (obj) {
                var resultObj = obj;
                return resolve(resultObj);
            }
        });
    })
}