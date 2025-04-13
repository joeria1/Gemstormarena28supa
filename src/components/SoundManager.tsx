
import React, { useState, useEffect } from 'react';
import { useSound } from './ui/sound-context';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';

const SoundManager: React.FC = () => {
  const { isMuted, toggleMute } = useSound();
  
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button 
        variant="outline" 
        size="icon"
        className="bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-background/90"
        onClick={toggleMute}
        title={isMuted ? "Unmute sounds" : "Mute sounds"}
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Volume2 className="h-4 w-4 text-primary" />
        )}
      </Button>
    </div>
  );
};

// Re-export useSound hook from sound-context
export { useSound } from './ui/sound-context';

export default SoundManager;
