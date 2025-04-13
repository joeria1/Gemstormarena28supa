
// Sound effects for the case slider
export const playTickSound = () => {
  const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-video-game-retro-click-1114.mp3');
  audio.volume = 0.1;
  audio.play().catch(error => {
    console.error("Error playing tick sound:", error);
  });
};

export const playStopSound = () => {
  const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
  audio.volume = 0.2;
  audio.play().catch(error => {
    console.error("Error playing stop sound:", error);
  });
};
