var game = require('../src/server/gamestate');
var constants = require('../src/server/constants');

afterEach(() => {
  game.cleanState();
});

//======================== Test: createRoom ========================//

test('create new room', () => {
  expect(game.createRoom('test')).toBe(true);
});

test('create duplicate room', () => {
  expect(game.createRoom('test')).toBe(true);
  expect(game.createRoom('test')).toBe(false);
});

test('create room: null', () => {
  expect(game.createRoom(null)).toBe(true);
  expect(game.createRoom(undefined)).toBe(true);
});

test('create room: non-string', () => {
  expect(game.createRoom(1)).toBe(true);
  expect(game.createRoom(2.5)).toBe(true);
});

//======================== Test: addPlayer ========================//

test('adding single player', () => {
  game.createRoom('test');
  expect(game.countPlayers('test')).toBe(0);
  expect(game.addPlayer('test', 'a')).toBe(true);
  expect(game.countPlayers('test')).toBe(1);
});

test('adding player to non-existent room', () => {
  expect(game.addPlayer('test', 'a')).toBe(false);
});

test('adding multiple players', () => {
  game.createRoom('test');
  expect(game.countPlayers('test')).toBe(0);
  game.addPlayer('test', 'a');
  game.addPlayer('test', 'b');
  game.addPlayer('test', 'c');
  expect(game.countPlayers('test')).toBe(3);
});

test('retrieve room ID', () => {
  game.createRoom('test');
  game.addPlayer('test', 'a');
  expect(game.getRoomId('a')).toBe('test');
});

test('play example round with 2 players: coop/coop', () => {
  let roomId = 'test';
  let a = 'a';
  let b = 'b';
  game.createRoom(roomId);
  game.addPlayer(roomId, a);
  game.addPlayer(roomId, b);
  expect(game.roomIsOpen(roomId)).toBe(true);

  game.voteToStart(a);
  game.voteToStart(b);
  expect(game.roomIsOpen(roomId)).toBe(false);
  expect(game.getPlayerState(a).state).toBe(constants.state.decision);

  game.setPlayerDecision(a, true);
  expect(game.getPlayerState(a).score).toBe(-1);
  expect(game.getPlayerState(a).state).toBe(constants.state.waitingForOpponent);

  game.setPlayerDecision(b, true);
  game.calculateResults(roomId);
  expect(game.getPlayerState(a).state).toBe(constants.state.result);
  expect(game.getPlayerState(a).score).toBe(2);
  expect(game.getPlayerState(b).score).toBe(2);

  expect(game.voteNextRound(a)).toBe(false);
  expect(game.voteNextRound(b)).toBe(true);
  expect(game.getPlayerState(a).state).toBe(constants.state.decision);
  expect(game.getPlayerState(b).state).toBe(constants.state.decision);

  game.setPlayerDecision(a, true);
  expect(game.getPlayerState(a).score).toBe(1);
  expect(game.getPlayerState(a).state).toBe(constants.state.waitingForOpponent);

  game.setPlayerDecision(b, true);
  game.calculateResults(roomId);
  expect(game.getPlayerState(a).state).toBe(constants.state.result);
  expect(game.getPlayerState(a).score).toBe(4);
  expect(game.getPlayerState(b).score).toBe(4);
});

test('play example round with 2 players: coop/cheat', () => {
  let roomId = 'test';
  let a = 'a';
  let b = 'b';
  game.createRoom(roomId);
  game.addPlayer(roomId, a);
  game.addPlayer(roomId, b);
  expect(game.roomIsOpen(roomId)).toBe(true);

  game.voteToStart(a);
  game.voteToStart(b);
  expect(game.roomIsOpen(roomId)).toBe(false);
  expect(game.getPlayerState(a).state).toBe(constants.state.decision);

  game.setPlayerDecision(a, true);
  expect(game.getPlayerState(a).score).toBe(-1);
  expect(game.getPlayerState(a).state).toBe(constants.state.waitingForOpponent);

  game.setPlayerDecision(b, true);
  game.calculateResults(roomId);
  expect(game.getPlayerState(a).state).toBe(constants.state.result);
  expect(game.getPlayerState(a).score).toBe(2);
  expect(game.getPlayerState(b).score).toBe(2);

  expect(game.voteNextRound(a)).toBe(false);
  expect(game.voteNextRound(b)).toBe(true);
  expect(game.getPlayerState(a).state).toBe(constants.state.decision);
  expect(game.getPlayerState(b).state).toBe(constants.state.decision);

  game.setPlayerDecision(a, true);
  expect(game.getPlayerState(a).score).toBe(1);
  expect(game.getPlayerState(a).state).toBe(constants.state.waitingForOpponent);

  game.setPlayerDecision(b, false);
  expect(game.getPlayerState(b).score).toBe(2);
  game.calculateResults(roomId);
  expect(game.getPlayerState(a).state).toBe(constants.state.result);
  expect(game.getPlayerState(a).score).toBe(1);
  expect(game.getPlayerState(b).score).toBe(5);
});

test('play example round with 2 players: cheat/cheat', () => {
  let roomId = 'test';
  let a = 'a';
  let b = 'b';
  game.createRoom(roomId);
  game.addPlayer(roomId, a);
  game.addPlayer(roomId, b);
  expect(game.roomIsOpen(roomId)).toBe(true);

  game.voteToStart(a);
  game.voteToStart(b);
  expect(game.roomIsOpen(roomId)).toBe(false);
  expect(game.getPlayerState(a).state).toBe(constants.state.decision);

  game.setPlayerDecision(a, true);
  expect(game.getPlayerState(a).score).toBe(-1);
  expect(game.getPlayerState(a).state).toBe(constants.state.waitingForOpponent);

  game.setPlayerDecision(b, false);
  game.calculateResults(roomId);
  expect(game.getPlayerState(a).state).toBe(constants.state.result);
  expect(game.getPlayerState(a).score).toBe(-1);
  expect(game.getPlayerState(b).score).toBe(3);

  expect(game.voteNextRound(a)).toBe(false);
  expect(game.voteNextRound(b)).toBe(true);
  expect(game.getPlayerState(a).state).toBe(constants.state.decision);
  expect(game.getPlayerState(b).state).toBe(constants.state.decision);

  game.setPlayerDecision(a, true);
  expect(game.getPlayerState(a).score).toBe(-2);
  expect(game.getPlayerState(a).state).toBe(constants.state.waitingForOpponent);

  game.setPlayerDecision(b, false);
  expect(game.getPlayerState(b).score).toBe(3);
  game.calculateResults(roomId);
  expect(game.getPlayerState(a).state).toBe(constants.state.result);
  expect(game.getPlayerState(a).score).toBe(-2);
  expect(game.getPlayerState(b).score).toBe(6);
});
