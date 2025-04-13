
import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { SOUNDS, playSound } from '../../utils/soundEffects';

interface MinesSettingsProps {
  bet?: number;
  setBet?: (bet: number) => void;
  mines?: number;
  setMines?: (mines: number) => void;
  maxMines?: number;
  isGameActive: boolean;
  handleStart?: () => void;
  handleCashout?: () => void;
  currentMultiplier?: number;
  // Add these new props to match usage in Mines.tsx
  onBetChange?: (amount: number) => void;
  onMineCountChange?: (count: number) => void; 
  currentBet?: number;
  currentMineCount?: number;
  hideMineButtons?: boolean;
}

const MinesSettings: React.FC<MinesSettingsProps> = ({
  bet = 10,
  setBet = () => {},
  mines = 5,
  setMines = () => {},
  maxMines = 24,
  isGameActive,
  handleStart = () => {},
  handleCashout = () => {},
  currentMultiplier = 1.0,
  onBetChange,
  onMineCountChange,
  currentBet,
  currentMineCount,
  hideMineButtons
}) => {
  const handleBetChange = (value: number) => {
    playSound(SOUNDS.BUTTON_CLICK);
    if (value > 0) {
      setBet(value);
      if (onBetChange) onBetChange(value);
    }
  };
  
  const handleMinesChange = (value: number) => {
    if (value >= 1 && value <= maxMines) {
      setMines(value);
      if (onMineCountChange) onMineCountChange(value);
      playSound(SOUNDS.BUTTON_CLICK);
    }
  };
  
  // Use the passed value or fallback to the component's props
  const displayBet = currentBet !== undefined ? currentBet : bet;
  const displayMines = currentMineCount !== undefined ? currentMineCount : mines;
  
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="bet" className="text-sm font-medium mb-1 block">
          Bet Amount
        </label>
        <div className="flex space-x-2">
          <Input
            id="bet"
            type="number"
            value={displayBet}
            onChange={(e) => setBet(Number(e.target.value))}
            min={1}
            disabled={isGameActive}
          />
          <div className="flex space-x-1">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBetChange(displayBet / 2)}
              disabled={isGameActive || displayBet <= 1}
            >
              ½
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBetChange(displayBet * 2)}
              disabled={isGameActive}
            >
              2×
            </Button>
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="mines" className="text-sm font-medium mb-1 block">
          Mines: {displayMines}
        </label>
        <div className="flex space-x-2 items-center">
          <Slider
            id="mines"
            value={[displayMines]}
            onValueChange={(value) => handleMinesChange(value[0])}
            min={1}
            max={maxMines}
            step={1}
            disabled={isGameActive}
          />
          <Input
            type="number"
            className="w-16"
            value={displayMines}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              handleMinesChange(value);
            }}
            min={1}
            max={maxMines}
            disabled={isGameActive}
          />
        </div>
      </div>

      {!hideMineButtons && (
        <div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[1, 3, 5, 10, 15, 20].map((num) => (
              <Button
                key={num}
                variant="outline"
                size="sm"
                disabled={isGameActive || num > maxMines}
                onClick={() => handleMinesChange(num)}
                className={displayMines === num ? "border-primary" : ""}
              >
                {num}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        {!isGameActive ? (
          <Button className="w-full" onClick={handleStart}>
            Start Game
          </Button>
        ) : (
          <Button 
            className="w-full bg-green-500 hover:bg-green-600"
            onClick={handleCashout}
          >
            Cashout ({currentMultiplier?.toFixed(2)}x)
          </Button>
        )}
      </div>
    </div>
  );
};

export default MinesSettings;
