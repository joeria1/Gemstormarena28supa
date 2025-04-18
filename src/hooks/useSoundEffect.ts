import { useCallback } from 'react';
import { useSound } from '../components/ui/sound-context';
import { playGameSound, forcePlaySound } from '../utils/gameSounds';
import { playCashoutSound } from '../utils/sounds';

export const useSoundEffect = () => {
  const { isMuted, volume } = useSound();
  
  const playButtonSound = useCallback(() => {
    if (!isMuted) {
      playGameSound('buttonClick', volume);
    }
  }, [isMuted, volume]);
  
  const playWinSound = useCallback(() => {
    if (!isMuted) {
      playGameSound('win', volume);
    }
  }, [isMuted, volume]);
  
  const playLoseSound = useCallback(() => {
    if (!isMuted) {
      playGameSound('lose', volume);
    }
  }, [isMuted, volume]);
  
  const playCashoutSoundEffect = useCallback(() => {
    if (!isMuted) {
      // Use our direct cashout function instead of the game sound system
      playCashoutSound();
    }
  }, [isMuted]);
  
  const playSound = useCallback((soundName: string) => {
    if (!isMuted) {
      // Special case for cashout sound
      if (soundName === 'cashout' || soundName === '/sounds/cashout.mp3') {
        playCashoutSound();
      } else {
        playGameSound(soundName as any, volume);
      }
    }
  }, [isMuted, volume]);
  
  // For debugging purposes
  const forceSound = useCallback((soundName: string) => {
    forcePlaySound(soundName as any);
  }, []);
  
  return {
    playButtonSound,
    playWinSound,
    playLoseSound,
    playCashoutSound: playCashoutSoundEffect,
    playSound,
    forceSound
  };
};

export default useSoundEffect;
