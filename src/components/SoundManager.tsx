
import React, { useState } from 'react';
import { useSound } from './ui/sound-context';
import { Volume2, VolumeX, Volume1, Volume } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Card } from './ui/card';

export const SoundManager: React.FC = () => {
  const { isMuted, toggleMute, setVolume, volume } = useSound();
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };
  
  const VolumeIcon = () => {
    if (isMuted) return <VolumeX className="h-4 w-4 text-muted-foreground" />;
    if (volume < 0.1) return <Volume className="h-4 w-4 text-primary" />;
    if (volume < 0.5) return <Volume1 className="h-4 w-4 text-primary" />;
    return <Volume2 className="h-4 w-4 text-primary" />;
  };
  
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="flex flex-col items-start space-y-2">
        {showVolumeControl && (
          <Card className="bg-background/95 backdrop-blur-sm border-primary/20 p-4 mb-2 w-48">
            <p className="text-xs text-muted-foreground mb-2">Volume</p>
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-full"
            />
          </Card>
        )}
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon"
            className="bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-background/90"
            onClick={toggleMute}
            title={isMuted ? "Unmute sounds" : "Mute sounds"}
          >
            <VolumeIcon />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-background/90 text-xs"
            onClick={() => setShowVolumeControl(!showVolumeControl)}
          >
            {volume * 100}%
          </Button>
        </div>
      </div>
    </div>
  );
};

// Re-export useSound hook from sound-context
export { useSound } from './ui/sound-context';

export default SoundManager;
