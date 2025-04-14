
// Game sounds for various interactions
const gameSoundPaths = {
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
  lose: '/sounds/lose.mp3',
  cashout: '/sounds/win.mp3' // Adding cashout sound (using win sound)
};

// Preload sound files
let audioContext: AudioContext | null = null;
const audioBuffers: Map<string, AudioBuffer> = new Map();
const audioElements: Map<string, HTMLAudioElement> = new Map();

// Initialize audio context on user interaction
const initAudioContext = () => {
  if (audioContext) return;
  
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContext = new AudioContextClass();
    console.log('Audio context initialized:', audioContext.state);
    
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        console.log('Audio context resumed');
      });
    }
  } catch (error) {
    console.error('Failed to create audio context:', error);
  }
};

// Initialize audio context on first user interaction
if (typeof window !== 'undefined') {
  const enableAudio = () => {
    initAudioContext();
    // Force audio to play a silent sound to unlock audio on iOS/Safari
    const silentSound = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAUAAAiSAAODg4ODhkZGRkZJCQkJCQvLy8vLzo6Ojo6RUVFRUVRUVFRUXZ2dnZ2goKCgoKNjY2NjZmZmZmZpKSkpKSwsLCwsLu7u7u7xsbGxsbS0tLS0t3d3d3d6Ojo6Oj09PT09P////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJARgAAAAAAAAIkh591hAAAAA');
    silentSound.volume = 0.01;
    silentSound.play().then(() => {
      console.log('Silent sound played to unlock audio');
    }).catch(e => {
      console.warn('Could not play silent sound:', e);
    });
    
    document.removeEventListener('click', enableAudio);
    document.removeEventListener('touchstart', enableAudio);
    document.removeEventListener('keydown', enableAudio);
  };
  
  document.addEventListener('click', enableAudio, { once: true });
  document.addEventListener('touchstart', enableAudio, { once: true });
  document.addEventListener('keydown', enableAudio, { once: true });
}

// Helper function to create and configure Audio element
const createAudioElement = (soundPath: string): HTMLAudioElement => {
  const audio = new Audio();
  audio.src = soundPath;
  audio.preload = 'auto';
  return audio;
};

// Helper function to play a sound by name
export const playGameSound = (soundName: keyof typeof gameSoundPaths, volume = 0.5) => {
  const soundPath = gameSoundPaths[soundName];
  if (!soundPath) {
    console.error(`Sound "${soundName}" not found`);
    return;
  }
  
  try {
    // Get or create audio element
    let audio = audioElements.get(soundPath);
    
    if (!audio) {
      audio = createAudioElement(soundPath);
      audioElements.set(soundPath, audio);
    }
    
    // Reset the audio to the beginning if it's already playing
    audio.pause();
    audio.currentTime = 0;
    audio.volume = volume;
    
    // Forcefully unlock audio on Safari/iOS
    const playAttempt = () => {
      const playPromise = audio!.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Playback started successfully
            console.log(`Playing ${soundName} sound at volume ${volume}`);
          })
          .catch(error => {
            console.warn('Audio play error, trying again:', error);
            
            // Try one more time with user interaction
            document.addEventListener('click', function playOnce() {
              audio!.play().catch(e => console.error('Still cannot play audio:', e));
              document.removeEventListener('click', playOnce);
            }, { once: true });
          });
      }
    };
    
    playAttempt();
  } catch (error) {
    console.error(`Error with sound ${soundName}:`, error);
  }
};

// Function to preload all sounds
export const preloadGameSounds = () => {
  Object.entries(gameSoundPaths).forEach(([name, path]) => {
    try {
      if (!audioElements.has(path)) {
        const audio = createAudioElement(path);
        audio.load(); // Start loading the audio file
        audioElements.set(path, audio);
      }
    } catch (error) {
      console.error(`Error preloading sound ${name}:`, error);
    }
  });
};

// Pause a specific sound
export const pauseGameSound = (soundName: keyof typeof gameSoundPaths) => {
  const soundPath = gameSoundPaths[soundName];
  if (!soundPath) return;
  
  const audio = audioElements.get(soundPath);
  if (audio) {
    audio.pause();
  }
};

// Forcefully play a sound (useful for debugging)
export const forcePlaySound = (soundName: keyof typeof gameSoundPaths) => {
  const soundPath = gameSoundPaths[soundName];
  if (!soundPath) {
    console.error(`Sound "${soundName}" not found`);
    return;
  }
  
  const audio = new Audio(soundPath);
  audio.volume = 1.0; // Full volume for testing
  audio.play().then(() => {
    console.log(`Forced play of ${soundName}`);
  }).catch(e => {
    console.error(`Couldn't force play ${soundName}:`, e);
  });
};

// Initialize sounds on load
preloadGameSounds();

export default gameSoundPaths;
