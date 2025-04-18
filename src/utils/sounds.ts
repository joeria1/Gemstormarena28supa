// Sound effects for the case slider
import { enhancedPlaySound } from './soundTestUtility';

export const playTickSound = () => {
  enhancedPlaySound('/sounds/tick.mp3', 0.1);
};

// General play function for soundEffects.ts
export const play = (sound: string) => {
  enhancedPlaySound(`/sounds/${sound}.mp3`, 0.2);
};

// Direct sound function for immediate use
export const playSound = (url: string, volume: number = 0.5) => {
  enhancedPlaySound(url, volume);
};

export const playStopSound = () => {
  enhancedPlaySound('/sounds/win.mp3', 0.2);
};

// Additional sound effects
export const playButtonSound = () => {
  enhancedPlaySound('/sounds/button-click.mp3', 0.1);
};

export const playWinSound = () => {
  enhancedPlaySound('/sounds/big-win.mp3', 0.3);
};

export const playLoseSound = () => {
  enhancedPlaySound('/sounds/lose.mp3', 0.2);
};

// Add explicit cashout sound with higher volume
export const playCashoutSound = () => {
  console.log("Attempting to play cashout sound...");
  enhancedPlaySound('/sounds/cashout.mp3', 0.6)
    .then(success => {
      if (success) {
        console.log("Cashout sound played successfully!");
      } else {
        console.error("Failed to play cashout sound");
      }
    });
};

// Play order filled sound for bet placements
export const playOrderFilledSound = () => {
  enhancedPlaySound('/sounds/order-filled.mp3', 0.4)
    .then(success => {
      if (!success) {
        console.error("Failed to play order-filled sound");
      }
    });
};
