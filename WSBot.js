var TelegramBot = require('node-telegram-bot-api');
var Calendar = require('./calendar_js')

var token = '321444455:AAHVJCG-EKqLe9W5aYPmK_CFXHVPy4JO8MA';
var botOptions = {
    polling: true
};
var bot    = new TelegramBot(token, botOptions);
var meetOn = false;
var times  = [];
var locArr = [];
var users  = [];
var radius = 1000;

function calcTime(timesArr, startTime, endTime) {
    for(var i = 0; i < timesArr.length - 1; i += 2) {
      if(timesArr[i] > startTime) startTime = timesArr[i];
      if(timesArr[i + 1] < endTime) endTime = timesArr[i + 1];
    }

   if(startTime > endTime) return 0;
   else return startTime;
}

function check(arr, string) {
   arr.forEach(function(user) {
     if(user.name == string) {
       return user;
     }
   });

   return false;
}

bot.getMe().then(function (me) {

});

bot.on('text', function (msg) {
    var messageChatId = msg.chat.id;
    var messageText = msg.text;
    var messageDate = msg.date;
    var messageUsr = msg.from.username;
    var messageLoc = msg.location;
    var messageArr = messageText.split(' ');

    if (messageText === '/say') {
        sendMessageByBot(messageChatId, 'Ready For Duty!');
    }
    else if(messageArr[0] == '/meet') {
        if(!meetOn) {
          totalStart = parseInt(messageArr[1]);
          totalEnd   = parseInt(messageArr[2]);
          if(totalStart >= totalEnd) {
            sendMessageByBot(messageChatId, "Invalid data entered!");
            return;
          }
          sendMessageByBot(messageChatId, "Started meeting from " + totalStart + " to " + totalEnd);

          meetOn = true;
        }
        else {
          sendMessageByBot(messageChatId, "Meeting config already in process!");
        }
    }
    else if(messageArr[0] == "/add") {
      if(meetOn) {
          var timeStart;
          var timeEnd;

          timeStart = parseInt(messageArr[1]);
          timeEnd   = parseInt(messageArr[2]);

          if(timeStart < totalStart || timeEnd > totalEnd || timeStart > timeEnd) {
             sendMessageByBot(messageChatId, "Invalid data entered!");
             return;
          }

          var user = check(users, messageUsr);

          if(!user) {
            console.log("Added " + messageUsr);
            users.push({ name: messageUsr , times: [timeStart, timeEnd] });
          }
          else {
            console.log("Reconfigured user " + msg.from.username);
            users[users.indexOf(user)] = { name: user.name, times: [timeStart, timeEnd] };
          }

          sendMessageByBot(messageChatId, "Pushed new period from " +
           timeStart + " to " + timeEnd);
      }
      else {
          sendMessageByBot(messageChatId, "No meeting config in progress");
      }
    } else if (messageText == '/finish') {
        if (meetOn) {
            var timesArr = [];

            users.forEach(function(user) {
              timesArr.push(user.times[0], user.times[1]);
            });

            //sendMessageByBot(messageChatId, "Finished config, calculating... End");
            sendMessageByBot(messageChatId, "Time of meeting: " + calcTime(timesArr, totalStart, totalEnd));

            //var testItem = {lat: 50.434468, long: 30.5930923};
            locationRes(1000, messageChatId);



            locArr = [];
            meetOn = false;
        } else {
            sendMessageByBot(messageChatId, "No meet configs in progress!");
        }
    } else if (messageLoc) {
        sendMessageByBot(messageChatId, messageLoc);
    }

    console.log(msg);
});

bot.on('location', function (loc) {

    var messageChatId = loc.chat.id;
    var latitude = loc.location.latitude;
    var longitude = loc.location.longitude;

    var item = {
        lat: latitude,
        long: longitude
    };

    locArr.push(item);


});

function sendMessageByBot(aChatId, aMessage) {
    bot.sendMessage(aChatId, aMessage, {
        caption: 'I\'m a cute bot!'
    });
}

function sendLocationByBot(aChatId, latitude, longitude) {
    bot.sendLocation(aChatId, latitude, longitude);
}

function getAverageLocation(locations) {
    var lat = 0;
    var long = 0;
    locations.forEach(function (loc) {
        lat += loc.lat;
        long += loc.long;
    });
    lat = lat / locations.length;
    long = long / locations.length;
    var item = {
        lat: lat,
        long: long
    };
    return item;
}

function locationRes(radius, messageChatId) {
    var myloc = getAverageLocation(locArr);
    //var myloc = testItem;
    var url = "https://api.foursquare.com/v2/venues/search?ll=" + myloc.lat + "," + myloc.long + "&near=" + myloc.lat + "," + myloc.long + "&radius=" + radius + "&categoryId=4bf58dd8d48988d17f941735,4bf58dd8d48988d182941735,4d4b7105d754a06373d81259,4d4b7105d754a06376d81259,4bf58dd8d48988d1f9941735&oauth_token=O2SJI5N5JEIMOL5ODEEGX0IDJ2CYGAWDM0IM2MP01AL2Z2AQ&v=20161203";

    var request = require("request");

    request({
        url: url,
        json: true
    }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            // console.log();
            var res = body.response.venues[0].location.lat + " " + body.response.venues[0].location.lng +
                " name: " + body.response.venues[0].name;
            if (res !== "") {
                sendLocationByBot(messageChatId, body.response.venues[0].location.lat, body.response.venues[0].location.lng);
                sendMessageByBot(messageChatId, body.response.venues[0].name);
                // sendMessageByBot(messageChatId, "https://www.google.com/calendar/event?eid=MWVibjE3YzlmNHVpdGY1Z3NkbHBsMmIyZDhfMjAxNjEyMDNUMTYwMDAwWiA5YTEyYjdzM2o3cmFmN2xza2Z1NDJtMzYxNEBn");
            } else {
                locationRes(2 * radius);
            }
        }
    });
}
