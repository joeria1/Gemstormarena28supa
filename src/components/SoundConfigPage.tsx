import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useSound } from './ui/sound-context';
import { getAllSoundConfigs, saveSoundConfig } from '../utils/soundConfig';

interface SoundConfig {
  name: string;
  path: string;
  description: string;
}

export const SoundConfigPage = () => {
  const [soundConfigs, setSoundConfigs] = useState<SoundConfig[]>([]);
  const { playSound } = useSound();

  // Load saved sound configurations
  useEffect(() => {
    setSoundConfigs(getAllSoundConfigs());
  }, []);

  // Save sound configurations
  const saveSoundConfigs = () => {
    soundConfigs.forEach(config => {
      saveSoundConfig(config.name, config.path);
    });
    alert('Sound configurations saved successfully!');
  };

  // Handle sound path changes
  const handleSoundPathChange = (index: number, newPath: string) => {
    const updatedConfigs = [...soundConfigs];
    updatedConfigs[index].path = newPath;
    setSoundConfigs(updatedConfigs);
  };

  // Test playing a sound
  const testSound = (path: string) => {
    playSound(path);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Sound Configuration</h1>
      <p className="text-gray-400 mb-6">
        Customize the sound effects used throughout the application. Upload MP3 files or provide URLs to replace the default sounds.
      </p>

      {soundConfigs.map((config, index) => (
        <Card key={config.name} className="mb-6">
          <CardHeader>
            <CardTitle>{config.name}</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor={`sound-path-${index}`}>Sound File Path</Label>
                  <Input
                    id={`sound-path-${index}`}
                    value={config.path}
                    onChange={(e) => handleSoundPathChange(index, e.target.value)}
                    placeholder="Enter path to sound file"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => testSound(config.path)}
                    variant="outline"
                    className="w-full"
                  >
                    Test Sound
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end mt-6">
        <Button onClick={saveSoundConfigs} className="bg-primary">
          Save Sound Configurations
        </Button>
      </div>
    </div>
  );
};

export default SoundConfigPage; 