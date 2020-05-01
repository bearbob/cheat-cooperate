var constants = require('./constants');


var players = {};

module.exports = {
  addPlayer: (id) => {
    players[id] = {
      score: 0,
      state: constants.state.waitingForPlayers,
      cooperate: null,
      result: null,
    };
  },

  removePlayer: (id) => {
    console.log('A user disconnected: '+id);
    delete players[id];
  },

  getPlayer: (id) => {
    return players[id];
  },
  countPlayers: () => {
    return Object.keys(players).length;
  },
  getPlayerIDs: () => {
    return Object.keys(players);
  }
};
