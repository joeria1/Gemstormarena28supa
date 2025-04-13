
import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';

interface MinesSettingsProps {
  bet: number;
  setBet: (bet: number) => void;
  mines: number;
  setMines: (mines: number) => void;
  maxMines: number;
  isGameActive: boolean;
  handleStart: () => void;
  handleCashout: () => void;
  currentMultiplier: number;
}

const MinesSettings: React.FC<MinesSettingsProps> = ({
  bet,
  setBet,
  mines,
  setMines,
  maxMines,
  isGameActive,
  handleStart,
  handleCashout,
  currentMultiplier
}) => {
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
            value={bet}
            onChange={(e) => setBet(Number(e.target.value))}
            min={1}
            disabled={isGameActive}
          />
          <div className="flex space-x-1">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setBet(bet / 2)}
              disabled={isGameActive || bet <= 1}
            >
              ½
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setBet(bet * 2)}
              disabled={isGameActive}
            >
              2×
            </Button>
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="mines" className="text-sm font-medium mb-1 block">
          Mines: {mines}
        </label>
        <div className="flex space-x-2 items-center">
          <Slider
            id="mines"
            value={[mines]}
            onValueChange={(value) => setMines(value[0])}
            min={1}
            max={maxMines}
            step={1}
            disabled={isGameActive}
          />
          <Input
            type="number"
            className="w-16"
            value={mines}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value) && value >= 1 && value <= maxMines) {
                setMines(value);
              }
            }}
            min={1}
            max={maxMines}
            disabled={isGameActive}
          />
        </div>
      </div>

      <div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[1, 3, 5, 10, 15, 20].map((num) => (
            <Button
              key={num}
              variant="outline"
              size="sm"
              disabled={isGameActive || num > maxMines}
              onClick={() => setMines(num)}
              className={mines === num ? "border-primary" : ""}
            >
              {num}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {!isGameActive ? (
          <Button className="w-full" onClick={handleStart}>
            Start Game
          </Button>
        ) : (
          <Button 
            className="w-full"
            variant="success"
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
