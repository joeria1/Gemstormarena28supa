
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Slider } from '../components/ui/slider'; 
import { useSound } from '../components/SoundManager';
import { showGameResult } from '../components/GameResultNotification';
import { Users, ArrowRight, TrendingUp, Clock } from 'lucide-react';
import { SOUNDS } from '../utils/soundEffects';
import CaseSlider from '../components/CaseSlider/CaseSlider';

interface Player {
  id: string;
  name: string;
  avatar: string;
  betAmount: number;
  winAmount?: number;
  isReady: boolean;
}

interface Case {
  id: string;
  name: string;
  image: string;
  price: number;
  items: CaseItem[];
}

interface CaseItem {
  id: string;
  name: string;
  image: string;
  value: number;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
}

const CaseBattles: React.FC = () => {
  const [gameState, setGameState] = useState<'waiting' | 'spinning' | 'completed'>('waiting');
  const [betAmount, setBetAmount] = useState<number>(10);
  const [numberOfCases, setNumberOfCases] = useState<number>(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [maxPlayers, setMaxPlayers] = useState<number>(2);
  const [battleId, setBattleId] = useState<string>('');
  const [countdownSeconds, setCountdownSeconds] = useState<number>(5);
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [caseBattleHistory, setCaseBattleHistory] = useState<any[]>([]);
  const { playSound } = useSound();
  const sliderRef = useRef<HTMLDivElement>(null);

  // Sample cases data with properly typed rarities
  const availableCases = [
    {
      id: "case1",
      name: "Starter Case",
      image: "/placeholder.svg",
      price: 10,
      items: [
        { id: "item1", name: "Common Item", image: "/placeholder.svg", value: 5, rarity: "common" as const },
        { id: "item2", name: "Uncommon Item", image: "/placeholder.svg", value: 15, rarity: "uncommon" as const },
        { id: "item3", name: "Rare Item", image: "/placeholder.svg", value: 30, rarity: "rare" as const },
        { id: "item4", name: "Epic Item", image: "/placeholder.svg", value: 50, rarity: "epic" as const },
        { id: "item5", name: "Legendary Item", image: "/placeholder.svg", value: 100, rarity: "legendary" as const }
      ]
    },
    {
      id: "case2",
      name: "Pro Case",
      image: "/placeholder.svg",
      price: 25,
      items: [
        { id: "item6", name: "Pro Common", image: "/placeholder.svg", value: 15, rarity: "common" as const },
        { id: "item7", name: "Pro Uncommon", image: "/placeholder.svg", value: 30, rarity: "uncommon" as const },
        { id: "item8", name: "Pro Rare", image: "/placeholder.svg", value: 60, rarity: "rare" as const },
        { id: "item9", name: "Pro Epic", image: "/placeholder.svg", value: 100, rarity: "epic" as const },
        { id: "item10", name: "Pro Legendary", image: "/placeholder.svg", value: 200, rarity: "legendary" as const }
      ]
    }
  ];

  useEffect(() => {
    // Set default selected case
    if (availableCases.length > 0 && !selectedCase) {
      setSelectedCase(availableCases[0] as Case);
    }
  }, []);

  // Handle countdown and game state
  useEffect(() => {
    if (gameState === 'waiting' && countdownSeconds > 0 && players.length === maxPlayers && players.every(p => p.isReady)) {
      const timer = setTimeout(() => {
        setCountdownSeconds(countdownSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'waiting' && countdownSeconds === 0 && players.length === maxPlayers) {
      startSpinning();
    }
  }, [countdownSeconds, gameState, players, maxPlayers]);

  // Create a battle
  const createBattle = () => {
    if (!selectedCase) return;
    
    const newBattleId = `battle-${Date.now()}`;
    setBattleId(newBattleId);
    setIsCreator(true);
    
    // Add player to the battle
    const newPlayer: Player = {
      id: "user-1",
      name: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=you",
      betAmount: selectedCase.price * numberOfCases,
      isReady: true
    };
    
    setPlayers([newPlayer]);
    playSound('/sounds/deposit.mp3');
    showGameResult({
      success: true,
      message: "Battle created! Waiting for players...",
      amount: selectedCase.price * numberOfCases
    });
  };

  // Join a battle
  const joinBattle = () => {
    if (players.length >= maxPlayers) return;
    
    // Simulate joining as another player
    const newPlayer: Player = {
      id: `user-${players.length + 1}`,
      name: `Player ${players.length + 1}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${players.length + 1}`,
      betAmount: selectedCase ? selectedCase.price * numberOfCases : 10 * numberOfCases,
      isReady: false
    };
    
    setPlayers([...players, newPlayer]);
    
    // Simulate player becoming ready after a short delay
    setTimeout(() => {
      setPlayers(prevPlayers => 
        prevPlayers.map(p => 
          p.id === newPlayer.id ? {...p, isReady: true} : p
        )
      );
    }, 1500);

    playSound('/sounds/button-click.mp3');
  };

  // Start spinning the cases
  const startSpinning = () => {
    setGameState('spinning');
    playSound('/sounds/button-click.mp3');
    
    // Simulate spinning for all players
    setTimeout(() => {
      completeSpinning();
    }, 5000); // 5 seconds to simulate spinning
  };

  // Complete the spinning and determine results
  const completeSpinning = () => {
    if (!selectedCase) return;
    
    const updatedPlayers = players.map(player => {
      // Randomly select an item from the case for each player
      const randomItemIndex = Math.floor(Math.random() * selectedCase.items.length);
      const wonItem = selectedCase.items[randomItemIndex];
      
      return {
        ...player,
        winAmount: wonItem.value * numberOfCases
      };
    });
    
    setPlayers(updatedPlayers);
    setGameState('completed');
    
    // Determine the winner
    const winner = [...updatedPlayers].sort((a, b) => 
      (b.winAmount || 0) - (a.winAmount || 0)
    )[0];
    
    // Show result if the user won
    if (winner.id === "user-1") {
      playSound('/sounds/cashout.mp3');
      showGameResult({
        success: true,
        message: "You won the battle!",
        amount: winner.winAmount || 0
      });
    } else {
      playSound('/sounds/explosion.mp3');
      showGameResult({
        success: false,
        message: `${winner.name} won the battle!`,
        amount: betAmount * numberOfCases
      });
    }
    
    // Update history
    setCaseBattleHistory([
      {
        id: battleId,
        players: updatedPlayers,
        winner: winner.name,
        totalValue: updatedPlayers.reduce((sum, p) => sum + (p.winAmount || 0), 0)
      },
      ...caseBattleHistory.slice(0, 4)
    ]);
    
    // Reset for next game
    setTimeout(() => {
      resetBattle();
    }, 3000);
  };

  // Reset battle
  const resetBattle = () => {
    setGameState('waiting');
    setCountdownSeconds(5);
    setPlayers([]);
    setBattleId('');
    setIsCreator(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Case Battles</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[500px] overflow-hidden">
            <CardHeader className="p-4 bg-gradient-to-r from-black to-purple-900/40">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Case Battle
                  {battleId && <span className="text-xs ml-2 opacity-50">#{battleId}</span>}
                </CardTitle>
                <div className="text-lg font-mono">
                  {gameState === 'waiting' && players.length === maxPlayers && players.every(p => p.isReady) && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{countdownSeconds}s</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0 h-[400px] relative bg-gradient-to-b from-black to-violet-950/20">
              {/* Battle Arena */}
              <div className="absolute inset-0 flex items-center justify-center">
                {gameState === 'waiting' && players.length === 0 && (
                  <div className="text-center p-6">
                    <h3 className="text-xl font-semibold mb-4">Create a Case Battle</h3>
                    <p className="text-muted-foreground mb-4">Choose a case, set the number of cases and create your battle!</p>
                    <div className="flex gap-4 justify-center">
                      {availableCases.map(caseItem => (
                        <div 
                          key={caseItem.id}
                          onClick={() => setSelectedCase(caseItem)}
                          className={`p-2 border rounded-lg cursor-pointer transition-all ${
                            selectedCase?.id === caseItem.id ? 'border-primary bg-primary/20' : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <img src={caseItem.image} alt={caseItem.name} className="w-20 h-20 object-contain mb-2" />
                          <p className="text-sm font-medium">{caseItem.name}</p>
                          <p className="text-xs">${caseItem.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {gameState === 'waiting' && players.length > 0 && (
                  <div className="w-full h-full flex flex-col">
                    <div className="flex-1 flex items-center justify-center">
                      <div className="grid grid-cols-2 gap-8 w-full max-w-2xl px-4">
                        {Array.from({length: maxPlayers}).map((_, i) => {
                          const player = players[i];
                          return (
                            <div 
                              key={i}
                              className={`border rounded-lg p-4 flex flex-col items-center ${
                                player ? 'border-primary/50 bg-primary/5' : 'border-dashed border-muted-foreground/30'
                              }`}
                            >
                              {player ? (
                                <>
                                  <img 
                                    src={player.avatar} 
                                    alt={player.name} 
                                    className="w-16 h-16 rounded-full mb-2" 
                                  />
                                  <h3 className="font-medium">{player.name}</h3>
                                  <p className="text-sm text-muted-foreground mb-1">Bet: ${player.betAmount}</p>
                                  <div className={`px-2 py-1 rounded text-xs ${
                                    player.isReady ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                  }`}>
                                    {player.isReady ? 'Ready' : 'Getting ready...'}
                                  </div>
                                </>
                              ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                                  <Users className="h-8 w-8 mb-2 opacity-50" />
                                  <p>Waiting for player...</p>
                                  {players.length > 0 && !isCreator && (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="mt-2"
                                      onClick={joinBattle}
                                    >
                                      Join Battle
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-black/20 border-t border-border/50 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Battle Details</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedCase?.name} x {numberOfCases} | Total value: ${selectedCase ? selectedCase.price * numberOfCases * players.length : 0}
                        </p>
                      </div>
                      
                      {players.length < maxPlayers && (
                        <Button 
                          variant="outline"
                          onClick={joinBattle}
                        >
                          Join Battle
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                
                {gameState === 'spinning' && (
                  <div className="w-full h-full flex flex-col justify-center">
                    <div className="w-full h-48 flex items-center justify-center">
                      <div className="w-full overflow-hidden" ref={sliderRef}>
                        {selectedCase && (
                          <CaseSlider
                            items={Array(10).fill(null).map((_, i) => ({
                              id: `spin-${i}`,
                              name: selectedCase.items[i % selectedCase.items.length].name,
                              image: selectedCase.items[i % selectedCase.items.length].image,
                              rarity: selectedCase.items[i % selectedCase.items.length].rarity,
                              value: selectedCase.items[i % selectedCase.items.length].value
                            }))}
                            autoSpin={true}
                            spinDuration={4000}
                            caseName={selectedCase.name}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {gameState === 'completed' && (
                  <div className="w-full h-full flex flex-col">
                    <div className="flex-1 flex items-center justify-center p-4">
                      <div className="grid grid-cols-2 gap-8 w-full max-w-2xl">
                        {players.map((player, i) => (
                          <div 
                            key={i}
                            className={`border rounded-lg p-4 flex flex-col items-center ${
                              player.winAmount === Math.max(...players.map(p => p.winAmount || 0)) 
                                ? 'border-green-500 bg-green-500/10'
                                : 'border-primary/50 bg-primary/5'
                            }`}
                          >
                            <img 
                              src={player.avatar} 
                              alt={player.name} 
                              className="w-16 h-16 rounded-full mb-2" 
                            />
                            <h3 className="font-medium">{player.name}</h3>
                            <p className="text-sm text-muted-foreground mb-1">Bet: ${player.betAmount}</p>
                            <div className="mt-2 flex items-center">
                              <span className="text-sm font-mono">Won: </span>
                              <span className={`ml-1 text-lg font-bold ${
                                player.winAmount === Math.max(...players.map(p => p.winAmount || 0))
                                  ? 'text-green-400'
                                  : ''
                              }`}>
                                ${player.winAmount}
                              </span>
                            </div>
                            
                            {player.winAmount === Math.max(...players.map(p => p.winAmount || 0)) && (
                              <div className="mt-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                                WINNER
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="bg-black/40 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 overflow-x-auto w-full">
                <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex gap-2">
                  {caseBattleHistory.map((battle, index) => (
                    <div 
                      key={index} 
                      className="px-2 py-1 rounded text-xs font-mono bg-primary/20"
                    >
                      {battle.winner} won ${battle.totalValue}
                    </div>
                  ))}
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Battle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Select Case</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableCases.map(caseItem => (
                    <div 
                      key={caseItem.id}
                      onClick={() => setSelectedCase(caseItem)}
                      className={`p-2 border rounded-lg cursor-pointer transition-all ${
                        selectedCase?.id === caseItem.id ? 'border-primary bg-primary/20' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <p className="text-sm font-medium">{caseItem.name}</p>
                      <p className="text-xs">${caseItem.price}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-1">Number of Cases: {numberOfCases}</label>
                <Slider
                  defaultValue={[1]}
                  max={5}
                  step={1}
                  value={[numberOfCases]}
                  onValueChange={(val) => setNumberOfCases(val[0])}
                  className="py-4"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Players</label>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setMaxPlayers(prev => Math.max(2, prev - 1))}
                    disabled={maxPlayers <= 2}
                  >
                    -
                  </Button>
                  <div className="flex-1 text-center">{maxPlayers} Players</div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setMaxPlayers(prev => Math.min(4, prev + 1))}
                    disabled={maxPlayers >= 4}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <div className="pt-2">
                {selectedCase && (
                  <div className="text-sm text-muted-foreground mb-4">
                    <p>Total Cost: ${selectedCase.price * numberOfCases}</p>
                    <p>Battle Value: ${selectedCase.price * numberOfCases * maxPlayers}</p>
                  </div>
                )}
                
                <Button 
                  className="w-full" 
                  onClick={createBattle}
                  disabled={players.length > 0 || !selectedCase}
                >
                  Create Battle
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Recent Battles
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {caseBattleHistory.length > 0 ? (
                  caseBattleHistory.map((battle, i) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{battle.id.substring(0, 8)}...</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm mr-1">{battle.players.length} players</span>
                        <ArrowRight className="h-3 w-3 mx-1" />
                        <span className="text-sm font-mono text-green-500">${battle.totalValue}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No battle history yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CaseBattles;
