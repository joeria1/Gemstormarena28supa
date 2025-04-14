
import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Slider } from "../ui/slider";
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "../../hooks/use-toast";
import LightningEffect from '../GameEffects/LightningEffect';
import ItemGlowEffect from '../GameEffects/ItemGlowEffect';
import { Bomb, Diamond, DollarSign, RotateCw, Shield, ChevronRight } from 'lucide-react';

interface GameSettings {
  gridSize: number;
  mineCount: number;
}

interface TileProps {
  revealed: boolean;
  hasMine: boolean;
  onClick: () => void;
  disabled: boolean;
}

const Tile: React.FC<TileProps> = ({ revealed, hasMine, onClick, disabled }) => {
  return (
    <motion.div
      whileHover={!disabled && !revealed ? { scale: 1.05 } : {}}
      whileTap={!disabled && !revealed ? { scale: 0.95 } : {}}
      onClick={!disabled && !revealed ? onClick : undefined}
      className={`
        w-12 h-12 md:w-16 md:h-16 rounded-lg shadow-lg
        flex items-center justify-center cursor-pointer
        transform transition-all duration-200
        ${revealed
          ? hasMine
            ? 'bg-gradient-to-br from-red-500 to-red-700'
            : 'bg-gradient-to-br from-green-500 to-green-700'
          : 'bg-gradient-to-br from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800'
        }
        ${disabled && !revealed ? 'opacity-70 cursor-not-allowed' : ''}
      `}
    >
      {revealed && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {hasMine ? (
            <Bomb size={24} className="text-white" />
          ) : (
            <Diamond size={24} className="text-white" />
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

const getMultiplier = (revealed: number, mines: number, total: number) => {
  if (revealed === 0) return 1;
  const safeSquares = total - mines;
  let multiplier = 1;
  
  for (let i = 0; i < revealed; i++) {
    multiplier *= (total - i) / (safeSquares - i);
  }
  
  // Apply house edge
  multiplier *= 0.97;
  
  return parseFloat(multiplier.toFixed(2));
};

const EnhancedMinesGame: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<GameSettings>({ gridSize: 5, mineCount: 5 });
  const [board, setBoard] = useState<boolean[][]>([]);
  const [revealed, setRevealed] = useState<boolean[][]>([]);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [bet, setBet] = useState<number>(10);
  const [balance, setBalance] = useState<number>(1000);
  const [currentWinnings, setCurrentWinnings] = useState<number>(0);
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [showLightning, setShowLightning] = useState<boolean>(false);
  const [nextTileSafety, setNextTileSafety] = useState<number>(0);
  
  // Initialize game board
  const initializeGame = () => {
    if (bet > balance) {
      toast({
        title: "Insufficient balance",
        description: "Please lower your bet amount",
        variant: "destructive"
      });
      return;
    }
    
    setBalance(prev => prev - bet);
    
    const { gridSize, mineCount } = settings;
    const totalTiles = gridSize * gridSize;
    
    if (mineCount >= totalTiles) {
      toast({
        title: "Invalid settings",
        description: "Mine count must be less than total tiles",
        variant: "destructive"
      });
      return;
    }
    
    // Create empty board
    const newBoard: boolean[][] = Array(gridSize).fill(false).map(() => Array(gridSize).fill(false));
    
    // Place mines randomly
    let placedMines = 0;
    while (placedMines < mineCount) {
      const row = Math.floor(Math.random() * gridSize);
      const col = Math.floor(Math.random() * gridSize);
      
      if (!newBoard[row][col]) {
        newBoard[row][col] = true;
        placedMines++;
      }
    }
    
    // Initialize revealed array
    const newRevealed: boolean[][] = Array(gridSize).fill(false).map(() => Array(gridSize).fill(false));
    
    // Set game state
    setBoard(newBoard);
    setRevealed(newRevealed);
    setGameState('playing');
    setRevealedCount(0);
    setCurrentWinnings(0);
    
    // Calculate next tile safety
    const totalTilesRemaining = gridSize * gridSize;
    const safetyPercentage = ((totalTilesRemaining - mineCount) / totalTilesRemaining) * 100;
    setNextTileSafety(parseFloat(safetyPercentage.toFixed(1)));
  };
  
  // Handle tile click
  const handleTileClick = (row: number, col: number) => {
    if (gameState !== 'playing' || revealed[row][col]) return;
    
    const newRevealed = [...revealed];
    newRevealed[row][col] = true;
    setRevealed(newRevealed);
    
    // Check if tile has mine
    if (board[row][col]) {
      // Game over - hit a mine
      setShowLightning(true);
      setTimeout(() => {
        setGameState('lost');
        toast({
          title: "Boom! You hit a mine",
          description: `You lost $${bet}`,
          variant: "destructive"
        });
      }, 1000);
    } else {
      // Successfully revealed a safe tile
      const newRevealedCount = revealedCount + 1;
      setRevealedCount(newRevealedCount);
      
      // Calculate winnings based on current progression
      const totalTiles = settings.gridSize * settings.gridSize;
      const multiplier = getMultiplier(newRevealedCount, settings.mineCount, totalTiles);
      const newWinnings = parseFloat((bet * multiplier).toFixed(2));
      setCurrentWinnings(newWinnings);
      
      // Check if all safe tiles are revealed (win condition)
      const totalSafeTiles = totalTiles - settings.mineCount;
      if (newRevealedCount >= totalSafeTiles) {
        setGameState('won');
        setBalance(prev => prev + newWinnings);
        toast({
          title: "You cleared all tiles!",
          description: `You won $${newWinnings}!`,
        });
      }
      
      // Update next tile safety
      const remainingTiles = totalTiles - newRevealedCount;
      const remainingMines = settings.mineCount;
      const safetyPercentage = ((remainingTiles - remainingMines) / remainingTiles) * 100;
      setNextTileSafety(parseFloat(safetyPercentage.toFixed(1)));
    }
  };
  
  // Cashout
  const handleCashout = () => {
    if (gameState !== 'playing' || currentWinnings <= 0) return;
    
    setBalance(prev => prev + currentWinnings);
    setGameState('idle');
    
    toast({
      title: "Cashed out!",
      description: `You won $${currentWinnings}!`,
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col md:flex-row gap-4 w-full max-w-5xl mx-auto"
    >
      {/* Game Info Panel */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full md:w-1/4 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-4 flex flex-col gap-4"
      >
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Balance</h3>
          <div className="flex items-center">
            <DollarSign size={20} className="text-yellow-400 mr-2" />
            <span className="text-2xl font-bold text-white">{balance.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Current Bet</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setBet(prev => Math.max(1, prev - 5))}
              disabled={gameState === 'playing'}
              className="px-2"
            >
              -5
            </Button>
            <div className="flex items-center justify-center bg-gray-700 rounded px-4 flex-1">
              <span className="text-xl font-bold text-yellow-400">${bet}</span>
            </div>
            <Button 
              variant="outline"
              onClick={() => setBet(prev => prev + 5)}
              disabled={gameState === 'playing'}
              className="px-2"
            >
              +5
            </Button>
          </div>
        </div>
        
        {gameState === 'playing' && (
          <ItemGlowEffect 
            isActive={currentWinnings > bet}
            color="rgba(0, 255, 0, 0.3)"
            className="bg-gray-700/50 rounded-lg p-4"
          >
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-300">Potential Win</h3>
                <span className="text-xl font-bold text-green-400">${currentWinnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <h3 className="text-sm text-gray-400">Multiplier</h3>
                <span className="text-md font-medium text-yellow-400">
                  {(currentWinnings / bet).toFixed(2)}x
                </span>
              </div>
            </div>
          </ItemGlowEffect>
        )}
        
        <div className="mt-2">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Mine Safety</h3>
          <div className="flex items-center gap-2 mb-2">
            <Shield size={20} className={nextTileSafety > 70 ? "text-green-400" : nextTileSafety > 40 ? "text-yellow-400" : "text-red-400"} />
            <span className="text-md font-medium text-gray-200">Next Tile Safety:</span>
            <span className={`text-lg font-bold ${
              nextTileSafety > 70 ? "text-green-400" : nextTileSafety > 40 ? "text-yellow-400" : "text-red-400"
            }`}>
              {nextTileSafety}%
            </span>
          </div>
          
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                nextTileSafety > 70 ? "bg-green-500" : nextTileSafety > 40 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${nextTileSafety}%` }}
            ></div>
          </div>
        </div>
        
        {gameState === 'playing' ? (
          <Button 
            onClick={handleCashout}
            className="mt-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3"
          >
            Cash Out ${currentWinnings.toFixed(2)}
          </Button>
        ) : (
          <Button 
            onClick={initializeGame}
            className="mt-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3"
          >
            {gameState === 'idle' ? 'Start Game' : 'Play Again'}
          </Button>
        )}
      </motion.div>
      
      {/* Game Board */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full md:w-3/4 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-4"
      >
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Mines</h2>
          <div className="flex items-center gap-2">
            <Bomb size={18} className="text-red-400" />
            <span className="text-lg font-bold text-white">{settings.mineCount}</span>
          </div>
        </div>
        
        {gameState === 'idle' && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Mine Count</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">1</span>
              <Slider
                value={[settings.mineCount]}
                min={1}
                max={24}
                step={1}
                onValueChange={(value) => setSettings(prev => ({ ...prev, mineCount: value[0] }))}
                className="flex-1"
              />
              <span className="text-sm text-gray-400">24</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-sm text-gray-400">Safer</span>
              <span className="text-sm text-gray-400">Riskier</span>
            </div>
          </div>
        )}
        
        <div className="p-4 flex justify-center">
          <div className="grid grid-cols-5 gap-2">
            {board.length > 0 && board.map((row, rowIndex) => (
              row.map((hasMine, colIndex) => (
                <Tile
                  key={`${rowIndex}-${colIndex}`}
                  revealed={revealed[rowIndex][colIndex] || gameState === 'lost'}
                  hasMine={hasMine}
                  onClick={() => handleTileClick(rowIndex, colIndex)}
                  disabled={gameState !== 'playing'}
                />
              ))
            ))}
          </div>
        </div>
        
        {gameState === 'idle' && (
          <div className="mt-4 text-center text-gray-400 p-4 border border-gray-700 rounded-lg">
            <p>Click "Start Game" to begin. Reveal tiles and avoid mines to win.</p>
            <p className="mt-2">Cash out anytime to secure your winnings!</p>
          </div>
        )}
        
        <AnimatePresence>
          {(gameState === 'won' || gameState === 'lost') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mt-4 text-center p-4 rounded-lg ${
                gameState === 'won' ? 'bg-green-900/30 border border-green-600' : 'bg-red-900/30 border border-red-600'
              }`}
            >
              <h3 className={`text-xl font-bold ${gameState === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                {gameState === 'won' ? 'You Won!' : 'Game Over!'}
              </h3>
              <p className="text-gray-300 mt-1">
                {gameState === 'won' 
                  ? `You have cleared all safe tiles and won $${currentWinnings.toFixed(2)}!`
                  : 'You hit a mine. Better luck next time!'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Lightning effect for mine hit */}
      <LightningEffect isVisible={showLightning} onComplete={() => setShowLightning(false)} />
    </motion.div>
  );
};

export default EnhancedMinesGame;
