const game = require('../src/server/gamestate');

afterEach(() => {
  game.cleanState();
});

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
