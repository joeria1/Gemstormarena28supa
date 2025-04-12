
import React, { createContext, useState, useContext, useEffect } from 'react';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSound: (url: string, volume?: number) => void;
}

const SoundContext = createContext<SoundContextType>({
  isMuted: false,
  toggleMute: () => {},
  playSound: () => {}
});

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(() => {
    const stored = localStorage.getItem('isMuted');
    return stored ? JSON.parse(stored) : false;
  });
  
  const [audioElements] = useState<Map<string, HTMLAudioElement>>(new Map());
  
  useEffect(() => {
    localStorage.setItem('isMuted', JSON.stringify(isMuted));
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const playSound = (url: string, volume: number = 0.5) => {
    if (isMuted) return;
    
    // Check if audio for this URL already exists
    let audio = audioElements.get(url);
    
    if (!audio) {
      // Create and store a new audio element if one doesn't exist
      audio = new Audio(url);
      audioElements.set(url, audio);
    }
    
    // Reset audio and play
    audio.currentTime = 0;
    audio.volume = volume;
    
    // Play the sound
    audio.play().catch(error => {
      console.error("Error playing sound:", error);
    });
  };

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, playSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
