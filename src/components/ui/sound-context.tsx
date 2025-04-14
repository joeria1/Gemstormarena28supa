
import React, { createContext, useState, useContext, useEffect } from 'react';
import { playSound as playSoundUtil } from '../../utils/sounds';
import gameSounds from '../../utils/gameSounds';

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
  
  const [audioElements] = useState<Map<string, HTMLAudioElement>>(new Map());
  
  useEffect(() => {
    localStorage.setItem('isMuted', JSON.stringify(isMuted));
    
    // Update all game sounds mute state
    Object.values(gameSounds).forEach(audio => {
      audio.muted = isMuted;
    });
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem('soundVolume', JSON.stringify(volume));
    
    // Update all game sounds volume
    Object.values(gameSounds).forEach(audio => {
      audio.volume = volume;
    });
  }, [volume]);

  // Initialize all sound files when component mounts
  useEffect(() => {
    // Preload and set initial volume for all game sounds
    Object.values(gameSounds).forEach(audio => {
      audio.load();
      audio.volume = volume;
      audio.muted = isMuted;
    });
    
    // Create a dummy user interaction to enable audio
    const enableAudio = () => {
      // Create a silent audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      // Try to play a silent sound
      const silentSound = new Audio();
      silentSound.play().catch(() => {
        // Ignore errors - this is just to enable audio
      });
      
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
    
    // Check if audio for this URL already exists
    let audio = audioElements.get(url);
    
    if (!audio) {
      // Create and store a new audio element if one doesn't exist
      audio = new Audio(url);
      audioElements.set(url, audio);
    }
    
    // Reset audio and play
    audio.currentTime = 0;
    audio.volume = effectiveVolume;
    audio.muted = isMuted;
    
    // Play the sound
    audio.play().catch(error => {
      console.error("Error playing sound:", error);
    });
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
