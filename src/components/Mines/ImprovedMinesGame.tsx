
import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { useUser } from "../../context/UserContext";
import { Dice5, Diamond, AlertCircle, Bomb } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { showGameResult } from '../GameResultNotification';
import PulseAnimation from '../GameEffects/PulseAnimation';

interface Tile {
  x: number;
  y: number;
  revealed: boolean;
  isMine: boolean;
}

const ImprovedMinesGame: React.FC = () => {
  // Fixed 5x5 grid
  const gridSize = 5;
  const rows = gridSize;
  const cols = gridSize;
  
  const [mines, setMines] = useState<number>(3);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [gameLost, setGameLost] = useState<boolean>(false);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1);
  const [nextMultiplier, setNextMultiplier] = useState<number>(1.2);
  const [autoMode, setAutoMode] = useState<boolean>(false);
  const [autoPicksRemaining, setAutoPicksRemaining] = useState<number>(0);
  const [safetyPercentage, setSafetyPercentage] = useState<number>(100);
  
  const { user, updateBalance, addBet, addXp } = useUser();
  
  useEffect(() => {
    if (isPlaying) {
      calculateSafetyPercentage();
    }
  }, [revealedCount, isPlaying]);
  
  useEffect(() => {
    calculateNextMultiplier();
  }, [mines, rows, cols, revealedCount]);
  
  const initializeGame = () => {
    if (betAmount <= 0) {
      toast("Please enter a valid bet amount");
      return;
    }
    
    if (user.balance < betAmount) {
      toast("Insufficient balance");
      return;
    }
    
    // Deduct bet amount from balance
    updateBalance(-betAmount);
    
    // Add to wagered amount and increase XP (1 XP per dollar bet)
    addBet(betAmount);
    addXp(Math.floor(betAmount / 2));
    
    const totalTiles = rows * cols;
    if (mines >= totalTiles) {
      toast("Too many mines for this grid size");
      return;
    }
    
    // Create all tiles
    const newTiles: Tile[] = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        newTiles.push({
          x,
          y,
          revealed: false,
          isMine: false
        });
      }
    }
    
    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const randomIndex = Math.floor(Math.random() * newTiles.length);
      if (!newTiles[randomIndex].isMine) {
        newTiles[randomIndex].isMine = true;
        minesPlaced++;
      }
    }
    
    setTiles(newTiles);
    setIsPlaying(true);
    setGameLost(false);
    setRevealedCount(0);
    setCurrentMultiplier(1);
    calculateNextMultiplier();
    calculateSafetyPercentage();
  };
  
  const calculateSafetyPercentage = () => {
    const totalTiles = rows * cols;
    const revealed = revealedCount;
    const unrevealed = totalTiles - revealed;
    const minesLeft = mines;
    
    if (unrevealed === 0) return 0;
    
    const safetyPercent = 100 - ((minesLeft / unrevealed) * 100);
    setSafetyPercentage(Math.round(safetyPercent * 100) / 100);
  };
  
  const calculateNextMultiplier = () => {
    const totalTiles = rows * cols;
    const safeSquares = totalTiles - mines;
    const nextPick = revealedCount + 1;
    
    if (nextPick > safeSquares) {
      setNextMultiplier(0);
      return;
    }
    
    // This formula creates a steeper curve as you get more correct picks
    const multiplier = parseFloat((1 / (1 - (mines / (totalTiles - nextPick)))).toFixed(2));
    setNextMultiplier(multiplier);
  };
  
  const handleTileClick = (tile: Tile) => {
    if (!isPlaying || tile.revealed || gameLost) return;
    
    // Reveal the tile
    const updatedTiles = tiles.map(t => {
      if (t.x === tile.x && t.y === tile.y) {
        return { ...t, revealed: true };
      }
      return t;
    });
    
    if (tile.isMine) {
      // Game over
      setGameLost(true);
      setIsPlaying(false);
      
      // Reveal all mines
      const finalTiles = updatedTiles.map(t => {
        if (t.isMine) {
          return { ...t, revealed: true };
        }
        return t;
      });
      
      setTiles(finalTiles);
      
      // Show result notification
      showGameResult({
        success: false,
        message: "You hit a mine!",
        multiplier: currentMultiplier,
        amount: betAmount
      });
      
    } else {
      // Safe tile
      setTiles(updatedTiles);
      const newRevealedCount = revealedCount + 1;
      setRevealedCount(newRevealedCount);
      
      // Update current multiplier
      setCurrentMultiplier(nextMultiplier);
      
      // Show tile safety tooltip
      toast(`Tile Safe! Next tile safety: ${safetyPercentage}%`, {
        duration: 2000
      });
      
      // Check if all safe tiles have been revealed
      const totalTiles = rows * cols;
      const safeSquares = totalTiles - mines;
      
      if (newRevealedCount >= safeSquares) {
        // Player won by revealing all safe tiles
        setIsPlaying(false);
        
        // Calculate winnings
        const winnings = betAmount * currentMultiplier;
        updateBalance(winnings);
        
        // Show result notification
        showGameResult({
          success: true,
          message: "You revealed all safe tiles!",
          multiplier: currentMultiplier,
          amount: winnings
        });
      }
      
      // Auto mode handling
      if (autoMode && autoPicksRemaining > 0) {
        setAutoPicksRemaining(prev => prev - 1);
        if (autoPicksRemaining <= 1) {
          setAutoMode(false);
        }
      }
    }
  };
  
  const cashOut = () => {
    if (!isPlaying || revealedCount === 0) return;
    
    setIsPlaying(false);
    
    // Calculate winnings
    const winnings = betAmount * currentMultiplier;
    updateBalance(winnings);
    
    // Show result notification
    showGameResult({
      success: true,
      message: "Cashed Out!",
      multiplier: currentMultiplier,
      amount: winnings
    });
  };
  
  const resetGame = () => {
    setIsPlaying(false);
    setTiles([]);
    setRevealedCount(0);
    setGameLost(false);
    setCurrentMultiplier(1);
    setAutoMode(false);
    setAutoPicksRemaining(0);
  };
  
  const getMineClass = (tile: Tile) => {
    if (!tile.revealed) {
      return "bg-gradient-to-b from-indigo-800 to-indigo-900 hover:from-indigo-700 hover:to-indigo-800";
    }
    
    if (tile.isMine) {
      return "bg-gradient-to-b from-red-600 to-red-800";
    }
    
    return "bg-gradient-to-b from-green-600 to-green-700";
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <Card className="md:w-1/3 bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-center">Game Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your Balance</label>
            <div className="bg-gray-800 p-2 rounded border border-gray-700 text-lg font-semibold text-yellow-400">
              ${user.balance.toFixed(2)}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Bet Amount</label>
            <Input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(parseFloat(e.target.value || "0"))}
              min="1"
              step="1"
              disabled={isPlaying}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Number of Mines (3-12)</label>
            <Input
              type="number"
              value={mines}
              onChange={(e) => setMines(parseInt(e.target.value || "3"))}
              min="3"
              max="12"
              disabled={isPlaying}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          
          <div className="pt-2 space-y-2">
            <Button 
              onClick={initializeGame} 
              disabled={isPlaying || betAmount <= 0 || user.balance < betAmount}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              Start Game
            </Button>
            
            <Button 
              onClick={cashOut} 
              disabled={!isPlaying || revealedCount === 0}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
            >
              Cash Out (${(betAmount * currentMultiplier).toFixed(2)})
            </Button>
            
            <Button 
              onClick={resetGame} 
              disabled={!isPlaying && !gameLost}
              variant="outline"
              className="w-full"
            >
              Reset
            </Button>
          </div>
          
          {isPlaying && (
            <div className="mt-4 space-y-2 rounded-lg border border-indigo-800 bg-indigo-900/30 p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Current Multiplier:</span>
                <PulseAnimation isActive={isPlaying}>
                  <span className="font-bold text-xl text-yellow-400">{currentMultiplier.toFixed(2)}x</span>
                </PulseAnimation>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Next Multiplier:</span>
                <span className="font-medium text-green-400">{nextMultiplier.toFixed(2)}x</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Potential Win:</span>
                <span className="font-medium text-yellow-400">${(betAmount * nextMultiplier).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1 text-blue-400" />
                  Next Tile Safety:
                </span>
                <span className="font-medium text-blue-400">{safetyPercentage}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="md:w-2/3 bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent font-bold">
              Mines
            </CardTitle>
            <div className="flex items-center gap-2">
              <Diamond className="h-5 w-5 text-blue-400" />
              <span>Safe Tiles: {rows * cols - mines}</span>
              <Bomb className="h-5 w-5 text-red-400 ml-2" />
              <span>Mines: {mines}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
            {tiles.map((tile, i) => (
              <motion.button
                key={`${tile.x}-${tile.y}`}
                className={`aspect-square rounded-md flex items-center justify-center ${getMineClass(tile)}`}
                onClick={() => handleTileClick(tile)}
                disabled={!isPlaying || tile.revealed}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.01, duration: 0.2 }}
                whileHover={!tile.revealed && isPlaying ? { scale: 1.05 } : {}}
                whileTap={!tile.revealed && isPlaying ? { scale: 0.95 } : {}}
              >
                {tile.revealed ? (
                  tile.isMine ? (
                    <Bomb className="h-8 w-8 text-white" />
                  ) : (
                    <Diamond className="h-8 w-8 text-white" />
                  )
                ) : (
                  <Dice5 className="h-8 w-8 text-gray-300 opacity-60" />
                )}
              </motion.button>
            ))}
          </div>
          
          {!isPlaying && tiles.length === 0 && (
            <div className="text-center my-12 space-y-4">
              <h3 className="text-xl font-bold">Welcome to Mines!</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Click on tiles to reveal them. Avoid the mines and cash out before it's too late!
              </p>
              <Button 
                onClick={initializeGame} 
                disabled={betAmount <= 0 || user.balance < betAmount}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8"
              >
                Start Game
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImprovedMinesGame;
