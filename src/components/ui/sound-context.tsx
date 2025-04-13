
import React, { createContext, useState, useContext, useEffect } from 'react';
import { playSound as playSoundUtil } from '../../utils/sounds';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (url: string, volume?: number) => void;
  setVolume: (volume: number) => void;
}

const SoundContext = createContext<SoundContextType>({
  isMuted: false,
  toggleMute: () => {},
  playSound: () => {},
  setVolume: () => {}
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
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem('soundVolume', JSON.stringify(volume));
  }, [volume]);

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
      setVolume: updateVolume
    }}>
      {children}
    </SoundContext.Provider>
  );
};

// Explicitly export useSound hook
export const useSound = () => useContext(SoundContext);
