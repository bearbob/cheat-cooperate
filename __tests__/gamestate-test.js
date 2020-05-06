var game = require('../src/server/gamestate');
var constants = require('../src/server/constants');


const setupGame = (roomId, players) => {
  game.createRoom(roomId);
  players.forEach(p => game.addPlayer(roomId, p));
  players.forEach(p => game.voteToStart(p));
};

var roomId = 'test';
var a = 'a';
var b = 'b';
var c = 'c';
var d = 'd';

afterEach(() => {
  game.cleanState();
});

//======================== Test: createRoom ========================//

test('create new room', () => {
  expect(game.createRoom('test')).toBe(true);
});

test('create two different rooms', () => {
  expect(game.createRoom('test_a')).toBe(true);
  expect(game.createRoom('test_b')).toBe(true);
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

test('adding multiple players to two rooms', () => {
  game.createRoom('test');
  expect(game.countPlayers('test')).toBe(0);
  game.addPlayer('test', 'a');
  game.addPlayer('test', 'b');
  game.addPlayer('test', 'c');

  game.createRoom('test2');
  expect(game.countPlayers('test2')).toBe(0);
  game.addPlayer('test2', 'a2');
  game.addPlayer('test2', 'b2');
  game.addPlayer('test2', 'c2');
  expect(game.countPlayers('test2')).toBe(3);
});

test('adding multiple players with helper function', () => {
  setupGame(roomId, [a, b, c]);
  expect(game.countPlayers('test')).toBe(3);
});

test('trying to add a player after the game has started', () => {
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
  game.createRoom(roomId);
  game.addPlayer(roomId, a);
  game.addPlayer(roomId, b);
  expect(game.roomIsOpen(roomId)).toBe(true);
});

test('vote to start game', () => {
  game.createRoom(roomId);
  game.addPlayer(roomId, a);
  game.addPlayer(roomId, b);

  expect(game.voteToStart(a)).toBe(1);
  expect(game.voteToStart(b)).toBe(0);
  expect(game.roomIsOpen(roomId)).toBe(false);
  expect(game.getPlayerState(a).state).toBe(constants.state.decision);
});

test('vote to start game (uneven)', () => {
  game.createRoom(roomId);
  game.addPlayer(roomId, a);
  game.addPlayer(roomId, b);
  game.addPlayer(roomId, c);

  expect(game.voteToStart(a)).toBe(2);
  expect(game.roomIsOpen(roomId)).toBe(true);
});

test('vote to start game in two rooms', () => {
  game.createRoom(roomId);
  game.addPlayer(roomId, a);
  game.addPlayer(roomId, b);
  game.voteToStart(a);
  game.voteToStart(b);

  game.createRoom(roomId+'2');
  game.addPlayer(roomId+'2', a+'2');
  game.addPlayer(roomId+'2', b+'2');

  expect(game.voteToStart(a+'2')).toBe(1);
  expect(game.voteToStart(b+'2')).toBe(0);
  expect(game.roomIsOpen(roomId+'2')).toBe(false);
  expect(game.getPlayerState(a+'2').state).toBe(constants.state.decision);
});

//======================== Test getRanking ========================//

test('ranking result score is the same for different players', () => {
  setupGame(roomId, [a, b]);
  expect(game.roomIsOpen(roomId)).toBe(false);

  game.setPlayerDecision(a, true);
  game.setPlayerDecision(b, false);
  game.calculateResults(roomId);
  expect(game.getRanking(a)[0].score).toBe(game.getRanking(b)[0].score);
  expect(game.getRanking(a)[1].score).toBe(game.getRanking(b)[1].score);
});

test('normal ranking with different scores', () => {
  setupGame(roomId, [a, b]);
  expect(game.roomIsOpen(roomId)).toBe(false);

  game.setPlayerDecision(a, true);
  game.setPlayerDecision(b, false);
  game.calculateResults(roomId);
  expect(game.getPlayerState(a).score).toBe(-1);
  expect(game.getPlayerState(b).score).toBe(3);
  expect(game.getRanking(a)[0].score).toBe(3);
  expect(game.getRanking(a)[1].score).toBe(-1);
});

test('normal ranking with different scores and given playerId', () => {
  setupGame(roomId, [a, b]);
  expect(game.roomIsOpen(roomId)).toBe(false);

  game.setPlayerDecision(a, true);
  game.setPlayerDecision(b, false);
  game.calculateResults(roomId);
  expect(game.getRanking(a)[1].name).toBe('You');
  expect(game.getRanking(a)[1].score).toBe(-1);
});

//======================== Complex gameplay simulations ========================//

test('play example round with 2 players: coop/coop', () => {
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

test('play example round with 4 players: coop (1 round)', () => {
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
});

test('play example round with 4 players: coop (2 rounds)', () => {
  setupGame(roomId, [a, b, c, d]);

  game.setPlayerDecision(a, true);
  game.setPlayerDecision(b, true);
  game.setPlayerDecision(c, true);
  game.setPlayerDecision(d, true);
  game.calculateResults(roomId);

  expect(game.voteNextRound(a)).toBe(false);
  expect(game.voteNextRound(b)).toBe(false);
  expect(game.voteNextRound(c)).toBe(false);
  expect(game.voteNextRound(d)).toBe(true);

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

test('play example round with 4 players: coop (3 rounds)', () => {
  setupGame(roomId, [a, b, c, d]);

  game.setPlayerDecision(a, true);
  game.setPlayerDecision(b, true);
  game.setPlayerDecision(c, true);
  game.setPlayerDecision(d, true);
  game.calculateResults(roomId);

  expect(game.voteNextRound(a)).toBe(false);
  expect(game.voteNextRound(b)).toBe(false);
  expect(game.voteNextRound(c)).toBe(false);
  expect(game.voteNextRound(d)).toBe(true);

  game.setPlayerDecision(a, true);
  game.setPlayerDecision(b, true);
  game.setPlayerDecision(c, true);
  game.setPlayerDecision(d, true);
  game.calculateResults(roomId);

  expect(game.voteNextRound(a)).toBe(false);
  expect(game.voteNextRound(b)).toBe(false);
  expect(game.voteNextRound(c)).toBe(false);
  expect(game.voteNextRound(d)).toBe(true);

  game.setPlayerDecision(a, true);
  game.setPlayerDecision(b, true);
  game.setPlayerDecision(c, true);
  game.setPlayerDecision(d, true);
  game.calculateResults(roomId);
  expect(game.getPlayerState(a).score).toBe(6);
  expect(game.getPlayerState(b).score).toBe(6);
  expect(game.getPlayerState(c).score).toBe(6);
  expect(game.getPlayerState(d).score).toBe(6);
});

test('play example round with 2 players: coop', () => {
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
