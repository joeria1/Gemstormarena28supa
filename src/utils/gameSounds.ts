
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
  plinkoWin: new Audio('/sounds/plinko-win.mp3'),
  
  // Generic sounds
  buttonClick: new Audio('/sounds/button-click.mp3'),
  win: new Audio('/sounds/win.mp3'),
  lose: new Audio('/sounds/lose.mp3')
};

// Configure audio settings for better browser compatibility
const configureAudio = () => {
  Object.values(gameSounds).forEach(audio => {
    // Preload audio
    audio.load();
    
    // Set default volume
    audio.volume = 0.5;
    
    // Enable looping for some sounds
    if (audio === gameSounds.rocketFly) {
      audio.loop = true;
    }
    
    // Add error handler
    audio.onerror = (e) => {
      console.error("Error loading sound:", e);
    };
  });
};

// Initialize audio
configureAudio();

// Helper function to play a sound by name
export const playGameSound = (soundName: keyof typeof gameSounds) => {
  const sound = gameSounds[soundName];
  if (sound) {
    // Reset the audio to the beginning if it's already playing
    sound.currentTime = 0;
    
    sound.play().catch(error => {
      console.error(`Error playing ${soundName} sound:`, error);
    });
  }
};

export default gameSounds;
