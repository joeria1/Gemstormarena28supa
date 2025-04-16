
import React, { useEffect } from 'react';
import PlinkoGame from '../components/Plinko/PlinkoGame';
import { preloadGameSounds } from '../utils/gameSounds';

const Plinko: React.FC = () => {
  // Preload Plinko sounds when page loads
  useEffect(() => {
    // Ensure sounds are preloaded
    preloadGameSounds();
  }, []);

  return (
    <div className="container max-w-full mx-auto py-6 px-3">
      <PlinkoGame />
    </div>
  );
};

export default Plinko;
