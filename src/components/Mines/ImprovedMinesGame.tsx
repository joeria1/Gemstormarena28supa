
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bomb, RefreshCw, DollarSign } from "lucide-react";
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';

interface Tile {
  id: number;
  revealed: boolean;
  isMine: boolean;
  value: number;
  multiplier: number;
  revealOrder: number | null;
}

const ImprovedMinesInterface = () => {
  const { user, updateBalance } = useUser();
  const [mines, setMines] = useState<number>(1);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [safeRevealedCount, setSafeRevealedCount] = useState<number>(0);
  const [remainingTiles, setRemainingTiles] = useState<number>(25);
  const [currentProbability, setCurrentProbability] = useState<number>(0);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1);
  const [potentialPayout, setPotentialPayout] = useState<number>(0);
  const [fixedMultipliers, setFixedMultipliers] = useState<number[]>([]);
  
  const { playSound } = useSoundEffect();

  // Initialize tiles
  useEffect(() => {
    resetGame();
  }, []);

  // Generate fixed multiplier progression from 1.01x to 24x
  useEffect(() => {
    generateFixedMultipliers();
  }, []);

  // Calculate current probability of hitting a mine
  useEffect(() => {
    if (gameStarted && !gameOver) {
      const remainingSafeTiles = remainingTiles - mines;
      const probability = (remainingSafeTiles / remainingTiles) * 100;
      setCurrentProbability(Math.round(probability * 100) / 100);
    } else if (!gameStarted) {
      // On first move
      const probability = ((25 - mines) / 25) * 100;
      setCurrentProbability(Math.round(probability * 100) / 100);
    }
  }, [remainingTiles, mines, gameStarted, gameOver]);

  // Update potential payout when multiplier or bet amount changes
  useEffect(() => {
    setPotentialPayout(betAmount * currentMultiplier);
  }, [betAmount, currentMultiplier]);

  const resetGame = () => {
    const newTiles = Array(25).fill(null).map((_, index) => ({
      id: index,
      revealed: false,
      isMine: false,
      value: 0,
      multiplier: 0,
      revealOrder: null
    }));
    
    setTiles(newTiles);
    setGameStarted(false);
    setGameOver(false);
    setSafeRevealedCount(0);
    setRemainingTiles(25);
    setCurrentMultiplier(1);
    setPotentialPayout(betAmount);
    playSound('buttonClick');
  };

  const generateFixedMultipliers = () => {
    // Create an array of multipliers from 1.01x to 24x with exponential growth
    const totalSafeTiles = 24; // Maximum possible safe tiles
    const multipliers = [];
    
    // First multiplier is always 1.01x
    multipliers.push(1.01);
    
    for (let i = 1; i < totalSafeTiles; i++) {
      // Generate a curve that starts slow and increases more rapidly
      const progress = i / (totalSafeTiles - 1);
      
      // Use exponential growth for exciting progression
      const baseMultiplier = 1.01;
      const maxMultiplier = 24;
      const exponent = 1.8; // Controls curve shape
      
      const multiplier = baseMultiplier + (Math.pow(progress, exponent) * (maxMultiplier - baseMultiplier));
      multipliers.push(parseFloat(multiplier.toFixed(2)));
    }
    
    setFixedMultipliers(multipliers);
  };

  const startGame = () => {
    if (!user) {
      toast.error("Please log in to play");
      return;
    }
    
    if (user.balance < betAmount) {
      toast.error(`Insufficient balance. You need $${betAmount.toFixed(2)} to play.`);
      return;
    }
    
    if (mines <= 0 || mines >= 25) {
      toast.error("Please select between 1 and 24 mines");
      return;
    }
    
    // Deduct bet amount from balance
    updateBalance(-betAmount);

    const newTiles = [...tiles];
    
    // Reset any previous game state
    newTiles.forEach(tile => {
      tile.revealed = false;
      tile.isMine = false;
      tile.multiplier = 0;
      tile.revealOrder = null;
    });
    
    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const randomIndex = Math.floor(Math.random() * 25);
      if (!newTiles[randomIndex].isMine) {
        newTiles[randomIndex].isMine = true;
        minesPlaced++;
      }
    }
    
    setTiles(newTiles);
    setGameStarted(true);
    setGameOver(false);
    setSafeRevealedCount(0);
    setRemainingTiles(25);
    setCurrentMultiplier(1);
    setPotentialPayout(betAmount);
    playSound('buttonClick');
  };

  const handleTileClick = (index: number) => {
    if (gameOver || tiles[index].revealed) return;
    
    const newTiles = [...tiles];
    
    if (newTiles[index].isMine) {
      // Hit a mine
      newTiles[index].revealed = true;
      setTiles(newTiles);
      setGameOver(true);
      playSound('mineExplosion');
      toast.error("Game over! You hit a mine!");
      
      // Reveal all mines
      setTimeout(() => {
        const finalTiles = [...newTiles];
        finalTiles.forEach(tile => {
          if (tile.isMine) {
            tile.revealed = true;
          }
        });
        setTiles(finalTiles);
      }, 500);
      
    } else {
      // Safe tile
      const newSafeRevealedCount = safeRevealedCount + 1;
      
      // Assign multiplier based on reveal order
      newTiles[index].revealOrder = newSafeRevealedCount;
      newTiles[index].revealed = true;
      
      // Get multiplier from the fixed progression (array index starts at 0)
      const multiplierIndex = newSafeRevealedCount - 1;
      const tileMultiplier = fixedMultipliers[multiplierIndex];
      
      // Assign multiplier to the revealed tile
      newTiles[index].multiplier = tileMultiplier;
      
      // Update current multiplier to the latest revealed tile's multiplier
      setCurrentMultiplier(tileMultiplier);
      
      setSafeRevealedCount(newSafeRevealedCount);
      setRemainingTiles(remainingTiles - 1);
      setTiles(newTiles);
      playSound('mineClick');
      
      // Check if all safe tiles are revealed
      if (newSafeRevealedCount === 25 - mines) {
        cashOut(); // Auto cash out if all safe tiles are revealed
        setGameOver(true);
        toast.success("Congratulations! You found all safe tiles!");
      }
    }
  };

  const cashOut = () => {
    if (!gameStarted || gameOver) return;
    
    const winnings = betAmount * currentMultiplier;
    updateBalance(winnings);
    setGameOver(true);
    
    // Reveal all mines after cashing out
    const newTiles = [...tiles];
    newTiles.forEach(tile => {
      if (tile.isMine) {
        tile.revealed = true;
      }
    });
    setTiles(newTiles);
    
    playSound('gameWin');
    toast.success(`You cashed out $${winnings.toFixed(2)}!`);
  };

  const handleMineInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    
    if (isNaN(value)) {
      setMines(0);
    } else if (value > 24) {
      setMines(24);
    } else {
      setMines(value);
    }
  };
  
  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    
    if (isNaN(value) || value <= 0) {
      setBetAmount(1);
    } else {
      setBetAmount(value);
    }
    
    // Update potential payout
    setPotentialPayout(value * currentMultiplier);
  };

  const setQuickMineCount = (count: number) => {
    setMines(count);
    playSound('buttonClick');
  };
  
  const setQuickBetAmount = (amount: number) => {
    setBetAmount(amount);
    setPotentialPayout(amount * currentMultiplier);
    playSound('buttonClick');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full h-full">
      {/* Settings Panel */}
      <div className="w-full lg:w-72 bg-slate-900 rounded-lg p-4 space-y-4">
        <div className="space-y-3">
          <div className="font-semibold text-white">Mines Settings</div>
          
          <div className="space-y-2">
            <label htmlFor="betAmount" className="text-sm text-slate-300">
              Bet Amount
            </label>
            <Input 
              id="betAmount"
              type="number" 
              min="1" 
              step="0.01"
              value={betAmount} 
              onChange={handleBetAmountChange}
              disabled={gameStarted && !gameOver}
              className="bg-slate-800 border-slate-700"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setQuickBetAmount(5)}
              disabled={gameStarted && !gameOver}
              className="bg-slate-800 hover:bg-slate-700 border-slate-700"
            >
              $5
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setQuickBetAmount(10)}
              disabled={gameStarted && !gameOver}
              className="bg-slate-800 hover:bg-slate-700 border-slate-700"
            >
              $10
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setQuickBetAmount(25)}
              disabled={gameStarted && !gameOver}
              className="bg-slate-800 hover:bg-slate-700 border-slate-700"
            >
              $25
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setQuickBetAmount(50)}
              disabled={gameStarted && !gameOver}
              className="bg-slate-800 hover:bg-slate-700 border-slate-700"
            >
              $50
            </Button>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="mineCount" className="text-sm text-slate-300">
              Number of Mines
            </label>
            <Input 
              id="mineCount"
              type="number" 
              min="1" 
              max="24" 
              value={mines} 
              onChange={handleMineInputChange}
              disabled={gameStarted && !gameOver}
              className="bg-slate-800 border-slate-700"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setQuickMineCount(1)}
              disabled={gameStarted && !gameOver}
              className="bg-slate-800 hover:bg-slate-700 border-slate-700"
            >
              1
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setQuickMineCount(3)}
              disabled={gameStarted && !gameOver}
              className="bg-slate-800 hover:bg-slate-700 border-slate-700"
            >
              3
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setQuickMineCount(5)}
              disabled={gameStarted && !gameOver}
              className="bg-slate-800 hover:bg-slate-700 border-slate-700"
            >
              5
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setQuickMineCount(10)}
              disabled={gameStarted && !gameOver}
              className="bg-slate-800 hover:bg-slate-700 border-slate-700"
            >
              10
            </Button>
          </div>
          
          {/* Game Status Display */}
          <div className="space-y-2 pt-2 border-t border-slate-700">
            <div className="text-sm text-slate-300">Game Status</div>
            
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Balance:</span>
              <span className="text-xs text-white">${user?.balance.toFixed(2) || '0.00'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Current Multiplier:</span>
              <span className="text-xs text-white">{currentMultiplier.toFixed(2)}x</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Potential Payout:</span>
              <span className="text-xs text-emerald-400">${potentialPayout.toFixed(2)}</span>
            </div>
            
            {gameStarted && !gameOver && (
              <div className="text-sm text-emerald-400 font-medium">
                Safe probability: {currentProbability}%
              </div>
            )}
          </div>
          
          <div className="pt-2">
            {gameStarted && !gameOver ? (
              <div className="space-y-2">
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={cashOut}
                >
                  <DollarSign className="mr-2 h-4 w-4" /> Cash Out ${potentialPayout.toFixed(2)}
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full border-slate-700 text-slate-300"
                  onClick={resetGame}
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Forfeit
                </Button>
              </div>
            ) : gameOver ? (
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={resetGame}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> New Game
              </Button>
            ) : (
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={startGame}
                disabled={!user || user.balance < betAmount}
              >
                <Bomb className="mr-2 h-4 w-4" /> Start Mining
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Game Grid */}
      <div className="flex-1 bg-slate-900 rounded-lg p-6">
        <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
          {tiles.map((tile, index) => (
            <button
              key={index}
              onClick={() => handleTileClick(index)}
              disabled={!gameStarted || gameOver || tile.revealed}
              className={`
                aspect-square rounded-md transition-all duration-200 flex items-center justify-center
                ${!tile.revealed ? 'bg-slate-800 hover:bg-slate-700' : 
                  tile.isMine ? 'bg-red-600' : 'bg-emerald-600'}
                ${!gameStarted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
              `}
            >
              {tile.revealed && tile.isMine ? (
                <Bomb className="text-white h-8 w-8" />
              ) : tile.revealed ? (
                <div className="text-white font-bold">{tile.multiplier.toFixed(2)}x</div>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImprovedMinesInterface;
