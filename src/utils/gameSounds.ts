
// Game sounds for various interactions
const gameSounds = {
  // Mines game
  mineClick: '/sounds/mine-click.mp3',
  mineExplosion: '/sounds/mine-explosion.mp3',
  
  // Blackjack game
  cardShuffle: '/sounds/card-shuffle.mp3',
  cardDeal: '/sounds/card-deal.mp3',
  cardHit: '/sounds/card-hit.mp3',
  
  // Cases
  caseHover: '/sounds/case-hover.mp3',
  caseSelect: '/sounds/case-select.mp3',
  
  // Horse Racing
  raceStart: '/sounds/race-start.mp3',
  
  // Lightning Effect
  lightning: '/sounds/lightning.mp3',
  
  // Crash Game
  rocketFly: '/sounds/rocket-fly.mp3',
  rocketCrash: '/sounds/rocket-crash.mp3',
  
  // Towers
  towerSuccess: '/sounds/tower-success.mp3',
  towerFail: '/sounds/tower-fail.mp3',
  
  // Plinko
  plinkoPeg: '/sounds/plinko-peg.mp3',
  plinkoWin: '/sounds/plinko-win.mp3',
  
  // Generic sounds
  buttonClick: '/sounds/button-click.mp3',
  win: '/sounds/win.mp3',
  lose: '/sounds/lose.mp3'
};

// Use a map to cache Audio instances
const audioElements: Map<string, HTMLAudioElement> = new Map();

// Helper function to play a sound by name
export const playGameSound = (soundName: keyof typeof gameSounds, volume = 0.5) => {
  const soundPath = gameSounds[soundName];
  if (!soundPath) return;
  
  try {
    // Create or retrieve audio element
    let audio = audioElements.get(soundPath);
    
    if (!audio) {
      audio = new Audio(soundPath);
      audioElements.set(soundPath, audio);
    }
    
    // Reset the audio to the beginning if it's already playing
    audio.currentTime = 0;
    audio.volume = volume;
    
    // Use a promise to handle playback
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error(`Error playing ${soundName} sound:`, error);
      });
    }
  } catch (error) {
    console.error(`Error with sound ${soundName}:`, error);
  }
};

// Function to preload all sounds
export const preloadGameSounds = () => {
  Object.entries(gameSounds).forEach(([name, path]) => {
    try {
      const audio = new Audio(path);
      audio.load(); // Start loading the audio file
      audioElements.set(path, audio);
    } catch (error) {
      console.error(`Error preloading sound ${name}:`, error);
    }
  });
};

// Initialize sounds on load
preloadGameSounds();

export default gameSounds;
