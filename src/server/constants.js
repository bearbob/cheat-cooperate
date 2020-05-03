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

// names from Suikoden II. Go play it, if you haven't by now!
const SuikodenNames = [
  'Abizboah', 'Adlai', 'Alberto', 'Alex', 'Amada', 'Anita', 'Annallee', 'Apple', 'Ayda',
  'Badeaux', 'Barbara', 'Bob', 'Bolgan', 'Boris',
  'Camus', 'Chaco', 'Clive', 'Connell',
  'Eilie', 'Emilia',
  'Feather', 'Fitcher', 'Flik', 'Freed', 'Futch',
  'Gabocha', 'Gadget', 'Gantetsu', 'Gengen', 'Genshu', 'Georg', 'Gijimu', 'Gilbert', 'Gordon',
  'Hai Yo', 'Hanna', 'Hans', 'Hauser', 'Hilda', 'Hix', 'Hoi', 'Huan', 'Humphrey',
  'Jeane', 'Jess', 'Jude',
  'Kahn', 'Karen', 'Kasumi', 'Kiba', 'Killey', 'Kinnison', 'Klaus', 'Koyu',
  'Lebrante', 'Leona', 'Long Chan-Chan', 'Lorelai', 'Lo Wen', 'Luc',
  'Marlowe', 'Maximillian', 'Mazus', 'Meg', 'Miklotov', 'Millie', 'Mondo', 'Mukumuku',
  'Nanami', 'Nina',
  'Oulan',
  'Pesmerga', 'Pico',
  'Raura', 'Richmond', 'Ridley', 'Rikimaru', 'Rina', 'Riou',
  'Sasuke', 'Sheena', 'Shilo', 'Shin', 'Shiro', 'Shu', 'Sid', 'Sierra', 'Sigfried', 'Simone', 'Stallion',
  'Tai Ho', 'Taki', 'Templeton', 'Tengaar', 'Tenkou', 'Teresa', 'Tessai', 'Tetsu', 'Tomo', 'Tony', 'Tsai', 'Tuta',
  'Valeria', 'Viki', 'Viktor', 'Vincent',
  'Wakaba',
  'Yam Koo', 'Yoshino', 'Yuzu',
  'Zamza'
];
Object.freeze(SuikodenNames);

// exports for nodejs
module.exports = {
  state: STATE,
  names: SuikodenNames,
};
