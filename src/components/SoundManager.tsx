
import React from 'react';
import { useSound } from './ui/sound-context';

const SoundManager: React.FC = () => {
  const { isMuted } = useSound();
  
  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Sound indicator could be placed here if needed */}
    </div>
  );
};

// Re-export useSound
export { useSound };

export default SoundManager;
