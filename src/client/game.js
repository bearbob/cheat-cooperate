var socket = io();
socket.emit('new player');

socket.on('state', function(playerObject) {
  console.log('Received state: '+playerObject.state);
  switch(playerObject.state) {
    case STATE.waitingForPlayers:
      clearScreen();
      drawTextScreen('Not enough players');
      break;
    case STATE.decision:
      clearScreen();
      drawDecisionInterface();
      drawScore(playerObject.score);
      break;
    case STATE.waitingForOpponent:
      clearScreen();
      drawTextScreen('Waiting for the other player to decide...');
      drawScore(playerObject.score);
      break;
    case STATE.result:
      clearScreen();
      drawTextScreen('Game has ended. Result: '+playerObject.result);
      drawScore(playerObject.score);
      drawReplayButton();
      break;
  }
});

var currentState = STATE.decision;

setupCanvas();
drawTextScreen('Not enough players');
