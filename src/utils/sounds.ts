
// Sound effects for the case slider
export const playTickSound = () => {
  const audio = new Audio('/sounds/tick.mp3');
  audio.volume = 0.1;
  audio.play().catch(error => {
    console.error("Error playing tick sound:", error);
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

// Mines game sounds
export const playTileClickSound = () => {
  const audio = new Audio('/sounds/tile-click.mp3');
  audio.volume = 0.15;
  audio.play().catch(error => {
    console.error("Error playing tile click sound:", error);
  });
};

export const playMineExplosionSound = () => {
  const audio = new Audio('/sounds/explosion.mp3');
  audio.volume = 0.25;
  audio.play().catch(error => {
    console.error("Error playing explosion sound:", error);
  });
};

export const playCashoutSound = () => {
  const audio = new Audio('/sounds/cashout.mp3');
  audio.volume = 0.2;
  audio.play().catch(error => {
    console.error("Error playing cashout sound:", error);
  });
};

// Reroll sound effect
export const playRerollSound = () => {
  const audio = new Audio('/sounds/reroll.mp3');
  audio.volume = 0.3;
  audio.play().catch(error => {
    console.error("Error playing reroll sound:", error);
  });
};
