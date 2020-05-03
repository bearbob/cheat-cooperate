function cooperate() {
  console.log("Cooperating");
  socket.emit('cooperate', true);
}

function cheat() {
  console.log("Cheating");
  socket.emit('cooperate', false);
}

function next() {
  console.log("Ready for next round");
  socket.emit('replay');
}

function vote() {
  console.log("Voted to start");
  socket.emit('vote');
  clearScreen();
  drawTextScreen('Waiting for the other players to start...');
}

function clearScreen() {
  //TODO: Hide buttons
}

function drawTextScreen(message) {
  document.getElementById('canvas_message').innerHTML=message;
}

function drawVoteButton() {
  let button = '<div class="button">'+ELEMENTS.button_vote.text+'</div>';
  document.getElementById('canvas_buttons').innerHTML=button;
}

function drawReplayButton() {

}

function drawDecisionInterface() {

}
