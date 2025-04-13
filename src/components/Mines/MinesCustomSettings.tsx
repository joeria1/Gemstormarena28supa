
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Bomb, Plus, Minus } from 'lucide-react';

interface MinesCustomSettingsProps {
  onMineCountChange: (count: number) => void;
  currentMineCount: number;
  maxMines: number;
  isGameActive: boolean;
}

const MinesCustomSettings: React.FC<MinesCustomSettingsProps> = ({
  onMineCountChange,
  currentMineCount,
  maxMines,
  isGameActive
}) => {
  const [inputValue, setInputValue] = useState<string>(currentMineCount.toString());
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleApply = () => {
    const newValue = parseInt(inputValue);
    if (isNaN(newValue) || newValue < 1) {
      toast.error('Please enter a valid number of mines (minimum 1)');
      setInputValue(currentMineCount.toString());
      return;
    }
    
    if (newValue > maxMines) {
      toast.error(`Maximum ${maxMines} mines allowed`);
      setInputValue(currentMineCount.toString());
      return;
    }
    
    onMineCountChange(newValue);
    toast.success(`Mine count set to ${newValue}`);
  };
  
  const incrementMines = () => {
    if (currentMineCount < maxMines) {
      const newValue = currentMineCount + 1;
      onMineCountChange(newValue);
      setInputValue(newValue.toString());
    }
  };
  
  const decrementMines = () => {
    if (currentMineCount > 1) {
      const newValue = currentMineCount - 1;
      onMineCountChange(newValue);
      setInputValue(newValue.toString());
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-black/40 rounded-lg p-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <Label className="font-medium flex items-center">
            <Bomb className="h-4 w-4 mr-1 text-red-400" />
            Mine Count
          </Label>
          <div className="text-sm text-muted-foreground">
            {currentMineCount} of {maxMines} max
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={decrementMines}
            disabled={currentMineCount <= 1 || isGameActive}
            className="bg-black/30"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleApply}
              min={1}
              max={maxMines}
              className="bg-black/30 text-center"
              disabled={isGameActive}
            />
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={incrementMines}
            disabled={currentMineCount >= maxMines || isGameActive}
            className="bg-black/30"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <Slider
          value={[currentMineCount]}
          min={1}
          max={maxMines}
          step={1}
          onValueChange={(values) => {
            const newValue = values[0];
            onMineCountChange(newValue);
            setInputValue(newValue.toString());
          }}
          disabled={isGameActive}
          className="mt-4"
        />
      </div>
    </div>
  );
};

export default MinesCustomSettings;
