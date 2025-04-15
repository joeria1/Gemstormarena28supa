
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

// Preload sound files with enhanced error handling
let audioContext: AudioContext | null = null;
const audioBuffers: Map<string, AudioBuffer> = new Map();
const audioElements: Map<string, HTMLAudioElement> = new Map();
const failedSounds: Set<string> = new Set(); // Track sounds that failed to load

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

// Helper function to play a sound by name with improved error handling
export const playGameSound = (soundName: keyof typeof gameSoundPaths, volume = 0.5) => {
  const soundPath = gameSoundPaths[soundName];
  if (!soundPath) {
    console.error(`Sound "${soundName}" not found`);
    return;
  }
  
  // Skip sounds that have previously failed to avoid repeated errors
  if (failedSounds.has(soundPath)) {
    return;
  }
  
  try {
    // Get or create audio element
    let audio = audioElements.get(soundPath);
    
    if (!audio) {
      audio = createAudioElement(soundPath);
      audioElements.set(soundPath, audio);
      
      // Add error handler for loading issues
      audio.addEventListener('error', (e) => {
        console.error(`Failed to load sound ${soundName}:`, e);
        failedSounds.add(soundPath);
      });
    }
    
    // Reset the audio to the beginning if it's already playing
    audio.pause();
    audio.currentTime = 0;
    audio.volume = volume;
    
    // Forcefully unlock audio on Safari/iOS with enhanced error handling
    const playAttempt = () => {
      const playPromise = audio!.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Playback started successfully
            // console.log(`Playing ${soundName} sound at volume ${volume}`);
          })
          .catch(error => {
            console.warn('Audio play error, trying again:', error);
            
            // Try again with a different approach
            setTimeout(() => {
              audio!.play().catch(e => {
                console.error('Still cannot play audio:', e);
                // If we've failed twice, mark this sound as problematic
                if (e.name === "NotSupportedError" || e.name === "NotAllowedError") {
                  failedSounds.add(soundPath);
                }
              });
            }, 100);
            
            // Also try on next user interaction (for browsers that require it)
            document.addEventListener('click', function playOnce() {
              audio!.play().catch(() => {}); // Silence errors here
              document.removeEventListener('click', playOnce);
            }, { once: true });
          });
      }
    };
    
    playAttempt();
  } catch (error) {
    console.error(`Error with sound ${soundName}:`, error);
    failedSounds.add(soundPath);
  }
};

// Function to preload all sounds with enhanced error handling
export const preloadGameSounds = () => {
  Object.entries(gameSoundPaths).forEach(([name, path]) => {
    try {
      if (!audioElements.has(path) && !failedSounds.has(path)) {
        const audio = createAudioElement(path);
        
        // Add event listeners to monitor loading progress
        audio.addEventListener('canplaythrough', () => {
          // console.log(`Sound ${name} loaded successfully`);
        });
        
        audio.addEventListener('error', (e) => {
          console.error(`Failed to load sound ${name}:`, e);
          failedSounds.add(path);
        });
        
        // Start loading the audio file
        audio.load();
        audioElements.set(path, audio);
        
        // For better Safari/iOS compatibility, try loading with a short play attempt
        setTimeout(() => {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                // Successfully started playing, immediately pause
                audio.pause();
                audio.currentTime = 0;
              })
              .catch(() => {
                // Expected - this just primes the audio for later
              });
          }
        }, 100);
      }
    } catch (error) {
      console.error(`Error preloading sound ${name}:`, error);
      failedSounds.add(path);
    }
  });
  
  // Log results of preloading
  setTimeout(() => {
    if (failedSounds.size > 0) {
      console.warn(`Failed to preload ${failedSounds.size} sounds.`);
    } else {
      // console.log('All sounds preloaded successfully');
    }
  }, 3000);
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
