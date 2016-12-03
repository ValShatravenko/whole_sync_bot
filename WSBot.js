var TelegramBot = require('node-telegram-bot-api');

var token = '321444455:AAHVJCG-EKqLe9W5aYPmK_CFXHVPy4JO8MA';
var botOptions = {
    polling: true
};
var bot = new TelegramBot(token, botOptions);
var meetOn = false;
var times  = [];


bot.getMe().then(function(me)
{
    console.log('Hello! My name is %s!', me.first_name);
    console.log('My id is %s.', me.id);
    console.log('And my username is @%s.', me.username);
});

bot.on('text', function(msg)
{
    var messageChatId = msg.chat.id;
    var messageText = msg.text;
    var messageDate = msg.date;
    var messageUsr = msg.from.username;
    var messageLoc = msg.location;
    var messageArr = messageText.split(' ');

    if (messageText === '/say') {
        sendMessageByBot(messageChatId, 'Ready For Duty!');
        sendMessageByBot(messageChatId, messageArr[1]);
    }
    else if(messageText.substr(0,5) == '/meet') {
        var meetStart;
        var meetEnd;

        if(!meetOn) {
          meetStart = messageArr[1];
          meetEnd   = messageArr[2];

          sendMessageByBot("Configurating meeting from " + meetStart + " to " + meetEnd);

          meetOn = true;
        }
        else {
          sendMessageByBot("Meeting config already in process!");
        }
    }
    else if(messageText.substr(0,4) == "/add") {
      if(meetOn) {
          times.push(messageArr[1], messageArr[2]);
          sendMessageByBot("Pushed new period from " +
           messageArr[1] + " to " + messageArr[2]);
      }
      else {
          sendMessageByBot("No meeting config in progress");
      }
    }
    else if(messageText == '/finish') {
        if(meetOn) {
          sendMessageByBot("Finished cobfig, calculating... End");
          for(var i = 0; i < times.length - 2; i += 2) {
            sendMessageByBot(times[i] + " - " + times[i+1] + "\n");
          }
          meetOn = false;
        }
        else {
          sendMessageByBot("No meet configs in progress!");
        }
    }
    else if(messageLoc) {
        sendMessageByBot(messageChatId, messageLoc);
    }

    console.log(msg);
});

function sendMessageByBot(aChatId, aMessage)
{
    bot.sendMessage(aChatId, aMessage, { caption: 'I\'m a cute bot!' });
}
