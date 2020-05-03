
const STATE = {
  startScreen: 'startScreen',
  waitingForPlayers: 'waitingForPlayers',
  decision: 'decision',
  waitingForOpponent: 'waitingForOpponent',
  result: 'result',
  waitingForNextRound: 'waitingForNextRound',
  maxPlayersReached: 'maxPlayersReached',
};
Object.freeze(STATE);

const TRANSITION = {
  waitingForPlayers: [
    STATE.decision,
    STATE.maxPlayersReached
  ],
  decision: [
    STATE.waitingForOpponent
  ],
  waitingForOpponent: [
    STATE.result
  ],
  result: [
    STATE.decision
  ],
};
Object.freeze(TRANSITION);
