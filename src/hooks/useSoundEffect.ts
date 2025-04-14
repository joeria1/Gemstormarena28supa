
import { useCallback } from 'react';
import { useSound } from '../components/ui/sound-context';
import { playGameSound, forcePlaySound } from '../utils/gameSounds';

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
  
  const playCashoutSound = useCallback(() => {
    if (!isMuted) {
      playGameSound('cashout', volume);
    }
  }, [isMuted, volume]);
  
  const playSound = useCallback((soundName: string) => {
    if (!isMuted) {
      playGameSound(soundName as any, volume);
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
    playCashoutSound,
    playSound,
    forceSound
  };
};

export default useSoundEffect;
