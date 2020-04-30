
const STATE = {
  waitingForPlayers: 0,
  decision: 1,
  waitingForOpponent: 2,
  result: 3,
  maxPlayersReached: 4,
};
Object.freeze(STATE);


// exports for nodejs
module.exports = {
  state: STATE
};
