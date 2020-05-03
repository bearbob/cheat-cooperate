var socket = io();
var roomId;

function createServer() {
  let id = encodeURI(document.getElementById('serverid_input').value);
  console.log('Attempting to create server "'+id+'"');
  if(id.length < 1) {
    document.getElementById('selection_error').innerHTML='The game ID cannot be empty';
    return;
  }

  socket.emit('create', id);
}

function joinServer() {
  let id = encodeURI(document.getElementById('serverid_input').value);
  console.log('Attempting to join server "'+id+'"');
  if(id.length < 1) {
    document.getElementById('selection_error').innerHTML='The game ID cannot be empty';
    return;
  }
  socket.emit('join', id);
}

function setScore(score) {
  document.getElementById('score').innerHTML='Score: '+score;
}

socket.on('joined_game', (room) => {
  roomId = room.id;
  document.getElementById('action_menu').style.display='none';
  document.getElementById('game_id').innerHTML='Room: '+room.id;
});

socket.on('join_error', (message) => {
  console.log('Join failed. Error: '+message);
  document.getElementById('selection_error').innerHTML=message;
});

socket.on('add_log', (message) => {
  console.log('Received log message: '+message);
  let logElement = document.getElementById('game_log');
  logElement.innerHTML=message+'<br/>'+logElement.innerHTML;
});

socket.on('playercount', (count) => {
  console.log('Players in the room: '+count);
  document.getElementById('playercount').innerHTML='Players: '+count;
  if(count%2 === 0) {
    clearScreen();
    drawTextScreen('Enough players to begin. Vote to start.');
    drawVoteButton();
  } else {
    clearScreen();
    drawTextScreen('Not enough players');
  }
});

socket.on('state', function(stateObj) {
  console.log('Received state: '+stateObj.state);
  setScore(stateObj.score);
  switch(stateObj.state) {
    case STATE.waitingForPlayers:
      clearScreen();
      drawTextScreen('Not enough players');
      break;
    case STATE.waitingForNextRound:
      clearScreen();
      drawTextScreen('Waiting for the other players to continue...');
      break;
    case STATE.decision:
      clearScreen();
      drawTextScreen('You are playing with <b>'+stateObj.partner+'</b>');
      drawDecisionInterface();
      break;
    case STATE.waitingForOpponent:
      clearScreen();
      drawTextScreen('Waiting for the other players to decide...');
      break;
    case STATE.result:
      clearScreen();
      let msg = 'The round has ended. ';
      switch(stateObj.result) {
        case 0:
          msg += 'You successfully worked together!';
          break;
        case 1:
          msg += 'You have been betrayed!';
          break;
        case 2:
          msg += 'You both tried to betray each other.';
          break;
        case 3:
          msg += 'You successfully betrayed your partner!';
          break;
      }
      drawTextScreen(msg);
      drawReplayButton();
      break;
  }
});

var currentState = STATE.decision;

drawTextScreen('Not enough players');
