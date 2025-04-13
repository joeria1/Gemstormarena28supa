
import React, { useState, useEffect } from 'react';
import MinesSettings from '@/components/Mines/MinesSettings';
import MinesCustomSettings from '@/components/Mines/MinesCustomSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Bomb, Gift, Gem } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import ChatWindow from '@/components/Chat/ChatWindow';
import { playButtonSound } from '@/utils/sounds';

// Types
type TileState = 'hidden' | 'gem' | 'bomb';

interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  totalWinnings: number;
  highestWin: number;
}

const MAX_TILES = 25;

const Mines: React.FC = () => {
  const { toast } = useToast();
  const { user, updateBalance } = useUser();
  
  // State
  const [betAmount, setBetAmount] = useState<number>(10);
  const [tiles, setTiles] = useState<TileState[]>(Array(MAX_TILES).fill('hidden'));
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [mineCount, setMineCount] = useState<number>(5);
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1);
  const [currentWinnings, setCurrentWinnings] = useState<number>(0);
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    totalWinnings: 0,
    highestWin: 0
  });
  
  // Settings tab
  const [settingsTab, setSettingsTab] = useState("preset");

  // Calculate max mines allowed (5-24)
  const maxMinesAllowed = MAX_TILES - 1;
  
  // Effect to initialize stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('minesStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);
  
  // Save stats to localStorage when they change
  useEffect(() => {
    localStorage.setItem('minesStats', JSON.stringify(stats));
  }, [stats]);
  
  // Start a new game
  const startGame = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to play Mines",
        variant: "destructive"
      });
      return;
    }
    
    if (betAmount <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please enter a valid bet amount",
        variant: "destructive"
      });
      return;
    }
    
    if (betAmount > (user?.balance || 0)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough gems to place this bet",
        variant: "destructive"
      });
      return;
    }
    
    // Deduct bet amount
    updateBalance(-betAmount);
    
    // Initialize new game
    const newTiles = Array(MAX_TILES).fill('hidden');
    setTiles(newTiles);
    setGameActive(true);
    setRevealedCount(0);
    setCurrentMultiplier(1);
    setCurrentWinnings(0);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1
    }));
    
    // Play sound
    playButtonSound();
    
    toast({
      title: "Game Started",
      description: `Placed a bet of ${betAmount} gems. Good luck!`,
    });
  };
  
  // Place mines on the first click
  const placeMines = (clickedIndex: number) => {
    const newTiles = [...tiles];
    
    // Make sure clickedIndex doesn't get a mine
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
      const randIndex = Math.floor(Math.random() * MAX_TILES);
      if (randIndex !== clickedIndex && newTiles[randIndex] !== 'bomb') {
        newTiles[randIndex] = 'bomb';
        minesPlaced++;
      }
    }
    
    // All other tiles are gems
    for (let i = 0; i < MAX_TILES; i++) {
      if (newTiles[i] === 'hidden') {
        newTiles[i] = 'gem';
      }
    }
    
    return newTiles;
  };
  
  // Handle tile click
  const handleTileClick = (index: number) => {
    if (!gameActive) return;
    
    let newTiles = [...tiles];
    const isFirstClick = revealedCount === 0;
    
    // If this is the first click, place mines after user clicks
    if (isFirstClick) {
      newTiles = placeMines(index);
    }
    
    // Check if tile is already revealed
    if (newTiles[index] !== 'hidden') {
      // This tile's state is already determined (but still visually hidden from user)
      if (newTiles[index] === 'bomb') {
        // Game over - hit a mine
        setGameActive(false);
        
        // Reveal all tiles
        const revealedTiles = newTiles.map(tile => tile);
        setTiles(revealedTiles);
        
        toast({
          title: "Boom! Game Over",
          description: `You hit a mine and lost ${betAmount} gems`,
          variant: "destructive"
        });
        
        return;
      } else if (newTiles[index] === 'gem') {
        // Reveal this gem
        const visiblyRevealedTiles = [...newTiles];
        
        // Mark visibly as revealed to user
        visiblyRevealedTiles[index] = 'gem';
        setTiles(visiblyRevealedTiles);
        
        // Increment revealed count
        setRevealedCount(prev => prev + 1);
        
        // Calculate new multiplier based on revealed gems
        const newMultiplier = calculateMultiplier(revealedCount + 1);
        setCurrentMultiplier(newMultiplier);
        
        // Calculate current potential winnings
        const winnings = Math.floor(betAmount * newMultiplier);
        setCurrentWinnings(winnings);
        
        // Check if all non-mine tiles are revealed
        const totalGems = MAX_TILES - mineCount;
        if (revealedCount + 1 === totalGems) {
          // Player won by revealing all gems!
          setGameActive(false);
          
          // Award winnings
          updateBalance(winnings);
          
          // Update stats
          setStats(prev => ({
            ...prev,
            gamesWon: prev.gamesWon + 1,
            totalWinnings: prev.totalWinnings + winnings,
            highestWin: Math.max(prev.highestWin, winnings)
          }));
          
          toast({
            title: "Amazing! Perfect Game!",
            description: `You revealed all gems and won ${winnings} gems!`,
          });
        }
      }
    }
  };
  
  // Calculate multiplier based on gems revealed and mine count
  const calculateMultiplier = (gemsRevealed: number) => {
    if (gemsRevealed === 0) return 1;
    
    // This is a simplified formula - in real games these would be precisely calculated
    const baseMultiplier = 0.1 * mineCount + 1;
    return parseFloat((baseMultiplier * (1 + gemsRevealed * 0.05)).toFixed(2));
  };
  
  // Cash out current winnings
  const cashOut = () => {
    if (!gameActive || revealedCount === 0) return;
    
    const winnings = currentWinnings;
    
    // Update balance
    updateBalance(winnings);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      gamesWon: prev.gamesWon + 1,
      totalWinnings: prev.totalWinnings + winnings,
      highestWin: Math.max(prev.highestWin, winnings)
    }));
    
    // End game and reveal mines
    setGameActive(false);
    
    // Reveal just the bombs
    const revealedTiles = [...tiles];
    for (let i = 0; i < revealedTiles.length; i++) {
      if (revealedTiles[i] === 'bomb') {
        // Make bombs visible
        revealedTiles[i] = 'bomb';
      }
    }
    setTiles(revealedTiles);
    
    toast({
      title: "Cashed Out!",
      description: `You won ${winnings} gems!`,
    });
  };
  
  // Handle bet amount change
  const handleBetChange = (amount: number) => {
    if (gameActive) return;
    setBetAmount(amount);
  };
  
  // Handle mine count change from preset
  const handleMineCountChange = (count: number) => {
    if (gameActive) return;
    
    if (count >= 1 && count <= maxMinesAllowed) {
      setMineCount(count);
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Mines
          </h1>
          <p className="text-muted-foreground mt-2">
            Find the gems while avoiding the mines to increase your multiplier
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="col-span-1 bg-blue-900/20 rounded-lg p-4 border border-blue-900/40">
                    <div className="text-sm text-muted-foreground mb-1">Current Bet</div>
                    <div className="text-2xl font-bold flex items-center">
                      <Gem className="h-5 w-5 text-cyan-400 mr-2" />
                      {betAmount}
                    </div>
                  </div>
                  
                  <div className="col-span-1 bg-purple-900/20 rounded-lg p-4 border border-purple-900/40">
                    <div className="text-sm text-muted-foreground mb-1">Current Multiplier</div>
                    <div className="text-2xl font-bold">{currentMultiplier}x</div>
                  </div>
                  
                  <div className="col-span-1 bg-green-900/20 rounded-lg p-4 border border-green-900/40">
                    <div className="text-sm text-muted-foreground mb-1">Potential Win</div>
                    <div className="text-2xl font-bold flex items-center">
                      <Gem className="h-5 w-5 text-cyan-400 mr-2" />
                      {currentWinnings}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {tiles.map((tile, index) => (
                    <button
                      key={index}
                      onClick={() => handleTileClick(index)}
                      disabled={!gameActive || tile !== 'hidden'}
                      className={`aspect-square rounded-lg border ${
                        tile === 'hidden'
                          ? 'bg-black/30 border-white/20 hover:bg-black/40 hover:border-white/30'
                          : tile === 'gem'
                            ? 'bg-green-900/30 border-green-500 text-green-400'
                            : 'bg-red-900/30 border-red-500 text-red-400'
                      } flex items-center justify-center transition-all`}
                    >
                      {tile === 'hidden' ? (
                        <span className="text-2xl">?</span>
                      ) : tile === 'gem' ? (
                        <Gem className="h-6 w-6" />
                      ) : (
                        <Bomb className="h-6 w-6" />
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-4">
                  {!gameActive ? (
                    <Button 
                      className="flex-1 btn-primary"
                      onClick={startGame}
                      disabled={!user || betAmount <= 0 || (user && betAmount > user.balance)}
                    >
                      Start Game
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={cashOut}
                      disabled={revealedCount === 0}
                    >
                      Cash Out ({currentWinnings})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Game Settings</h3>
                  
                  <Tabs value={settingsTab} onValueChange={setSettingsTab}>
                    <TabsList className="grid grid-cols-2 mb-4">
                      <TabsTrigger value="preset">Preset Mines</TabsTrigger>
                      <TabsTrigger value="custom">Custom Mines</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="preset">
                      <MinesSettings 
                        onBetChange={handleBetChange} 
                        onMineCountChange={handleMineCountChange}
                        currentBet={betAmount}
                        currentMineCount={mineCount}
                        isGameActive={gameActive}
                      />
                    </TabsContent>
                    
                    <TabsContent value="custom">
                      <MinesCustomSettings 
                        onMineCountChange={handleMineCountChange}
                        currentMineCount={mineCount}
                        maxMines={maxMinesAllowed}
                        isGameActive={gameActive}
                      />
                      
                      <Separator className="my-4" />
                      
                      <MinesSettings 
                        onBetChange={handleBetChange} 
                        onMineCountChange={handleMineCountChange}
                        currentBet={betAmount}
                        currentMineCount={mineCount}
                        isGameActive={gameActive}
                        hideMineButtons={true}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Stats</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Games Played</span>
                      <span className="font-medium">{stats.gamesPlayed}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Games Won</span>
                      <span className="font-medium">{stats.gamesWon}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Win Rate</span>
                      <span className="font-medium">
                        {stats.gamesPlayed > 0 
                          ? `${Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%` 
                          : '0%'}
                      </span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Winnings</span>
                      <span className="font-medium flex items-center">
                        <Gem className="h-4 w-4 text-cyan-400 mr-1" />
                        {stats.totalWinnings}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Highest Win</span>
                      <span className="font-medium flex items-center">
                        <Gem className="h-4 w-4 text-cyan-400 mr-1" />
                        {stats.highestWin}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="col-span-1">
            <ChatWindow className="h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mines;
