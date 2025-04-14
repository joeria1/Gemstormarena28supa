
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { useToast } from '../ui/use-toast';
import { useUser } from '../../context/UserContext';
import { useSounds } from '../ui/sound-context';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

// Mine grid configurations
const GRID_SIZES = {
  "5x1": { rows: 5, cols: 1 },
  "3x3": { rows: 3, cols: 3 },
  "5x5": { rows: 5, cols: 5 },
};

type GridSize = keyof typeof GRID_SIZES;

const ImprovedMinesGame: React.FC = () => {
  const { user, updateBalance } = useUser();
  const { playSound } = useSounds();
  const { toast } = useToast();

  // Game settings
  const [gridSize, setGridSize] = useState<GridSize>("5x5");
  const [minesCount, setMinesCount] = useState<number>(5);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [safetyEnabled, setSafetyEnabled] = useState<boolean>(false);
  const [nextTileIsSafe, setNextTileIsSafe] = useState<boolean>(false);
  const [usedSafety, setUsedSafety] = useState<boolean>(false);

  // Game state
  const [grid, setGrid] = useState<Array<{ isMine: boolean; revealed: boolean; multiplier: number }>>([]);
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [minePositions, setMinePositions] = useState<number[]>([]);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1);
  const [potentialWinnings, setPotentialWinnings] = useState<number>(0);

  // Custom bet presets
  const betPresets = [5, 10, 25, 50, 100];

  // Initialize or reset the game
  const initializeGame = () => {
    const { rows, cols } = GRID_SIZES[gridSize];
    const totalTiles = rows * cols;
    
    // Create empty grid
    const newGrid = Array(totalTiles).fill(null).map(() => ({
      isMine: false,
      revealed: false,
      multiplier: 0
    }));
    
    setGrid(newGrid);
    setRevealedCount(0);
    setMinePositions([]);
    setCurrentMultiplier(1);
    setPotentialWinnings(betAmount);
    setGameCompleted(false);
    setNextTileIsSafe(false);
    setUsedSafety(false);
  };

  // Reset everything when changing grid size
  useEffect(() => {
    initializeGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize]);

  // Calculate max possible mines based on grid size
  const calculateMaxMines = (): number => {
    const { rows, cols } = GRID_SIZES[gridSize];
    return Math.floor((rows * cols) * 0.8); // Max 80% of tiles can be mines
  };

  // Start the game
  const startGame = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to be logged in to play.",
        variant: "destructive",
      });
      return;
    }

    if (user.balance < betAmount) {
      toast({
        title: "Insufficient Balance",
        description: `You need $${betAmount.toFixed(2)} to play.`,
        variant: "destructive",
      });
      return;
    }

    // Deduct bet amount
    updateBalance(-betAmount);
    
    // Initialize grid
    const { rows, cols } = GRID_SIZES[gridSize];
    const totalTiles = rows * cols;
    
    // Generate random mine positions
    const minePos: number[] = [];
    while (minePos.length < minesCount) {
      const pos = Math.floor(Math.random() * totalTiles);
      if (!minePos.includes(pos)) {
        minePos.push(pos);
      }
    }
    
    // Set up multipliers for each non-mine tile
    const newGrid = [...grid];
    minePos.forEach(pos => {
      newGrid[pos].isMine = true;
    });
    
    // Calculate multipliers for non-mine tiles
    calculateMultipliers(newGrid, minePos);
    
    setGrid(newGrid);
    setMinePositions(minePos);
    setIsPlaying(true);
    setPotentialWinnings(betAmount);

    playSound('gameStart');
  };

  // Calculate multipliers for each possible next tile
  const calculateMultipliers = (currentGrid: typeof grid, mines: number[]) => {
    const { rows, cols } = GRID_SIZES[gridSize];
    const totalTiles = rows * cols;
    const safeTiles = totalTiles - mines.length;
    
    // Base multiplier calculation
    // Using a simplified model: each safe tile increases win by factor based on remaining tiles
    const baseMultiplier = 0.95 / (1 - (mines.length / totalTiles));
    
    // Initialize all multipliers
    for (let i = 0; i < totalTiles; i++) {
      if (!currentGrid[i].isMine) {
        // Calculate how this specific tile affects odds
        const tileMultiplier = baseMultiplier * (totalTiles / (totalTiles - 1 - revealedCount));
        currentGrid[i].multiplier = parseFloat((currentMultiplier * tileMultiplier).toFixed(2));
      }
    }
  };

  // Handle revealing a tile
  const revealTile = (index: number) => {
    if (!isPlaying || grid[index].revealed) return;
    
    // Check if safety was used for this tile
    if (nextTileIsSafe && !usedSafety) {
      // If this is a mine, find a safe tile instead
      if (grid[index].isMine) {
        // Find a safe tile to reveal instead
        const safeTileIndex = grid.findIndex(tile => !tile.isMine && !tile.revealed);
        if (safeTileIndex !== -1) {
          handleTileClick(safeTileIndex);
        }
        setUsedSafety(true);
        setNextTileIsSafe(false);
        return;
      }
    }
    
    handleTileClick(index);
    setNextTileIsSafe(false);
  };

  // Handle the actual tile click logic
  const handleTileClick = (index: number) => {
    const newGrid = [...grid];
    newGrid[index].revealed = true;
    
    if (newGrid[index].isMine) {
      // Game over - hit a mine
      playSound('gameLose');
      
      // Reveal all mines
      minePositions.forEach(pos => {
        newGrid[pos].revealed = true;
      });
      
      setGrid(newGrid);
      setIsPlaying(false);
      setGameCompleted(true);
      
      toast({
        title: "Game Over!",
        description: "You hit a mine!",
        variant: "destructive",
      });
    } else {
      // Safe tile - continue game
      playSound('tileClick');
      
      const newRevealedCount = revealedCount + 1;
      const newMultiplier = newGrid[index].multiplier;
      const newWinnings = betAmount * newMultiplier;
      
      setGrid(newGrid);
      setRevealedCount(newRevealedCount);
      setCurrentMultiplier(newMultiplier);
      setPotentialWinnings(newWinnings);
      
      // Recalculate multipliers for remaining tiles
      calculateMultipliers(newGrid, minePositions);
      
      // Check if all safe tiles are revealed
      const { rows, cols } = GRID_SIZES[gridSize];
      const totalTiles = rows * cols;
      const safeTiles = totalTiles - minesCount;
      
      if (newRevealedCount === safeTiles) {
        // Player won by revealing all safe tiles
        playSound('gameWin');
        
        setIsPlaying(false);
        setGameCompleted(true);
        updateBalance(newWinnings);
        
        toast({
          title: "You Won!",
          description: `You found all safe tiles and won $${newWinnings.toFixed(2)}!`,
        });
      }
    }
  };

  // Cash out current winnings
  const cashOut = () => {
    if (!isPlaying) return;
    
    // Award current winnings
    const winnings = potentialWinnings;
    updateBalance(winnings);
    
    // Reveal all mines and end game
    const newGrid = [...grid];
    minePositions.forEach(pos => {
      newGrid[pos].revealed = true;
    });
    
    setGrid(newGrid);
    setIsPlaying(false);
    setGameCompleted(true);
    
    playSound('cashOut');
    
    toast({
      title: "Cashed Out!",
      description: `You cashed out $${winnings.toFixed(2)}!`,
    });
  };

  // Handle the safety feature for next tile
  const toggleSafetyForNextTile = () => {
    if (usedSafety) {
      toast({
        title: "Safety Already Used",
        description: "You can only use the safety feature once per game.",
        variant: "destructive",
      });
      return;
    }
    
    if (!isPlaying) {
      toast({
        title: "Game Not Active",
        description: "Start a game first to use the safety feature.",
        variant: "destructive",
      });
      return;
    }
    
    setNextTileIsSafe(!nextTileIsSafe);
  };

  // Render mine field
  const renderMineField = () => {
    const { rows, cols } = GRID_SIZES[gridSize];
    
    return (
      <div className="grid gap-2" style={{ 
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
      }}>
        {grid.map((tile, index) => (
          <button
            key={index}
            onClick={() => revealTile(index)}
            disabled={!isPlaying || tile.revealed}
            className={`
              aspect-square rounded-md flex items-center justify-center text-lg font-bold transition-all
              ${!tile.revealed 
                ? 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500' 
                : tile.isMine
                  ? 'bg-red-600'
                  : 'bg-green-600'
              }
              ${nextTileIsSafe && !usedSafety && !tile.revealed ? 'ring-2 ring-yellow-400' : ''}
            `}
          >
            {tile.revealed && (
              tile.isMine 
                ? '💥' 
                : `${tile.multiplier.toFixed(2)}x`
            )}
          </button>
        ))}
      </div>
    );
  };

  // Render game controls
  const renderControls = () => {
    return (
      <Card className="p-4 space-y-4 bg-gray-800 text-white">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Game Settings</h2>
          
          <div className="space-y-1">
            <Label htmlFor="gridSize">Grid Size</Label>
            <div className="flex space-x-2">
              {Object.keys(GRID_SIZES).map((size) => (
                <Button
                  key={size}
                  variant={gridSize === size ? "default" : "outline"}
                  onClick={() => setGridSize(size as GridSize)}
                  className={`flex-1 ${gridSize === size ? 'bg-blue-600' : ''}`}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <Label htmlFor="minesCount">Number of Mines</Label>
              <span>{minesCount}</span>
            </div>
            <Slider
              id="minesCount"
              min={1}
              max={calculateMaxMines()}
              step={1}
              value={[minesCount]}
              onValueChange={(value) => setMinesCount(value[0])}
              disabled={isPlaying}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="betAmount">Bet Amount</Label>
            <div className="flex space-x-2 mb-2">
              {betPresets.map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  onClick={() => setBetAmount(preset)}
                  disabled={isPlaying}
                  className="flex-1"
                >
                  ${preset}
                </Button>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                id="betAmount"
                type="number"
                min={1}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                disabled={isPlaying}
                className="bg-gray-700"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="safetySwitch">Safety Feature</Label>
              <Switch
                id="safetySwitch"
                checked={safetyEnabled}
                onCheckedChange={setSafetyEnabled}
                disabled={isPlaying}
              />
            </div>
            <p className="text-xs text-gray-400">
              When enabled, you can activate safety once per game to guarantee your next click is not a mine.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-4">
          <h2 className="text-xl font-bold mb-2">Game Status</h2>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-sm text-gray-400">Current Multiplier</div>
              <div className="text-lg font-bold">{currentMultiplier.toFixed(2)}x</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-sm text-gray-400">Potential Win</div>
              <div className="text-lg font-bold">${potentialWinnings.toFixed(2)}</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-sm text-gray-400">Tiles Revealed</div>
              <div className="text-lg font-bold">{revealedCount} / {grid.length - minesCount}</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-sm text-gray-400">Mines</div>
              <div className="text-lg font-bold">{minesCount}</div>
            </div>
          </div>
          
          {!isPlaying ? (
            <Button
              onClick={startGame}
              disabled={!user || user.balance < betAmount}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Start Game
            </Button>
          ) : (
            <div className="flex flex-col space-y-2">
              {safetyEnabled && (
                <Button
                  onClick={toggleSafetyForNextTile}
                  disabled={usedSafety}
                  className={`w-full ${nextTileIsSafe ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {nextTileIsSafe ? "Safety Active" : "Activate Safety"}
                </Button>
              )}
              
              <Button
                onClick={cashOut}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Cash Out ${potentialWinnings.toFixed(2)}
              </Button>
            </div>
          )}
          
          {gameCompleted && (
            <Button
              onClick={initializeGame}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
            >
              Play Again
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        {renderControls()}
      </div>
      <div className="lg:col-span-2">
        <Card className="p-4 bg-gray-800">
          {renderMineField()}
        </Card>
      </div>
    </div>
  );
};

export default ImprovedMinesGame;
