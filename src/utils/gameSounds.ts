
// Game sounds for various interactions
const gameSounds = {
  // Mines game
  mineClick: new Audio('/sounds/mine-click.mp3'),
  mineExplosion: new Audio('/sounds/mine-explosion.mp3'),
  
  // Blackjack game
  cardShuffle: new Audio('/sounds/card-shuffle.mp3'),
  cardDeal: new Audio('/sounds/card-deal.mp3'),
  cardHit: new Audio('/sounds/card-hit.mp3'),
  
  // Cases
  caseHover: new Audio('/sounds/case-hover.mp3'),
  caseSelect: new Audio('/sounds/case-select.mp3'),
  
  // Horse Racing
  raceStart: new Audio('/sounds/race-start.mp3'),
  
  // Lightning Effect
  lightning: new Audio('/sounds/lightning.mp3'),
  
  // Crash Game
  rocketFly: new Audio('/sounds/rocket-fly.mp3'),
  rocketCrash: new Audio('/sounds/rocket-crash.mp3'),
  
  // Towers
  towerSuccess: new Audio('/sounds/tower-success.mp3'),
  towerFail: new Audio('/sounds/tower-fail.mp3'),
  
  // Plinko
  plinkoPeg: new Audio('/sounds/plinko-peg.mp3'),
  plinkoWin: new Audio('/sounds/plinko-win.mp3')
};

// Preload all audio files
Object.values(gameSounds).forEach(audio => {
  audio.load();
  audio.volume = 0.5; // Set default volume
});

export default gameSounds;
