var game = require('../src/server/gamestate');
var constants = require('../src/server/constants');


let setupGame = (roomId, players) => {
  game.createRoom(roomId);
  players.forEach(p => game.addPlayer(roomId, p));
  players.forEach(p => game.voteToStart(p));
};

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

test('adding multiple players with helper function', () => {
  let roomId = 'test';
  let a = 'a';
  let b = 'b';
  let c = 'c';
  setupGame(roomId, [a, b, c]);
  expect(game.countPlayers('test')).toBe(3);
});

test('trying to add a player after the game has started', () => {
  let roomId = 'test';
  let a = 'a';
  let b = 'b';
  game.createRoom(roomId);
  game.addPlayer(roomId, a);
  game.addPlayer(roomId, b);

  expect(game.voteToStart(a)).toBe(1);
  expect(game.voteToStart(b)).toBe(0);
  expect(game.roomIsOpen(roomId)).toBe(false);
  expect(game.addPlayer(roomId, 'c')).toBe(false);
});

//======================== Test: removePlayer ========================//

test('remove player from open room', () => {
  game.createRoom('test');
  game.addPlayer('test', 'a');
  game.addPlayer('test', 'b');
  game.removePlayer('a');
  expect(game.countPlayers('test')).toBe(1);
});

test('remove only player from open room', () => {
  game.createRoom('test');
  game.addPlayer('test', 'a');
  game.removePlayer('a');
  expect(game.countPlayers('test')).toBe(0);
  expect(game.roomIsOpen('test')).toBe(false);
});

//======================== Smaller test cases ========================//

test('retrieve room ID', () => {
  game.createRoom('test');
  game.addPlayer('test', 'a');
  expect(game.getRoomId('a')).toBe('test');
});

test('room is open after players joined', () => {
  let roomId = 'test';
  let a = 'a';
  let b = 'b';
  game.createRoom(roomId);
  game.addPlayer(roomId, a);
  game.addPlayer(roomId, b);
  expect(game.roomIsOpen(roomId)).toBe(true);
});

test('vote to start game', () => {
  let roomId = 'test';
  let a = 'a';
  let b = 'b';
  game.createRoom(roomId);
  game.addPlayer(roomId, a);
  game.addPlayer(roomId, b);

  expect(game.voteToStart(a)).toBe(1);
  expect(game.voteToStart(b)).toBe(0);
  expect(game.roomIsOpen(roomId)).toBe(false);
  expect(game.getPlayerState(a).state).toBe(constants.state.decision);
});

test('vote to start game (uneven)', () => {
  let roomId = 'test';
  let a = 'a';
  let b = 'b';
  let c = 'c';
  game.createRoom(roomId);
  game.addPlayer(roomId, a);
  game.addPlayer(roomId, b);
  game.addPlayer(roomId, c);

  expect(game.voteToStart(a)).toBe(2);
  expect(game.roomIsOpen(roomId)).toBe(true);
});

//======================== Test getRanking ========================//

test('normal ranking with different scores', () => {
  let roomId = 'test';
  let a = 'a';
  let b = 'b';
  setupGame(roomId, [a, b]);
  expect(game.roomIsOpen(roomId)).toBe(false);

  game.setPlayerDecision(a, true);
  game.setPlayerDecision(b, false);
  game.calculateResults(roomId);
  expect(game.getPlayerState(a).score).toBe(-1);
  expect(game.getPlayerState(b).score).toBe(3);
  expect(game.getRanking(roomId)[0].score).toBe(3);
  expect(game.getRanking(roomId)[1].score).toBe(-1);
});

//======================== Complex gameplay simulations ========================//

test('play example round with 2 players: coop/coop', () => {
  let roomId = 'test';
  let a = 'a';
  let b = 'b';
  setupGame(roomId, [a, b]);

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

test('play example round with 4 players: coop/coop', () => {
  let roomId = 'test';
  let a = 'a';
  let b = 'b';
  let c = 'c';
  let d = 'd';
  setupGame(roomId, [a, b, c, d]);

  game.setPlayerDecision(a, true);
  game.setPlayerDecision(b, true);
  game.setPlayerDecision(c, true);
  game.setPlayerDecision(d, true);
  game.calculateResults(roomId);
  expect(game.getPlayerState(a).score).toBe(2);
  expect(game.getPlayerState(b).score).toBe(2);
  expect(game.getPlayerState(c).score).toBe(2);
  expect(game.getPlayerState(d).score).toBe(2);

  expect(game.voteNextRound(a)).toBe(false);
  expect(game.voteNextRound(b)).toBe(false);
  expect(game.voteNextRound(c)).toBe(false);
  expect(game.voteNextRound(d)).toBe(true);
  expect(game.getPlayerState(a).state).toBe(constants.state.decision);
  expect(game.getPlayerState(b).state).toBe(constants.state.decision);

  game.setPlayerDecision(a, true);
  game.setPlayerDecision(b, true);
  game.setPlayerDecision(c, true);
  game.setPlayerDecision(d, true);
  game.calculateResults(roomId);
  expect(game.getPlayerState(a).score).toBe(4);
  expect(game.getPlayerState(b).score).toBe(4);
  expect(game.getPlayerState(c).score).toBe(4);
  expect(game.getPlayerState(d).score).toBe(4);
});

test('play example round with 2 players: coop', () => {
  let roomId = 'test';
  let a = 'a';
  let b = 'b';
  setupGame(roomId, [a, b]);

  game.setPlayerDecision(a, true);
  expect(game.getPlayerState(a).score).toBe(-1);
  expect(game.getPlayerState(a).state).toBe(constants.state.waitingForOpponent);

  game.setPlayerDecision(b, true);
  game.calculateResults(roomId);
  expect(game.getPlayerState(a).state).toBe(constants.state.result);
  expect(game.getPlayerState(a).score).toBe(2);
  expect(game.getPlayerState(b).score).toBe(2);
});

test('play example round with 2 players: coop (1 round with vote)', () => {
  let roomId = 'test';
  let a = 'a';
  let b = 'b';
  setupGame(roomId, [a, b]);

  game.setPlayerDecision(a, true);
  game.setPlayerDecision(b, true);
  game.calculateResults(roomId);

  expect(game.voteNextRound(a)).toBe(false);
  expect(game.voteNextRound(b)).toBe(true);
  expect(game.getPlayerState(a).state).toBe(constants.state.decision);
  expect(game.getPlayerState(b).state).toBe(constants.state.decision);
});

test('play example round with 2 players: coop/cheat (2 rounds)', () => {
  let roomId = 'test';
  let a = 'a';
  let b = 'b';
  setupGame(roomId, [a, b]);

  game.setPlayerDecision(a, true);

  game.setPlayerDecision(b, true);
  game.calculateResults(roomId);

  game.voteNextRound(a);
  game.voteNextRound(b);

  game.setPlayerDecision(a, true);
  game.setPlayerDecision(b, false);
  game.calculateResults(roomId);

  expect(game.getPlayerState(a).state).toBe(constants.state.result);
  expect(game.getPlayerState(a).score).toBe(1);
  expect(game.getPlayerState(b).score).toBe(5);
});

test('play example round with 2 players: cheat (1 round)', () => {
  let roomId = 'test';
  let a = 'a';
  let b = 'b';
  setupGame(roomId, [a, b]);

  game.setPlayerDecision(a, true);
  expect(game.getPlayerState(a).score).toBe(-1);
  expect(game.getPlayerState(a).state).toBe(constants.state.waitingForOpponent);

  game.setPlayerDecision(b, false);
  game.calculateResults(roomId);
  expect(game.getPlayerState(a).state).toBe(constants.state.result);
  expect(game.getPlayerState(a).score).toBe(-1);
  expect(game.getPlayerState(b).score).toBe(3);
});

test('play example round with 2 players: cheat and restart', () => {
  let roomId = 'test';
  let a = 'a';
  let b = 'b';
  setupGame(roomId, [a, b]);

  game.setPlayerDecision(a, true);
  game.setPlayerDecision(b, false);
  game.calculateResults(roomId);

  expect(game.voteNextRound(a)).toBe(false);
  expect(game.voteNextRound(b)).toBe(true);
  expect(game.getPlayerState(a).state).toBe(constants.state.decision);
  expect(game.getPlayerState(b).state).toBe(constants.state.decision);
});

test('play example round with 2 players: cheat/cheat (2 rounds)', () => {
  let roomId = 'test';
  let a = 'a';
  let b = 'b';
  setupGame(roomId, [a, b]);

  game.setPlayerDecision(a, true);
  game.setPlayerDecision(b, false);
  game.calculateResults(roomId);

  game.voteNextRound(a);
  game.voteNextRound(b);

  game.setPlayerDecision(a, true);
  game.setPlayerDecision(b, false);
  game.calculateResults(roomId);
  expect(game.getPlayerState(a).score).toBe(-2);
  expect(game.getPlayerState(b).score).toBe(6);
});
