
import React, { createContext, useState, useContext, useEffect } from 'react';
import { playGameSound, preloadGameSounds } from '../../utils/gameSounds';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (url: string, volume?: number) => void;
  setVolume: (volume: number) => void;
  volume: number;
}

const SoundContext = createContext<SoundContextType>({
  isMuted: false,
  toggleMute: () => {},
  playSound: () => {},
  setVolume: () => {},
  volume: 0.5
});

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(() => {
    const stored = localStorage.getItem('isMuted');
    return stored ? JSON.parse(stored) : false;
  });
  
  const [volume, setVolume] = useState(() => {
    const stored = localStorage.getItem('soundVolume');
    return stored ? JSON.parse(stored) : 0.5;
  });
  
  const [audioCache] = useState<Map<string, HTMLAudioElement>>(new Map());
  
  useEffect(() => {
    localStorage.setItem('isMuted', JSON.stringify(isMuted));
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem('soundVolume', JSON.stringify(volume));
  }, [volume]);

  // Initialize sound system
  useEffect(() => {
    // Preload game sounds
    preloadGameSounds();
    
    // Create a dummy user interaction to enable audio
    const enableAudio = () => {
      // Try to create and play a silent sound to enable audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      // Play a silent sound
      const silentSound = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAUAAAiSAAODg4ODhkZGRkZJCQkJCQvLy8vLzo6Ojo6RUVFRUVRUVFRUXZ2dnZ2goKCgoKNjY2NjZmZmZmZpKSkpKSwsLCwsLu7u7u7xsbGxsbS0tLS0t3d3d3d6Ojo6Oj09PT09P////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJARgAAAAAAAAIkh591hAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/84REAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV');
      silentSound.volume = 0.001;
      const playPromise = silentSound.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Ignore errors - this is just to enable audio
        });
      }
      
      // Remove the event listeners after first interaction
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };
    
    // Add event listeners to enable audio on user interaction
    document.addEventListener('click', enableAudio);
    document.addEventListener('touchstart', enableAudio);
    document.addEventListener('keydown', enableAudio);
    
    return () => {
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };
  }, []);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const playSound = (url: string, customVolume?: number) => {
    if (isMuted) return;
    
    // Use custom volume if provided, otherwise use global setting
    const effectiveVolume = customVolume !== undefined ? customVolume : volume;
    
    try {
      // Check if audio for this URL already exists
      let audio = audioCache.get(url);
      
      if (!audio) {
        // Create and store a new audio element if one doesn't exist
        audio = new Audio(url);
        audioCache.set(url, audio);
      }
      
      // Reset audio and play
      audio.currentTime = 0;
      audio.volume = effectiveVolume;
      
      // Play the sound with promise handling
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Error playing sound:", error);
        });
      }
    } catch (error) {
      console.error("Error with sound playback:", error);
    }
  };

  const updateVolume = (newVolume: number) => {
    setVolume(Math.max(0, Math.min(1, newVolume)));
  };

  return (
    <SoundContext.Provider value={{ 
      isMuted, 
      toggleMute, 
      playSound,
      setVolume: updateVolume,
      volume
    }}>
      {children}
    </SoundContext.Provider>
  );
};

// Explicitly export useSound hook
export const useSound = () => useContext(SoundContext);
