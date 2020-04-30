// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/src/static'));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'src/index.html'));
});

// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});

//------------------------------------------------------------------

var players = {};
// Add the WebSocket handlers
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
    delete players[socket.id];
  });
  socket.on('new player', function() {
    players[socket.id] = {
      score: 0,
      state: 'decision',
      cooperate: null
    };
    let playerCount = Object.keys(players).length;
    console.log('Added new player to the game. Players: '+playerCount);
  });
  socket.on('cooperate', function(cooperates) {
    //decline the action of not enought players are present to play the Game//TODO
    let playerCount = Object.keys(players).length;
    if(playerCount < 2) {
      console.log('Not enough players: '+playerCount);
      socket.emit('error', { message: 'Not enough players in the game.'});
    }
    players[socket.id] = {
      score: 0,
      cooperate: cooperates
    };
    console.log('Cooperate: '+cooperates);
  });
});

setInterval(function() {
  //check if all players have given a decision
  let allCooperate = true;
  for (let p in players) {
    if(players[p].cooperate !== true && players[p].cooperate !== false) {
      return; //do nothing
    }
    if(!players[p].cooperate) {
      allCooperate = false;
    }
  }
  io.sockets.emit('decision', allCooperate);
}, 100);
