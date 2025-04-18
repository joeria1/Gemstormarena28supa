// Direct sound testing for horse racing sounds

// Function to create and play a sound
function playSound(soundPath, volume = 1.0) {
  const audio = new Audio(soundPath);
  audio.volume = volume;
  
  // Play and handle errors
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        console.log(`Playing ${soundPath} successfully`);
      })
      .catch(error => {
        console.error(`Error playing ${soundPath}:`, error);
      });
  }
  
  return audio;
}

// Wait for user interaction
document.addEventListener('click', function initializeAudio() {
  // Remove this listener after first click
  document.removeEventListener('click', initializeAudio);
  
  // Play test sound after click
  console.log("Audio initialized - playing test sounds");
  
  // Play race start sound
  const startSound = playSound('/sounds/race-start.mp3', 0.7);
  
  // Play galloping sound after 2 seconds
  setTimeout(() => {
    const gallopingSound = playSound('/sounds/race-galloping.mp3', 0.5);
  }, 2000);
  
  // Create a visual indicator that sounds are playing
  const indicator = document.createElement('div');
  indicator.style.position = 'fixed';
  indicator.style.bottom = '20px';
  indicator.style.right = '20px';
  indicator.style.padding = '10px 20px';
  indicator.style.backgroundColor = 'green';
  indicator.style.color = 'white';
  indicator.style.borderRadius = '5px';
  indicator.style.zIndex = '9999';
  indicator.textContent = 'Playing race sounds...';
  document.body.appendChild(indicator);
  
  // Remove indicator after 5 seconds
  setTimeout(() => {
    indicator.remove();
  }, 5000);
}); 