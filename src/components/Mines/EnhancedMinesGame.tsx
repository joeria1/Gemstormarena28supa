
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface MinesTile {
  id: number;
  revealed: boolean;
  isMine: boolean;
}

interface MinesSettingsProps {
  bet: number;
  setBet: (value: number) => void;
  mines: number;
  setMines: (value: number) => void;
  maxMines: number;
  isGameActive: boolean;
  handleStart: () => void;
  handleCashout: () => void;
  currentMultiplier: number;
}

interface MinesCustomSettingsProps {
  onMineCountChange: (count: number) => void;
  currentMineCount: number;
  maxMines: number;
  isGameActive: boolean;
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
  const presetBets = [10, 25, 50, 100, 250, 500];
  const presetMines = [1, 3, 5, 10, 15, 20];
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Bet Amount</label>
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="number"
            value={bet}
            onChange={(e) => setBet(Math.max(1, Number(e.target.value)))}
            className="w-full p-2 bg-gray-700 rounded text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            min="1"
            disabled={isGameActive}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {presetBets.map((presetBet) => (
            <button
              key={presetBet}
              className="bg-gray-700 text-white py-1 px-2 rounded hover:bg-gray-600 text-sm"
              onClick={() => setBet(presetBet)}
              disabled={isGameActive}
            >
              ${presetBet}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Mines Count</label>
        <input
          type="range"
          min="1"
          max={maxMines}
          value={mines}
          onChange={(e) => setMines(Number(e.target.value))}
          className="w-full"
          disabled={isGameActive}
        />
        <div className="grid grid-cols-6 gap-1 mt-2">
          {presetMines.map((presetMine) => (
            <button
              key={presetMine}
              className={`py-1 px-2 rounded text-sm ${
                mines === presetMine
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => setMines(presetMine)}
              disabled={isGameActive || presetMine > maxMines}
            >
              {presetMine}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2">
        {!isGameActive ? (
          <button
            onClick={handleStart}
            className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-colors"
          >
            Start Game
          </button>
        ) : (
          <button
            onClick={handleCashout}
            className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold transition-colors"
          >
            Cashout (x{currentMultiplier.toFixed(2)})
          </button>
        )}
      </div>
    </div>
  );
};

const MinesCustomSettings: React.FC<MinesCustomSettingsProps> = ({
  onMineCountChange,
  currentMineCount,
  maxMines,
  isGameActive
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm text-gray-400">Quick Select Mines</label>
      <div className="flex flex-wrap gap-2">
        {[5, 10, 15, 20, 24].map((count) => (
          <button
            key={count}
            onClick={() => onMineCountChange(count)}
            disabled={isGameActive || count > maxMines}
            className={`px-3 py-1 rounded text-sm ${
              currentMineCount === count
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {count} Mines
          </button>
        ))}
      </div>
    </div>
  );
};

const EnhancedMinesGame: React.FC = () => {
  const [wager, setWager] = useState<number>(10);
  const [minesCount, setMinesCount] = useState<number>(5);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [tiles, setTiles] = useState<MinesTile[]>([]);
  const [revealedTiles, setRevealedTiles] = useState<number>(0);
  const [balance, setBalance] = useState<number>(1000);
  const [potentialWinnings, setPotentialWinnings] = useState<number>(0);
  const [cashoutAmount, setCashoutAmount] = useState<number>(0);
  const [nextMineProbability, setNextMineProbability] = useState<number | null>(null);

  // Initialize the grid
  useEffect(() => {
    initializeGrid();
  }, []);

  const initializeGrid = () => {
    const newTiles: MinesTile[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      revealed: false,
      isMine: false,
    }));
    setTiles(newTiles);
    setGameStarted(false);
    setRevealedTiles(0);
    setPotentialWinnings(0);
    setCashoutAmount(0);
    setNextMineProbability(null);
  };

  const startGame = () => {
    if (wager <= 0) {
      toast.error("Wager must be greater than 0");
      return;
    }

    if (wager > balance) {
      toast.error("Insufficient balance");
      return;
    }

    if (minesCount <= 0 || minesCount >= 24) {
      toast.error("Invalid mines count");
      return;
    }

    // Subtract wager from balance
    setBalance((prev) => prev - wager);

    // Reset the grid and initialize mines
    const newTiles = [...tiles.map(tile => ({ ...tile, revealed: false, isMine: false }))];
    
    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < minesCount) {
      const randomIndex = Math.floor(Math.random() * 25);
      if (!newTiles[randomIndex].isMine) {
        newTiles[randomIndex].isMine = true;
        minesPlaced++;
      }
    }

    setTiles(newTiles);
    setGameStarted(true);
    setRevealedTiles(0);
    setPotentialWinnings(wager);
    calculateNextMineProbability(newTiles, 0);
  };

  const calculateNextMineProbability = (currentTiles: MinesTile[], revealed: number) => {
    const totalTiles = 25;
    const unrevealed = totalTiles - revealed;
    const remainingMines = minesCount - currentTiles.filter(tile => tile.revealed && tile.isMine).length;
    
    if (unrevealed === 0) {
      setNextMineProbability(null);
      return;
    }
    
    const probability = (remainingMines / unrevealed) * 100;
    setNextMineProbability(Number(probability.toFixed(2)));
  };

  const revealTile = (tileId: number) => {
    if (!gameStarted) return;

    const tileIndex = tiles.findIndex((t) => t.id === tileId);
    if (tileIndex === -1 || tiles[tileIndex].revealed) return;

    const updatedTiles = [...tiles];
    const clickedTile = updatedTiles[tileIndex];
    clickedTile.revealed = true;

    if (clickedTile.isMine) {
      // Game over - hit a mine
      setGameStarted(false);
      setTiles(updatedTiles);
      toast.error("BOOM! You hit a mine!");
      
      // Reveal all mines
      setTimeout(() => {
        setTiles((prev) =>
          prev.map((tile) => ({
            ...tile,
            revealed: tile.isMine ? true : tile.revealed,
          }))
        );
      }, 500);
      
      return;
    }

    // Successful click - update game state
    const newRevealedCount = revealedTiles + 1;
    setRevealedTiles(newRevealedCount);
    
    // Calculate new potential winnings
    const multiplier = calculateMultiplier(minesCount, newRevealedCount);
    const newPotentialWinnings = Number((wager * multiplier).toFixed(2));
    setPotentialWinnings(newPotentialWinnings);
    setCashoutAmount(newPotentialWinnings);
    
    setTiles(updatedTiles);
    
    // Calculate next mine probability
    calculateNextMineProbability(updatedTiles, newRevealedCount);

    // Check if all non-mine tiles are revealed
    const totalNonMineTiles = 25 - minesCount;
    if (newRevealedCount === totalNonMineTiles) {
      cashout();
      toast.success("Perfect game! All safe tiles revealed!");
    }
  };

  const calculateMultiplier = (mines: number, revealed: number): number => {
    // Basic multiplier calculation
    const totalTiles = 25;
    const baseFactor = 0.97; // House edge factor
    let multiplier = 1;
    
    for (let i = 0; i < revealed; i++) {
      multiplier *= (totalTiles - mines - i) / (totalTiles - i);
    }
    
    return Number((1 / (multiplier * baseFactor)).toFixed(2));
  };

  const cashout = () => {
    if (!gameStarted || revealedTiles === 0) return;
    
    setBalance((prev) => prev + cashoutAmount);
    setGameStarted(false);
    toast.success(`Cashed out $${cashoutAmount.toFixed(2)}!`);
  };

  const handleWagerChange = (amount: number) => {
    setWager(amount);
  };

  const handleMinesCountChange = (count: number) => {
    setMinesCount(count);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Mines</h1>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left side - Controls */}
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4">Game Settings</h2>
              <div className="flex justify-between mb-2">
                <span>Balance:</span>
                <span className="font-bold">${balance.toFixed(2)}</span>
              </div>
              {gameStarted && (
                <>
                  <div className="flex justify-between mb-2">
                    <span>Potential Win:</span>
                    <span className="font-bold text-green-500">${potentialWinnings.toFixed(2)}</span>
                  </div>
                  {nextMineProbability !== null && (
                    <div className="flex justify-between mb-2">
                      <span>Safety for Next Tile:</span>
                      <span className={`font-bold ${nextMineProbability > 50 ? 'text-red-500' : nextMineProbability > 25 ? 'text-yellow-500' : 'text-green-500'}`}>
                        {nextMineProbability}% risk
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <MinesSettings 
              bet={wager}
              setBet={setWager}
              mines={minesCount}
              setMines={setMinesCount}
              maxMines={24}
              isGameActive={gameStarted}
              handleStart={startGame}
              handleCashout={cashout}
              currentMultiplier={calculateMultiplier(minesCount, revealedTiles)}
            />
            
            <div className="mt-6">
              <MinesCustomSettings 
                onMineCountChange={handleMinesCountChange}
                currentMineCount={minesCount}
                maxMines={24}
                isGameActive={gameStarted}
              />
            </div>
            
            <div className="mt-6 space-y-3">
              {!gameStarted ? (
                <button
                  onClick={startGame}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition"
                >
                  Start Game
                </button>
              ) : (
                <button
                  onClick={cashout}
                  className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold transition"
                >
                  Cashout ${cashoutAmount.toFixed(2)}
                </button>
              )}
              
              <button
                onClick={initializeGrid}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                disabled={!gameStarted}
              >
                Reset
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Stats</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Revealed Tiles:</span>
                <span>{revealedTiles} / {25 - minesCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Mines:</span>
                <span>{minesCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Multiplier:</span>
                <span>
                  {revealedTiles > 0
                    ? `x${calculateMultiplier(minesCount, revealedTiles).toFixed(2)}`
                    : "x1.00"}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Game Grid */}
        <div className="lg:w-2/3 bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="grid grid-cols-5 gap-3">
            {tiles.map((tile) => (
              <button
                key={tile.id}
                onClick={() => revealTile(tile.id)}
                disabled={!gameStarted || tile.revealed}
                className={`aspect-square flex items-center justify-center rounded-lg text-xl font-bold transition transform hover:scale-105 ${
                  !tile.revealed
                    ? "bg-gray-700 hover:bg-gray-600 cursor-pointer"
                    : tile.isMine
                    ? "bg-red-600"
                    : "bg-green-600"
                }`}
              >
                {tile.revealed ? (
                  tile.isMine ? (
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      />
                    </svg>
                  )
                ) : (
                  <span className="opacity-0">?</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMinesGame;
