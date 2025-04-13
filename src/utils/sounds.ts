
// Sound effects for the case slider
export const playTickSound = () => {
  const audio = new Audio('/sounds/tick.mp3');
  audio.volume = 0.1;
  audio.play().catch(error => {
    console.error("Error playing tick sound:", error);
  });
};

// General play function for soundEffects.ts
export const play = (sound: string) => {
  const audio = new Audio(`/sounds/${sound}.mp3`);
  audio.volume = 0.2;
  audio.play().catch(error => {
    console.error(`Error playing ${sound} sound:`, error);
  });
};

// Direct sound function for immediate use
export const playSound = (url: string, volume: number = 0.5) => {
  const audio = new Audio(url);
  audio.volume = volume;
  audio.play().catch(error => {
    console.error("Error playing sound:", error);
  });
};

export const playStopSound = () => {
  const audio = new Audio('/sounds/win.mp3');
  audio.volume = 0.2;
  audio.play().catch(error => {
    console.error("Error playing stop sound:", error);
  });
};

// Additional sound effects
export const playButtonSound = () => {
  const audio = new Audio('/sounds/button-click.mp3');
  audio.volume = 0.1;
  audio.play().catch(error => {
    console.error("Error playing button sound:", error);
  });
};

export const playWinSound = () => {
  const audio = new Audio('/sounds/big-win.mp3');
  audio.volume = 0.3;
  audio.play().catch(error => {
    console.error("Error playing win sound:", error);
  });
};

export const playLoseSound = () => {
  const audio = new Audio('/sounds/lose.mp3');
  audio.volume = 0.2;
  audio.play().catch(error => {
    console.error("Error playing lose sound:", error);
  });
};
