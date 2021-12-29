// based on
// https://github.com/giambaJ/jChat/blob/1cc4475c55bcea3b8610e3577c593f2268b18ba4/v2/script.js
// https://github.com/giambaJ/jChat/blob/1cc4475c55bcea3b8610e3577c593f2268b18ba4/v2/utils.js#L21
import $ from "jquery";
import ReconnectingWebSocket from 'reconnecting-websocket';

function TwitchAPI(url) {
  return $.ajax({
    type: "GET", //GET, POST, PUT
        url: url,  //the url to call
        dataType: "json",
        beforeSend: function (xhr) {   //Set token here
            xhr.setRequestHeader("Authorization", 'Bearer ' + 'dm3fb86nflzvlj9xqg8y4scdqmxv8q');
            xhr.setRequestHeader("Client-Id", "hvr2k1lvhk4t7ln331a78ndfwmav8a");
      }
    })
}

export const Chat = {
    info: {
        channel: null,
    },

    load: function(callback) {
        TwitchAPI('https://api.twitch.tv/helix/users?' + Chat.info.channel).done(function(res) {
            Chat.info.channelID = res.users[0]._id;

            callback(true);
        });
    },



    connect: function(channel) {
        Chat.info.channel = channel;
        var title = $(document).prop('title');
        $(document).prop('title', title + Chat.info.channel);

        Chat.load(function() {
            console.log('jChat: Connecting to IRC server...');
            var socket = new ReconnectingWebSocket('wss://irc-ws.chat.twitch.tv', 'irc', { reconnectInterval: 2000 });

            socket.onopen = function() {
                console.log('jChat: Connected');
                socket.send('PASS blah\r\n');
                socket.send('NICK justinfan' + Math.floor(Math.random() * 99999) + '\r\n');
                socket.send('CAP REQ :twitch.tv/commands twitch.tv/tags\r\n');
                socket.send('JOIN #' + Chat.info.channel + '\r\n');
            };

            socket.onclose = function() {
                console.log('jChat: Disconnected');
            };

            socket.onmessage = function(data) {
                data.data.split('\r\n').forEach(line => {
                    if (!line) return;
                    var message = window.parseIRC(line);
                    if (!message.command) return;

                    switch (message.command) {
                        case "PING":
                            socket.send('PONG ' + message.params[0]);
                            return;
                        case "JOIN":
                            console.log('jChat: Joined channel #' + Chat.info.channel);
                            return;
                        case "PRIVMSG":
                            if (message.params[0] !== '#' + channel || !message.params[1]) return;

                            var nick = message.prefix.split('@')[0].split('!')[0];
                            console.log(nick);

                            console.log(message.params[1]);

                            return;
                    }
                });
            };
        });
    }
};
