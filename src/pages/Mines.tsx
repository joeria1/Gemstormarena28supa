
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { useSound } from '@/components/SoundManager';
import {
  AlertCircle,
  ArrowLeftRight,
  Bomb,
  ChevronRight,
  Gem,
  Loader2,
  RefreshCw,
} from "lucide-react";

// Number of rows and columns in the grid
const ROWS = 5;
const COLS = 5;

// Difficulty levels
const DIFFICULTY_LEVELS = [
  { name: "Easy", mineCount: 3, multiplier: 1.5 },
  { name: "Medium", mineCount: 5, multiplier: 2 },
  { name: "Hard", mineCount: 8, multiplier: 3 },
  { name: "Extreme", mineCount: 12, multiplier: 5 },
];

const Mines = () => {
  const { user, updateBalance } = useUser();
  const { playSound } = useSound();
  const [betAmount, setBetAmount] = useState(100);
  const [difficultyIndex, setDifficultyIndex] = useState(0);
  const [grid, setGrid] = useState<Array<Array<number>>>([]); // 0: hidden, 1: gem, 2: mine
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [minePositions, setMinePositions] = useState<Array<[number, number]>>([]);

  // Initialize the grid
  useEffect(() => {
    resetGrid();
  }, [difficultyIndex]);

  // Reset the grid to initial state
  const resetGrid = () => {
    const newGrid = Array(ROWS).fill(0).map(() => Array(COLS).fill(0));
    setGrid(newGrid);
    setGameActive(false);
    setGameOver(false);
    setWinAmount(0);
    setRevealedCount(0);
    setMinePositions([]);
  };

  // Start a new game
  const startGame = () => {
    if (!user) {
      toast.error("Please login to play");
      return;
    }

    if (user.balance < betAmount) {
      toast.error("Insufficient balance");
      return;
    }

    playSound('https://assets.mixkit.co/sfx/preview/mixkit-interface-click-1126.mp3');
    setLoading(true);

    // Deduct bet amount from balance
    updateBalance(-betAmount);

    // Generate mine positions
    const mines: Array<[number, number]> = [];
    const difficulty = DIFFICULTY_LEVELS[difficultyIndex];
    const totalMines = difficulty.mineCount;

    while (mines.length < totalMines) {
      const row = Math.floor(Math.random() * ROWS);
      const col = Math.floor(Math.random() * COLS);
      const positionExists = mines.some(([r, c]) => r === row && c === col);

      if (!positionExists) {
        mines.push([row, col]);
      }
    }

    setMinePositions(mines);
    setGameActive(true);
    setWinAmount(betAmount);

    setTimeout(() => {
      setLoading(false);
      playSound('https://assets.mixkit.co/sfx/preview/mixkit-game-level-music-689.mp3', 0.2);
    }, 500);
  };

  // Handle tile click
  const handleTileClick = (row: number, col: number) => {
    if (!gameActive || gameOver || grid[row][col] !== 0) return;

    playSound('https://assets.mixkit.co/sfx/preview/mixkit-interface-click-1126.mp3');

    const isMine = minePositions.some(([r, c]) => r === row && c === col);
    const newGrid = [...grid];

    if (isMine) {
      // Hit a mine
      playSound('https://assets.mixkit.co/sfx/preview/mixkit-explosion-impact-1699.mp3');
      newGrid[row][col] = 2; // Mark as mine
      setGrid(newGrid);
      setGameOver(true);

      // Reveal all mines
      setTimeout(() => {
        const finalGrid = [...newGrid];
        minePositions.forEach(([r, c]) => {
          finalGrid[r][c] = 2;
        });
        setGrid(finalGrid);
        toast.error("Game Over! You hit a mine.");
      }, 500);
    } else {
      // Found a gem
      playSound('https://assets.mixkit.co/sfx/preview/mixkit-bonus-earned-in-video-game-2058.mp3');
      newGrid[row][col] = 1; // Mark as gem
      setGrid(newGrid);

      const difficulty = DIFFICULTY_LEVELS[difficultyIndex];
      const newWinAmount = Math.floor(winAmount * (1 + 0.1 * difficulty.multiplier));
      setWinAmount(newWinAmount);

      const newRevealedCount = revealedCount + 1;
      setRevealedCount(newRevealedCount);

      // Check if all non-mine tiles are revealed
      const totalSafeTiles = ROWS * COLS - difficulty.mineCount;
      if (newRevealedCount === totalSafeTiles) {
        setGameOver(true);
        updateBalance(newWinAmount);
        toast.success(`Congratulations! You won ${newWinAmount} gems!`);
      }
    }
  };

  // Cash out current winnings
  const cashOut = () => {
    if (!gameActive || gameOver) return;

    playSound('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
    updateBalance(winAmount);
    setGameOver(true);
    toast.success(`You cashed out ${winAmount} gems!`);

    // Reveal all mines
    const finalGrid = [...grid];
    minePositions.forEach(([r, c]) => {
      if (finalGrid[r][c] === 0) {
        finalGrid[r][c] = 2;
      }
    });
    setGrid(finalGrid);
  };

  // Calculate win probability
  const getWinProbability = () => {
    if (!gameActive) return 100;
    const difficulty = DIFFICULTY_LEVELS[difficultyIndex];
    const totalTiles = ROWS * COLS;
    const remainingTiles = totalTiles - revealedCount;
    const remainingMines = difficulty.mineCount;
    return Math.round(((remainingTiles - remainingMines) / remainingTiles) * 100);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#4066FF] to-primary bg-clip-text text-transparent">
            DUMP.FUN Mines
          </h1>
          <p className="text-muted-foreground mt-2">
            Uncover gems while avoiding mines to multiply your bet!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Game controls */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-black/40 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
              <h2 className="text-xl font-semibold mb-4">Game Settings</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Bet Amount: {betAmount} gems
                  </label>
                  <Slider
                    disabled={gameActive}
                    value={[betAmount]}
                    min={10}
                    max={1000}
                    step={10}
                    onValueChange={(value) => setBetAmount(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Difficulty
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {DIFFICULTY_LEVELS.map((level, index) => (
                      <Button
                        key={level.name}
                        variant={difficultyIndex === index ? "default" : "outline"}
                        onClick={() => setDifficultyIndex(index)}
                        disabled={gameActive}
                        className={`text-xs py-1 h-auto ${difficultyIndex === index ? 'bg-primary' : 'bg-black/50'}`}
                      >
                        {level.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Mines:</span>
                  <span className="font-semibold">
                    {DIFFICULTY_LEVELS[difficultyIndex].mineCount}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Max Multiplier:</span>
                  <span className="font-semibold">
                    {DIFFICULTY_LEVELS[difficultyIndex].multiplier}x
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Your Balance:</span>
                  <span className="flex items-center">
                    <Gem className="h-4 w-4 text-gem mr-1" />
                    <span className="font-semibold">{user?.balance || 0}</span>
                  </span>
                </div>

                <Button
                  onClick={gameActive ? resetGrid : startGame}
                  disabled={loading || (!gameActive && (!user || user.balance < betAmount))}
                  className="w-full btn-primary"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : gameActive ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      New Game
                    </>
                  ) : (
                    "Start Game"
                  )}
                </Button>
              </div>
            </div>

            {gameActive && (
              <div className="bg-black/40 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-4">Game Stats</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Current Win:</span>
                    <span className="flex items-center text-xl font-bold">
                      <Gem className="h-5 w-5 text-gem mr-1" />
                      {winAmount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Multiplier:</span>
                    <span className="font-semibold text-green-400">
                      {(winAmount / betAmount).toFixed(2)}x
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Next Tile Safety:
                    </span>
                    <span className="font-semibold">
                      {getWinProbability()}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Gems Found:</span>
                    <span className="font-semibold">{revealedCount}</span>
                  </div>

                  <Button
                    onClick={cashOut}
                    disabled={gameOver}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Cash Out
                    <ArrowLeftRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Game grid */}
          <div className="md:col-span-2">
            <div className="bg-black/40 border border-white/10 p-6 rounded-xl backdrop-blur-sm">
              <div className="grid grid-cols-5 gap-2 mb-4">
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        aspect-square rounded-md flex items-center justify-center transition-all
                        ${
                          cell === 0
                            ? "bg-black/50 hover:bg-black/70 border border-white/10"
                            : cell === 1
                            ? "bg-gradient-to-b from-green-500/80 to-green-600/80 border border-green-400"
                            : "bg-gradient-to-b from-red-500/80 to-red-600/80 border border-red-400"
                        }
                        ${
                          gameActive && !gameOver && cell === 0
                            ? "cursor-pointer"
                            : "cursor-default"
                        }
                      `}
                      onClick={() => handleTileClick(rowIndex, colIndex)}
                      disabled={!gameActive || gameOver || cell !== 0}
                    >
                      {cell === 1 ? (
                        <Gem className="h-6 w-6 text-white" />
                      ) : cell === 2 ? (
                        <Bomb className="h-6 w-6 text-white" />
                      ) : null}
                    </button>
                  ))
                )}
              </div>

              {!gameActive && !gameOver && (
                <div className="text-center p-4 border border-dashed border-white/20 rounded-lg">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-primary/60" />
                  <h3 className="text-lg font-medium mb-1">How to Play</h3>
                  <p className="text-sm text-muted-foreground">
                    Set your bet amount and difficulty, then click "Start Game".
                    Uncover gems to increase your winnings, but be careful of
                    mines! Cash out anytime to secure your winnings.
                  </p>
                </div>
              )}

              {gameOver && (
                <div
                  className={`text-center p-4 border border-dashed rounded-lg ${
                    winAmount > betAmount
                      ? "border-green-500/40"
                      : "border-red-500/40"
                  }`}
                >
                  <h3 className="text-lg font-medium mb-2">Game Over</h3>
                  {winAmount > betAmount ? (
                    <p className="text-green-400">
                      Congratulations! You won {winAmount} gems!
                    </p>
                  ) : (
                    <p className="text-red-400">
                      Better luck next time! You lost {betAmount} gems.
                    </p>
                  )}
                  <Button
                    onClick={resetGrid}
                    className="mt-2"
                    variant="outline"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Play Again
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mines;
