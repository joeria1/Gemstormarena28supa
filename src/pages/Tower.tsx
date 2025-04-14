import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useSound } from '../components/SoundManager';
import { showGameResult } from '../components/GameResultNotification';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { SOUNDS, playSound } from '../utils/soundEffects';
import PulseAnimation from '../components/GameEffects/PulseAnimation';
import LightningEffect from '../components/GameEffects/LightningEffect';
import { useUser } from '../context/UserContext';

enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

interface TowerLevel {
  bombs: number[];
  safe: number[];
  clicked: number[];
  level: number;
}

const difficultySettings = {
  [DifficultyLevel.EASY]: { bombs: 1, safe: 2 },
  [DifficultyLevel.MEDIUM]: { bombs: 1, safe: 1 },
  [DifficultyLevel.HARD]: { bombs: 2, safe: 1 }
};

const Tower: React.FC = () => {
  const [bet, setBet] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.EASY);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [tower, setTower] = useState<TowerLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [maxLevel, setMaxLevel] = useState<number>(10);
  const [lastBombHit, setLastBombHit] = useState<{ level: number, tileIndex: number } | null>(null);
  const [showLightning, setShowLightning] = useState<boolean>(false);
  const { playSound } = useSound();
  const { user, updateBalance, addBet, addXp } = useUser();

  const diffSettings = difficultySettings[difficulty];
  const totalTiles = diffSettings.bombs + diffSettings.safe;
  
  const generateTowerLevel = (level: number): TowerLevel => {
    const allPositions = Array.from({ length: totalTiles }, (_, i) => i);
    // Randomly select bomb positions
    const bombs = [];
    for (let i = 0; i < diffSettings.bombs; i++) {
      const randomIndex = Math.floor(Math.random() * allPositions.length);
      bombs.push(allPositions.splice(randomIndex, 1)[0]);
    }
    
    // Remaining positions are safe
    const safe = [...allPositions];
    
    return {
      bombs,
      safe,
      clicked: [],
      level
    };
  };
  
  const generateTower = () => {
    const newTower = Array.from({ length: maxLevel }, (_, i) => 
      generateTowerLevel(i + 1)
    );
    setTower(newTower);
  };
  
  const startGame = () => {
    if (bet <= 0) return;
    if (user.balance < bet) {
      showGameResult({
        success: false,
        message: "Insufficient balance",
        amount: bet
      });
      return;
    }
    
    // Deduct bet amount from balance
    updateBalance(-bet);
    
    // Add to wagered amount and increase XP (1 XP per dollar bet)
    addBet(bet);
    addXp(Math.floor(bet / 2));
    
    setGameActive(true);
    setCurrentLevel(0);
    setMultiplier(1);
    setLastBombHit(null);
    setShowLightning(false);
    generateTower();
    playSound(SOUNDS.BUTTON_CLICK);
  };
  
  const handleTileClick = (row: number, col: number) => {
    if (!gameActive) return;
    
    const currentTowerLevel = tower[currentLevel];
    
    // Check if already clicked
    if (currentTowerLevel.clicked.includes(col)) return;
    
    // Update clicked tiles
    const updatedTower = [...tower];
    updatedTower[currentLevel] = {
      ...currentTowerLevel,
      clicked: [...currentTowerLevel.clicked, col]
    };
    
    setTower(updatedTower);
    
    // Calculate tile safety percentage for next level
    const safeTilePercentage = calculateSafetyPercentage();
    
    // Check if tile has mine
    if (currentTowerLevel.bombs.includes(col)) {
      // Game over - hit a bomb
      playSound(SOUNDS.TOWER_WRONG);
      setShowLightning(true);
      setLastBombHit({ level: currentLevel, tileIndex: col });
      
      setTimeout(() => {
        setShowLightning(false);
        
        showGameResult({
          success: false,
          message: "You hit a bomb!",
          multiplier: multiplier,
          amount: bet
        });
        // Keep game active to show the bomb hit, but disable interactions
        setGameActive(false);
      }, 1000);
    } else {
      // Show tile safety message
      showGameResult({
        success: true,
        message: `Tile Safe! Next tile safety: ${safeTilePercentage}%`,
        multiplier: 0,
        amount: 0,
        duration: 1000
      });
      
      // Safe tile
      playSound(SOUNDS.TOWER_CORRECT);
      
      // In Easy mode, proceed to the next level after hitting ANY safe tile
      if (difficulty === DifficultyLevel.EASY) {
        // Level completed immediately after hitting a safe tile
        if (currentLevel + 1 >= maxLevel) {
          // Game won
          const finalMultiplier = calculateMultiplier(currentLevel + 1);
          const winAmount = bet * finalMultiplier;
          updateBalance(winAmount); // Add winnings to balance
          
          playSound(SOUNDS.CASH_OUT);
          showGameResult({
            success: true,
            message: "Tower conquered!",
            multiplier: finalMultiplier,
            amount: winAmount
          });
          setGameActive(false);
        } else {
          // Next level
          const newMultiplier = calculateMultiplier(currentLevel + 1);
          setMultiplier(newMultiplier);
          setCurrentLevel(currentLevel + 1);
        }
      } else {
        // For Medium and Hard modes, check if all safe tiles for this level are clicked
        const allSafeClicked = currentTowerLevel.safe.every(safeIndex => 
          [...currentTowerLevel.clicked, col].includes(safeIndex)
        );
        
        if (allSafeClicked) {
          // Level completed
          if (currentLevel + 1 >= maxLevel) {
            // Game won
            const finalMultiplier = calculateMultiplier(currentLevel + 1);
            const winAmount = bet * finalMultiplier;
            updateBalance(winAmount); // Add winnings to balance
            
            playSound(SOUNDS.CASH_OUT);
            showGameResult({
              success: true,
              message: "Tower conquered!",
              multiplier: finalMultiplier,
              amount: winAmount
            });
            setGameActive(false);
          } else {
            // Next level
            const newMultiplier = calculateMultiplier(currentLevel + 1);
            setMultiplier(newMultiplier);
            setCurrentLevel(currentLevel + 1);
          }
        }
      }
    }
  };

  const calculateSafetyPercentage = (): number => {
    if (currentLevel + 1 >= maxLevel) return 100; // Last level, no more tiles
    
    const nextSettings = difficultySettings[difficulty];
    const safePercentage = (nextSettings.safe / (nextSettings.safe + nextSettings.bombs)) * 100;
    return Math.round(safePercentage);
  };

  const calculateMultiplier = (level: number): number => {
    const baseMultiplier = difficulty === DifficultyLevel.EASY ? 1.3 : 
                           difficulty === DifficultyLevel.MEDIUM ? 1.8 : 2.2;
    return parseFloat((Math.pow(baseMultiplier, level)).toFixed(2));
  };
  
  const cashOut = () => {
    if (!gameActive || currentLevel === 0) return;
    
    const winAmount = bet * multiplier;
    updateBalance(winAmount); // Add winnings to balance
    
    playSound(SOUNDS.CASH_OUT);
    showGameResult({
      success: true,
      message: `Cashed out at level ${currentLevel + 1}!`,
      multiplier: multiplier,
      amount: winAmount
    });
    setGameActive(false);
  };
  
  const renderGrid = () => {
    return tower.map((level, levelIndex) => {
      const isCurrentLevel = levelIndex === currentLevel;
      const isPastLevel = levelIndex < currentLevel;
      const isDisabled = !isCurrentLevel || !gameActive;
      const isGameOver = lastBombHit !== null && !gameActive;
      const isVisibleLevel = Math.abs(levelIndex - currentLevel) <= 2 || isGameOver; // Only render levels near current
      
      if (!isVisibleLevel && !isGameOver) return null;
      
      return (
        <motion.div 
          key={`level-${levelIndex}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: isCurrentLevel ? 1 : isPastLevel ? 0.7 : 0.5, 
            scale: isCurrentLevel ? 1 : 0.9,
            y: 0
          }}
          transition={{ duration: 0.3 }}
          className="flex justify-center space-x-2 my-2"
        >
          <PulseAnimation 
            isActive={isCurrentLevel}
            className="flex-shrink-0 w-10 text-right font-bold flex items-center justify-end"
          >
            <span className={`${isCurrentLevel ? 'text-yellow-400 text-lg' : 'text-gray-400'}`}>
              {maxLevel - levelIndex}
            </span>
          </PulseAnimation>
          
          <div className="flex justify-center space-x-2">
            {Array.from({ length: totalTiles }).map((_, tileIndex) => {
              const isClicked = level.clicked.includes(tileIndex);
              const isBomb = level.bombs.includes(tileIndex);
              const isSafe = level.safe.includes(tileIndex);
              const isLastBombHit = isGameOver && lastBombHit?.level === levelIndex && lastBombHit?.tileIndex === tileIndex;
              
              return (
                <motion.div
                  key={`tile-${levelIndex}-${tileIndex}`}
                  whileHover={!isDisabled && !isClicked ? { scale: 1.1 } : {}}
                  whileTap={!isDisabled && !isClicked ? { scale: 0.95 } : {}}
                >
                  <Button 
                    disabled={isDisabled || isClicked}
                    onClick={() => handleTileClick(levelIndex, tileIndex)}
                    variant={isPastLevel ? "default" : "outline"}
                    className={`w-12 h-12 ${
                      isLastBombHit ? 'bg-red-500 hover:bg-red-600' :
                      isPastLevel && isBomb ? 'bg-red-500 hover:bg-red-600' :
                      isPastLevel && isSafe ? 'bg-green-500 hover:bg-green-600' :
                      isClicked && isBomb ? 'bg-red-500 hover:bg-red-600' :
                      isClicked && isSafe ? 'bg-green-500 hover:bg-green-600' :
                      isCurrentLevel ? 'bg-muted/80 hover:bg-muted border-2 border-gray-600 shadow-md' :
                      'bg-muted/50 hover:bg-muted/70'
                    }`}
                  >
                    {(isPastLevel || isLastBombHit) && isBomb && '💣'}
                    {isPastLevel && isSafe && '✓'}
                    {isCurrentLevel && isClicked && isBomb && '💣'}
                    {isCurrentLevel && isClicked && isSafe && '✓'}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      );
    }).reverse(); // Display tower from bottom to top
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Tower Game</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Game Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <Tabs defaultValue={difficulty} onValueChange={(v) => setDifficulty(v as DifficultyLevel)} className="w-full">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value={DifficultyLevel.EASY}>Easy</TabsTrigger>
                    <TabsTrigger value={DifficultyLevel.MEDIUM}>Medium</TabsTrigger>
                    <TabsTrigger value={DifficultyLevel.HARD}>Hard</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Bet Amount</label>
                <div className="flex space-x-2">
                  <Input 
                    type="number" 
                    value={bet} 
                    onChange={(e) => setBet(parseFloat(e.target.value) || 0)} 
                    min="1" 
                    disabled={gameActive}
                    className="flex-grow"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tower Height</label>
                <div className="flex space-x-2">
                  <Input 
                    type="number" 
                    value={maxLevel} 
                    onChange={(e) => setMaxLevel(parseInt(e.target.value) || 10)} 
                    min="5" 
                    max="20" 
                    disabled={gameActive}
                    className="flex-grow"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  onClick={startGame}
                  disabled={gameActive || bet <= 0 || user.balance < bet}
                >
                  Start
                </Button>
                <Button 
                  className={`flex-1 ${gameActive && currentLevel > 0 ? 'bg-green-600 hover:bg-green-700 animate-pulse' : ''}`}
                  variant="secondary"
                  onClick={cashOut}
                  disabled={!gameActive || currentLevel === 0}
                >
                  Cash Out ({multiplier}x)
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="w-full bg-black/40 rounded-md p-3 border border-white/10">
              <div className="text-sm font-medium">Difficulty Info</div>
              <div className="text-xs text-muted-foreground space-y-1 mt-1">
                <p>Easy: 1 bomb, 2 safe spots (only 1 needed)</p>
                <p>Medium: 1 bomb, 1 safe spot (all needed)</p>
                <p>Hard: 2 bombs, 1 safe spot (all needed)</p>
              </div>
            </div>
            
            {gameActive && (
              <div className="w-full bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-md p-3 border border-blue-500/20">
                <div className="text-sm font-medium text-blue-300">Current Progress</div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs">Level {currentLevel + 1}/{maxLevel}</span>
                  <span className="text-sm font-bold text-yellow-400">{multiplier}x</span>
                </div>
                <div className="mt-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(currentLevel / maxLevel) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}
          </CardFooter>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardContent className="pt-6 pb-6 h-[600px] overflow-y-auto relative">
            {showLightning && <LightningEffect isVisible={true} onComplete={() => setShowLightning(false)} />}
            
            <div className="flex flex-col items-center space-y-2">
              {gameActive || lastBombHit ? renderGrid() : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-center p-8">
                    <h3 className="text-xl font-bold mb-2">How to Play</h3>
                    <p className="text-muted-foreground mb-4">
                      Climb the tower by selecting safe tiles. Avoid bombs! The higher you climb, the bigger your reward.
                    </p>
                    <Button onClick={startGame} disabled={bet <= 0 || user.balance < bet} className="bg-primary hover:bg-primary/90 text-white">
                      Start Game
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tower;
