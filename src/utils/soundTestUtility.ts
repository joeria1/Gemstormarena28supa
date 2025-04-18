import gameSoundPaths from './gameSounds';
import { playCashoutSound } from './sounds';

// List of all sound paths from the gameSoundPaths object
const getAllSoundPaths = (): string[] => {
  return Object.values(gameSoundPaths);
};

// Enhanced sound playing with detailed error reporting
export const testPlaySound = (soundPath: string): Promise<boolean> => {
  console.log(`Testing sound: ${soundPath}`);
  
  return new Promise((resolve) => {
    try {
      const audio = new Audio(soundPath);
      
      // Set up success handler
      audio.addEventListener('canplaythrough', () => {
        console.log(`✅ Sound loaded successfully: ${soundPath}`);
        
        // Try to play the sound
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`✅ Sound played successfully: ${soundPath}`);
              // Stop after a short time (don't play the whole sound)
              setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
                resolve(true);
              }, 500);
            })
            .catch(error => {
              console.error(`❌ Failed to play sound ${soundPath}:`, error);
              resolve(false);
            });
        } else {
          resolve(true); // Assume success if play() doesn't return a promise (older browsers)
        }
      });
      
      // Set up error handlers
      audio.addEventListener('error', (e) => {
        const error = e.target as HTMLAudioElement;
        let errorMessage = "Unknown error";
        
        switch (error.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = "Playback aborted";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = "Network error";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = "Decoding error";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "Format not supported or file not found";
            break;
        }
        
        console.error(`❌ Error loading sound ${soundPath}: ${errorMessage}`);
        resolve(false);
      });
      
      // Load the audio file
      audio.volume = 0.2; // Lower volume for testing
      audio.load();
      
    } catch (error) {
      console.error(`❌ Exception testing sound ${soundPath}:`, error);
      resolve(false);
    }
  });
};

// Test all sounds and report results
export const testAllSounds = async (): Promise<{success: string[], failed: string[]}> => {
  const soundPaths = getAllSoundPaths();
  const results: {success: string[], failed: string[]} = {
    success: [],
    failed: []
  };
  
  console.log(`Starting sound test for ${soundPaths.length} sounds...`);
  
  // Test each sound sequentially to not overwhelm the browser
  for (const soundPath of soundPaths) {
    const success = await testPlaySound(soundPath);
    if (success) {
      results.success.push(soundPath);
    } else {
      results.failed.push(soundPath);
    }
  }
  
  // Also test the direct cashout sound
  const cashoutSuccess = await testPlaySound('/sounds/cashout.mp3');
  if (cashoutSuccess) {
    results.success.push('/sounds/cashout.mp3');
  } else {
    results.failed.push('/sounds/cashout.mp3');
  }
  
  // Log summary
  console.log("\n===== SOUND TEST RESULTS =====");
  console.log(`✅ Working sounds: ${results.success.length}`);
  console.log(`❌ Failed sounds: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.error("Failed sounds:", results.failed);
  }
  
  return results;
};

// Create a placeholder sound file check
export const detectPlaceholders = async (): Promise<string[]> => {
  const soundPaths = getAllSoundPaths();
  const suspectedPlaceholders: string[] = [];
  
  for (const path of soundPaths) {
    try {
      const response = await fetch(path, { method: 'HEAD' });
      
      if (response.ok) {
        const contentLength = response.headers.get('content-length');
        // Placeholders are likely to be very small files
        if (contentLength && parseInt(contentLength) < 100) {
          suspectedPlaceholders.push(path);
        }
      }
    } catch (error) {
      console.error(`Error checking file size for ${path}:`, error);
    }
  }
  
  return suspectedPlaceholders;
};

// Enhanced play function to replace all the different sound methods
export const enhancedPlaySound = (soundPath: string, volume: number = 0.5): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const audio = new Audio(soundPath);
      audio.volume = volume;
      
      // Set up success handlers
      audio.oncanplaythrough = () => {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`Sound playing: ${soundPath}`);
              resolve(true);
            })
            .catch(error => {
              console.error(`Error playing sound ${soundPath}:`, error);
              
              // Try alternate sounds for specific cases
              if (soundPath === '/sounds/mine-explosion.mp3') {
                console.log('Trying alternate explosion sound...');
                // Try a generic explosion sound as fallback
                const fallbackAudio = new Audio('/sounds/explosion.mp3');
                fallbackAudio.volume = volume;
                fallbackAudio.play().catch(() => {});
              }
              
              // Try one more time on next user interaction
              document.addEventListener('click', function playOnce() {
                audio.play().catch(() => {});
                document.removeEventListener('click', playOnce);
              }, { once: true });
              
              resolve(false);
            });
        } else {
          resolve(true);
        }
      };
      
      // Error handling
      audio.onerror = (e) => {
        console.error(`Error loading sound ${soundPath}:`, e);
        
        // Try alternate sounds for specific cases
        if (soundPath === '/sounds/mine-explosion.mp3') {
          console.log('Error loading explosion sound, trying alternate...');
          // Try a generic explosion sound as fallback
          const fallbackAudio = new Audio('/sounds/explosion.mp3');
          fallbackAudio.volume = volume;
          fallbackAudio.play().catch(() => {});
        }
        
        resolve(false);
      };
      
      audio.load();
      
    } catch (error) {
      console.error(`Exception playing sound ${soundPath}:`, error);
      resolve(false);
    }
  });
};

// Sound manager for controllable sounds
const soundInstances: Record<string, HTMLAudioElement> = {};

// Play a sound that can be controlled (stopped later)
export const playControlledSound = (id: string, soundPath: string, volume: number = 0.5, loop: boolean = false): HTMLAudioElement | null => {
  try {
    // Stop previous instance if it exists
    stopControlledSound(id);
    
    const audio = new Audio(soundPath);
    audio.volume = volume;
    audio.loop = loop;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log(`Controlled sound playing: ${id} - ${soundPath}`);
        })
        .catch(error => {
          console.error(`Error playing controlled sound ${soundPath}:`, error);
          return null;
        });
    }
    
    // Store the audio element for later control
    soundInstances[id] = audio;
    return audio;
  } catch (error) {
    console.error(`Exception playing controlled sound ${soundPath}:`, error);
    return null;
  }
};

// Stop a controlled sound
export const stopControlledSound = (id: string): void => {
  const audio = soundInstances[id];
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    delete soundInstances[id];
    console.log(`Stopped controlled sound: ${id}`);
  }
};

export default {
  testPlaySound,
  testAllSounds,
  detectPlaceholders,
  enhancedPlaySound,
  playControlledSound,
  stopControlledSound
}; 