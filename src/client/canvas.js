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
  document.getElementById('canvas_buttons').style.display='none';
  document.getElementById('button_vote').style.display='none';
  document.getElementById('button_replay').style.display='none';
  document.getElementById('canvas_message').innerHTML='';
}

function drawTextScreen(message) {
  document.getElementById('canvas_message').innerHTML=message;
}

function drawVoteButton() {
  document.getElementById('button_vote').style.display='inline';
}

function drawReplayButton() {
  document.getElementById('button_replay').style.display='inline';
}

function drawDecisionInterface() {
  document.getElementById('canvas_buttons').style.display='inline';
}
