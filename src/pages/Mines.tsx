
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import MinesSettings from '../components/Mines/MinesSettings';
import { playSound } from '../utils/soundEffects';
import { SOUNDS } from '../utils/soundEffects';
import { showGameResult } from '../components/GameResultNotification';

const GRID_SIZE = 5;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

const Mines: React.FC = () => {
  const [bet, setBet] = useState<number>(10);
  const [mines, setMines] = useState<number>(5);
  const [minePositions, setMinePositions] = useState<number[]>([]);
  const [clickedTiles, setClickedTiles] = useState<number[]>([]);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1);
  const [maxMultiplier, setMaxMultiplier] = useState<number>(1);

  useEffect(() => {
    // Calculate max multiplier based on mines count and grid size
    if (mines > 0 && mines < TOTAL_TILES) {
      // Formula: fair_payout = total_tiles / (total_tiles - mines)
      // We subtract 10% house edge
      const fairPayout = TOTAL_TILES / (TOTAL_TILES - mines);
      const maxPayout = fairPayout * 0.9;
      setMaxMultiplier(parseFloat(maxPayout.toFixed(2)));
    }
  }, [mines]);

  const generateMinePositions = () => {
    const positions: number[] = [];
    while (positions.length < mines) {
      const position = Math.floor(Math.random() * TOTAL_TILES);
      if (!positions.includes(position)) {
        positions.push(position);
      }
    }
    return positions;
  };

  const handleStart = () => {
    if (bet <= 0) return;
    if (mines <= 0 || mines >= TOTAL_TILES) return;

    // Generate new mine positions
    const newMinePositions = generateMinePositions();
    setMinePositions(newMinePositions);
    setClickedTiles([]);
    setIsGameActive(true);
    setCurrentMultiplier(1);
  };

  const calculateNextMultiplier = (safeTilesClicked: number) => {
    const safeSquares = TOTAL_TILES - mines;
    if (safeTilesClicked >= safeSquares) return maxMultiplier;
    
    // Each tile click increases the multiplier following a curve
    // This is a simplified version of provably fair mines game math
    const progress = safeTilesClicked / safeSquares;
    const multiplier = 1 + (maxMultiplier - 1) * progress * (1 + progress);
    return parseFloat(multiplier.toFixed(2));
  };

  const handleTileClick = (index: number) => {
    if (!isGameActive || clickedTiles.includes(index)) return;

    if (minePositions.includes(index)) {
      // Hit a mine - game over
      playSound(SOUNDS.MINE_HIT);
      setClickedTiles([...clickedTiles, index]);
      setIsGameActive(false);
      
      // Show game over notification
      showGameResult({
        success: false,
        message: "You hit a mine!",
        multiplier: currentMultiplier,
        amount: bet
      });
    } else {
      // Safe tile
      playSound(SOUNDS.TILE_CLICK);
      const newClickedTiles = [...clickedTiles, index];
      setClickedTiles(newClickedTiles);
      
      // Calculate new multiplier
      const safeTilesClicked = newClickedTiles.length;
      const newMultiplier = calculateNextMultiplier(safeTilesClicked);
      setCurrentMultiplier(newMultiplier);
      
      // Check if all safe tiles are clicked
      const safeTiles = TOTAL_TILES - mines;
      if (safeTilesClicked >= safeTiles) {
        // All safe tiles are clicked - win the game
        setIsGameActive(false);
        playSound(SOUNDS.CASH_OUT);
        
        // Show win notification
        showGameResult({
          success: true,
          message: "Perfect game!",
          multiplier: newMultiplier,
          amount: bet * newMultiplier
        });
      }
    }
  };

  const handleCashout = () => {
    if (!isGameActive || clickedTiles.length === 0) return;
    
    const winAmount = bet * currentMultiplier;
    setIsGameActive(false);
    playSound(SOUNDS.CASH_OUT);
    
    // Show win notification
    showGameResult({
      success: true,
      message: "Cash Out Successful",
      multiplier: currentMultiplier,
      amount: winAmount
    });
  };

  const renderGrid = () => {
    const grid = [];
    for (let i = 0; i < TOTAL_TILES; i++) {
      const isMine = minePositions.includes(i);
      const isClicked = clickedTiles.includes(i);
      const isRevealed = isClicked || !isGameActive;
      
      grid.push(
        <Button
          key={i}
          variant={isClicked && isMine ? "destructive" : isClicked ? "default" : "outline"}
          className={`aspect-square ${isGameActive ? 'hover:bg-primary/20' : ''}`}
          disabled={isClicked || !isGameActive}
          onClick={() => handleTileClick(i)}
        >
          {isClicked && isMine && "💣"}
          {isClicked && !isMine && "✓"}
          {!isGameActive && isMine && !isClicked && "💣"}
        </Button>
      );
    }
    return grid;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Mines</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Game Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <MinesSettings 
              bet={bet}
              setBet={setBet}
              mines={mines}
              setMines={setMines}
              maxMines={TOTAL_TILES - 1}
              isGameActive={isGameActive}
              handleStart={handleStart}
              handleCashout={handleCashout}
              currentMultiplier={currentMultiplier}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <div className="text-sm text-muted-foreground">
              Max Multiplier: {maxMultiplier.toFixed(2)}x
            </div>
            <div className="text-sm text-muted-foreground">
              Possible Win: {(bet * currentMultiplier).toFixed(2)} gems
            </div>
          </CardFooter>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Game Board</span>
              {isGameActive && (
                <span className="text-lg font-bold text-primary">
                  {currentMultiplier.toFixed(2)}x
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="grid grid-cols-5 gap-2"
              style={{ aspectRatio: '1/1' }}
            >
              {renderGrid()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Mines;
