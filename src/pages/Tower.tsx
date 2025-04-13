
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { SOUNDS, playSound } from '../utils/soundEffects';
import { showGameResult } from '../components/GameResultNotification';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useSound } from '../components/SoundManager';

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
  const { playSound } = useSound();

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
    
    // Deduct bet from user's balance (implement actual balance logic)
    setGameActive(true);
    setCurrentLevel(0);
    setMultiplier(1);
    setLastBombHit(null);
    generateTower();
    playSound('/sounds/button-click.mp3');
  };
  
  const handleTileClick = (tileIndex: number) => {
    if (!gameActive) return;
    
    const currentTowerLevel = tower[currentLevel];
    
    // Check if already clicked
    if (currentTowerLevel.clicked.includes(tileIndex)) return;
    
    // Update clicked tiles
    const updatedTower = [...tower];
    updatedTower[currentLevel] = {
      ...currentTowerLevel,
      clicked: [...currentTowerLevel.clicked, tileIndex]
    };
    
    setTower(updatedTower);
    
    // Check if bomb hit
    if (currentTowerLevel.bombs.includes(tileIndex)) {
      // Game over
      playSound('/sounds/wrong.mp3');
      setLastBombHit({ level: currentLevel, tileIndex });
      
      showGameResult({
        success: false,
        message: "You hit a bomb!",
        multiplier: multiplier,
        amount: bet
      });
      setGameActive(false);
    } else {
      // Safe tile
      playSound('/sounds/correct.mp3');
      
      // In Easy mode, proceed to the next level after hitting ANY safe tile
      if (difficulty === DifficultyLevel.EASY) {
        // Level completed
        if (currentLevel + 1 >= maxLevel) {
          // Game won
          const finalMultiplier = calculateMultiplier(currentLevel + 1);
          playSound('/sounds/big-win.mp3');
          showGameResult({
            success: true,
            message: "Tower conquered!",
            multiplier: finalMultiplier,
            amount: bet * finalMultiplier
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
          [...currentTowerLevel.clicked, tileIndex].includes(safeIndex)
        );
        
        if (allSafeClicked) {
          // Level completed
          if (currentLevel + 1 >= maxLevel) {
            // Game won
            const finalMultiplier = calculateMultiplier(currentLevel + 1);
            playSound('/sounds/big-win.mp3');
            showGameResult({
              success: true,
              message: "Tower conquered!",
              multiplier: finalMultiplier,
              amount: bet * finalMultiplier
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

  const calculateMultiplier = (level: number): number => {
    const baseMultiplier = difficulty === DifficultyLevel.EASY ? 1.3 : 
                           difficulty === DifficultyLevel.MEDIUM ? 1.8 : 2.2;
    return parseFloat((Math.pow(baseMultiplier, level)).toFixed(2));
  };
  
  const cashOut = () => {
    if (!gameActive || currentLevel === 0) return;
    
    const winAmount = bet * multiplier;
    playSound('/sounds/cashout.mp3');
    showGameResult({
      success: true,
      message: `Cashed out at level ${currentLevel + 1}!`,
      multiplier: multiplier,
      amount: winAmount
    });
    setGameActive(false);
    // Add winnings to user's balance (implement actual balance logic)
  };
  
  const renderTower = () => {
    return tower.map((level, levelIndex) => {
      const isCurrentLevel = levelIndex === currentLevel;
      const isPastLevel = levelIndex < currentLevel;
      const isDisabled = !isCurrentLevel || !gameActive;
      const isGameOver = lastBombHit && !gameActive;
      
      return (
        <div 
          key={`level-${levelIndex}`}
          className={`flex justify-center space-x-2 my-2 transition-all ${
            isCurrentLevel ? 'scale-100 opacity-100' : 
            isPastLevel ? 'scale-90 opacity-70' : 
            'scale-90 opacity-50'
          }`}
        >
          <div className="flex-shrink-0 w-10 text-right font-bold">
            {maxLevel - levelIndex}
          </div>
          <div className="flex justify-center space-x-2">
            {Array.from({ length: totalTiles }).map((_, tileIndex) => {
              const isClicked = level.clicked.includes(tileIndex);
              const isBomb = level.bombs.includes(tileIndex);
              const isSafe = level.safe.includes(tileIndex);
              const isLastBombHit = isGameOver && lastBombHit?.level === levelIndex && lastBombHit?.tileIndex === tileIndex;
              
              return (
                <Button 
                  key={`tile-${levelIndex}-${tileIndex}`}
                  disabled={isDisabled || isClicked}
                  onClick={() => handleTileClick(tileIndex)}
                  variant={isPastLevel ? "default" : "outline"}
                  className={`w-12 h-12 ${
                    isLastBombHit ? 'bg-red-500 hover:bg-red-600 border-white border-2 animate-pulse' :
                    isPastLevel && isBomb ? 'bg-red-500 hover:bg-red-600' :
                    isPastLevel && isSafe ? 'bg-green-500 hover:bg-green-600' :
                    isClicked && isBomb ? 'bg-red-500 hover:bg-red-600' :
                    isClicked && isSafe ? 'bg-green-500 hover:bg-green-600' :
                    'bg-muted hover:bg-muted/70'
                  }`}
                >
                  {(isPastLevel || isLastBombHit) && isBomb && '💣'}
                  {isPastLevel && isSafe && '✓'}
                  {isCurrentLevel && isClicked && isBomb && '💣'}
                  {isCurrentLevel && isClicked && isSafe && '✓'}
                </Button>
              );
            })}
          </div>
        </div>
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
                  className="flex-1"
                  onClick={startGame}
                  disabled={gameActive || bet <= 0}
                >
                  Start
                </Button>
                <Button 
                  className="flex-1"
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
            <div className="w-full bg-muted rounded-md p-2">
              <div className="text-sm font-medium">Difficulty Info</div>
              <div className="text-xs text-muted-foreground">
                <p>Easy: 1 bomb, 2 safe spots (only 1 needed)</p>
                <p>Medium: 1 bomb, 1 safe spot</p>
                <p>Hard: 2 bombs, 1 safe spot</p>
              </div>
            </div>
          </CardFooter>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardContent className="pt-6 pb-6 h-[600px] overflow-y-auto">
            <div className="flex flex-col items-center space-y-2">
              {gameActive || lastBombHit ? renderTower() : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-center p-8">
                    <h3 className="text-xl font-bold mb-2">How to Play</h3>
                    <p className="text-muted-foreground mb-4">
                      Climb the tower by selecting safe tiles. Avoid bombs! The higher you climb, the bigger your reward.
                    </p>
                    <Button onClick={startGame} disabled={bet <= 0}>
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
