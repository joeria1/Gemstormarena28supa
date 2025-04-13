
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useSound } from '../components/SoundManager';
import { showGameResult } from '../components/GameResultNotification';
import { Rocket, TrendingUp, Clock, ArrowRight, Users } from 'lucide-react';

interface Player {
  name: string;
  avatar: string;
  betAmount: number;
  cashoutAt: number | null;
}

const Crash: React.FC = () => {
  const [gameState, setGameState] = useState<'waiting' | 'running' | 'crashed'>('waiting');
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [autoCashout, setAutoCashout] = useState<number | null>(null);
  const [hasBet, setHasBet] = useState<boolean>(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(5);
  const [players, setPlayers] = useState<Player[]>([]);
  const [hasUserCashedOut, setHasUserCashedOut] = useState<boolean>(false);
  const [lastCrashPoint, setLastCrashPoint] = useState<number>(0);
  const [crashHistory, setCrashHistory] = useState<number[]>([2.31, 1.42, 5.37, 1.11, 1.98, 3.25]);
  const animationFrameId = useRef<number | null>(null);
  const { playSound } = useSound();

  // Generate random crash point between 1 and 10, with probabilities skewed toward lower values
  const generateCrashPoint = (): number => {
    const random = Math.random();
    // Higher chance of crashing early
    const crashPoint = 1 + Math.pow(random, 2) * 9;
    return parseFloat(crashPoint.toFixed(2));
  };

  // Create simulated players
  useEffect(() => {
    if (gameState === 'waiting') {
      const simulatedPlayers: Player[] = [
        {
          name: 'CryptoKing',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
          betAmount: Math.floor(Math.random() * 1000) + 100,
          cashoutAt: null
        },
        {
          name: 'LuckyGamer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
          betAmount: Math.floor(Math.random() * 500) + 50,
          cashoutAt: null
        },
        {
          name: 'RocketRider',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
          betAmount: Math.floor(Math.random() * 200) + 10,
          cashoutAt: null
        }
      ];
      setPlayers(simulatedPlayers);
    }
  }, [gameState]);

  // Handle countdown and game state
  useEffect(() => {
    if (gameState === 'waiting' && countdownSeconds > 0) {
      const timer = setTimeout(() => {
        setCountdownSeconds(countdownSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'waiting' && countdownSeconds === 0) {
      startGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdownSeconds, gameState]);

  // Game loop
  useEffect(() => {
    if (gameState === 'running') {
      let startTime = performance.now();
      let lastTickTime = startTime;
      const crashPoint = generateCrashPoint();
      console.log('Crash point:', crashPoint);
      
      const updateMultiplier = (currentTime: number) => {
        // Calculate time elapsed in seconds
        const elapsed = (currentTime - startTime) / 1000;
        
        // Calculate new multiplier (slower at first, then accelerating)
        const newMultiplier = 1 + Math.pow(elapsed, 1.2) / 2;
        const roundedMultiplier = parseFloat(newMultiplier.toFixed(2));
        
        // Check if we should crash
        if (roundedMultiplier >= crashPoint) {
          setMultiplier(crashPoint);
          handleCrash(crashPoint);
          return;
        }
        
        setMultiplier(roundedMultiplier);
        
        // Auto cashout if set
        if (hasBet && autoCashout && roundedMultiplier >= autoCashout && !hasUserCashedOut) {
          handleCashout();
        }
        
        // Bot cash outs
        simulateBotCashouts(roundedMultiplier);
        
        // Play tick sound every 0.5 seconds
        if (currentTime - lastTickTime >= 250) {
          playSound('/sounds/tick.mp3', 0.1);
          lastTickTime = currentTime;
        }
        
        animationFrameId.current = requestAnimationFrame(updateMultiplier);
      };
      
      animationFrameId.current = requestAnimationFrame(updateMultiplier);
      
      return () => {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }
  }, [gameState]);

  const simulateBotCashouts = (currentMultiplier: number) => {
    // Each bot has a chance to cash out based on current multiplier
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        // Skip players who already cashed out
        if (player.cashoutAt !== null) return player;
        
        // Probability increases with multiplier
        const cashoutProbability = Math.min(0.05 * currentMultiplier, 0.2);
        
        if (Math.random() < cashoutProbability) {
          return { ...player, cashoutAt: currentMultiplier };
        }
        return player;
      })
    );
  };

  const startGame = () => {
    setGameState('running');
    setMultiplier(1.00);
    setHasUserCashedOut(false);
    playSound('/sounds/button-click.mp3');
  };

  const handleBet = () => {
    if (betAmount <= 0 || gameState === 'running') return;
    setHasBet(true);
    playSound('/sounds/deposit.mp3');
  };

  const handleCashout = () => {
    if (!hasBet || hasUserCashedOut || gameState !== 'running') return;
    
    const winnings = betAmount * multiplier;
    setHasUserCashedOut(true);
    
    // Add user to players list
    setPlayers(prev => [
      ...prev, 
      {
        name: 'You',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
        betAmount: betAmount,
        cashoutAt: multiplier
      }
    ]);
    
    playSound('/sounds/cashout.mp3');
    showGameResult({
      success: true, 
      message: `Cashed Out at ${multiplier.toFixed(2)}x`,
      multiplier: multiplier,
      amount: parseFloat(winnings.toFixed(2))
    });
  };

  const handleCrash = (crashPoint: number) => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    
    playSound('/sounds/explosion.mp3');
    
    // Update history
    setCrashHistory(prev => [crashPoint, ...prev.slice(0, 9)]);
    setLastCrashPoint(crashPoint);
    
    // Set players who didn't cash out to null (they lost)
    setPlayers(prevPlayers => 
      prevPlayers.map(player => player.cashoutAt === null ? 
        {...player, cashoutAt: null} : player)
    );
    
    setGameState('crashed');
    
    // If user placed bet but didn't cash out, show game over
    if (hasBet && !hasUserCashedOut) {
      showGameResult({
        success: false,
        message: `Crashed at ${crashPoint.toFixed(2)}x`,
        multiplier: crashPoint,
        amount: betAmount
      });
    }
    
    // Reset for next game
    setTimeout(() => {
      setCountdownSeconds(5);
      setHasBet(false);
      setGameState('waiting');
    }, 3000);
  };

  // Calculate rocket height percentage based on multiplier
  const getRocketHeight = () => {
    const percentage = Math.min(((multiplier - 1) / 9) * 100, 100);
    return `${percentage}%`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Crash Game</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[500px] overflow-hidden">
            <CardHeader className="p-4 bg-gradient-to-r from-black to-purple-900/40">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Rocket Crash
                </CardTitle>
                <div className="text-lg font-mono">
                  {gameState === 'running' ? (
                    <span className={`animate-pulse ${multiplier >= 2 ? 'text-green-500' : ''}`}>
                      {multiplier.toFixed(2)}x
                    </span>
                  ) : gameState === 'crashed' ? (
                    <span className="text-red-500">
                      {lastCrashPoint.toFixed(2)}x
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{countdownSeconds}s</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0 h-[400px] relative bg-gradient-to-b from-black to-violet-950/20">
              {/* Stars background */}
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 100 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-white rounded-full"
                    style={{
                      width: `${Math.random() * 2 + 1}px`,
                      height: `${Math.random() * 2 + 1}px`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      opacity: Math.random() * 0.8 + 0.2,
                    }}
                  />
                ))}
              </div>
              
              {/* Game visualization */}
              <div className="absolute inset-0 flex items-end justify-center">
                {/* Ground */}
                <div className="absolute bottom-0 w-full h-[60px] bg-gradient-to-t from-violet-900/30 to-transparent" />
                
                {/* Rocket */}
                {gameState !== 'waiting' && (
                  <div 
                    className="absolute transition-all duration-100 ease-out w-20" 
                    style={{ 
                      bottom: '60px', 
                      height: getRocketHeight(),
                      maxHeight: 'calc(100% - 60px)'
                    }}
                  >
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                      <div className={`relative ${gameState === 'crashed' ? 'animate-bounce' : ''}`}>
                        {/* Fire effect */}
                        {gameState === 'running' && (
                          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-8 h-12">
                            <div className="absolute w-full h-full bg-gradient-to-t from-orange-600 via-yellow-500 to-transparent opacity-80 animate-pulse rounded-b-lg" />
                          </div>
                        )}
                        
                        {/* Rocket */}
                        <Rocket 
                          className={`h-12 w-12 ${
                            gameState === 'crashed' ? 'text-red-500 rotate-45' : 'text-white'
                          }`} 
                        />
                      </div>
                    </div>
                    
                    {/* Rocket path */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[2px] h-full bg-gradient-to-b from-transparent via-violet-500 to-violet-200 opacity-50" />
                  </div>
                )}
              </div>
              
              {/* Crash overlay */}
              {gameState === 'crashed' && (
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                  <div className="bg-black/80 p-6 rounded-lg backdrop-blur-sm text-center">
                    <h2 className="text-3xl font-bold text-red-500 mb-2">CRASHED!</h2>
                    <p className="text-xl font-mono">{lastCrashPoint.toFixed(2)}x</p>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="bg-black/40 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 overflow-x-auto w-full">
                <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex gap-2">
                  {crashHistory.map((crash, index) => (
                    <div 
                      key={index} 
                      className={`px-2 py-1 rounded text-xs font-mono ${
                        crash >= 2 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {crash.toFixed(2)}x
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
              <CardTitle>Place Bet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Bet Amount</label>
                <Input
                  type="number"
                  min="1"
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                  disabled={hasBet || gameState === 'running'}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Auto Cash Out (Optional)</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1.01"
                    step="0.01"
                    placeholder="e.g. 2.00"
                    value={autoCashout || ''}
                    onChange={(e) => setAutoCashout(e.target.value ? parseFloat(e.target.value) : null)}
                    disabled={hasBet || gameState === 'running'}
                  />
                  <span className="text-sm">x</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={handleBet}
                  disabled={betAmount <= 0 || hasBet || gameState === 'crashed'}
                >
                  Place Bet
                </Button>
                <Button 
                  className="flex-1" 
                  variant="secondary"
                  onClick={handleCashout}
                  disabled={!hasBet || hasUserCashedOut || gameState !== 'running'}
                >
                  Cash Out
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {hasBet && gameState === 'running' && !hasUserCashedOut && (
                  <p>
                    Potential win: <span className="font-bold">{(betAmount * multiplier).toFixed(2)}</span> gems
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Players
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {players.map((player, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-2">
                      <img 
                        src={player.avatar} 
                        alt={player.name} 
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm">{player.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-mono mr-2">{player.betAmount}</span>
                      {player.cashoutAt ? (
                        <div className="flex items-center">
                          <ArrowRight className="h-3 w-3 mx-1" />
                          <span className="text-sm font-mono text-green-500">{(player.betAmount * player.cashoutAt).toFixed(0)}</span>
                          <span className="text-xs text-green-400 ml-1">({player.cashoutAt.toFixed(2)}x)</span>
                        </div>
                      ) : gameState === 'crashed' ? (
                        <span className="text-xs text-red-400">lost</span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Crash;
