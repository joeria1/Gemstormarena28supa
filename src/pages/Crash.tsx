import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useSound } from '../components/SoundManager';
import { showGameResult } from '../components/GameResultNotification';
import { Rocket, TrendingUp, Clock, ArrowRight, Users } from 'lucide-react';
import { SOUNDS, playSound } from '../utils/soundEffects';
import { playCashoutSound, playOrderFilledSound } from '../utils/sounds';
import { playGameSound } from '../utils/gameSounds';
import { playControlledSound, stopControlledSound } from '../utils/soundTestUtility';

interface Player {
  name: string;
  avatar: string;
  betAmount: number;
  cashoutAt: number | null;
}

interface Planet {
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
}

interface Asteroid {
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
}

const Crash: React.FC = () => {
  const [gameState, setGameState] = useState<'waiting' | 'running' | 'crashed'>('waiting');
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [autoCashout, setAutoCashout] = useState<number | null>(null);
  const [hasBet, setHasBet] = useState<boolean>(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(5);
  const [countdownMs, setCountdownMs] = useState<number>(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [hasUserCashedOut, setHasUserCashedOut] = useState<boolean>(false);
  const [lastCrashPoint, setLastCrashPoint] = useState<number>(0);
  const [crashHistory, setCrashHistory] = useState<number[]>([]);
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const { playSound } = useSound();
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const gameCanvasRef = useRef<HTMLDivElement>(null);

  // Generate random crash point with probabilities skewed toward different multipliers
  const generateCrashPoint = (): number => {
    const random = Math.random();
    
    // 2% chance (1 in 50) for extreme multiplier (up to 1000x)
    if (random < 0.02) {
      return 10 + Math.pow(random * 50, 2);
    }
    
    // 15% chance for 2x to 10x (increased from 5%)
    if (random < 0.15) {
      return 2 + Math.pow(random * 2, 2) * 8;
    }
    
    // 83% chance for 1x to 2x (reduced from 95%)
    return 1 + Math.pow(random * 10, 2) / 100;
  };

  // Generate initial planets - with occasional spawning in space area only
  useEffect(() => {
    if (gameState === 'running') {
      // Clear existing planets first
      setPlanets([]);
      
      // Set up interval to occasionally spawn a single planet
      const spawnInterval = setInterval(() => {
        // Only spawn a planet occasionally (about once every 3 seconds with 15% chance)
        if (Math.random() < 0.15) {
          const newPlanet: Planet = {
            x: Math.random() * 100,
            // Position in the middle area (20-80% of screen height), not at the top
            y: 20 + Math.random() * 60, 
            size: Math.random() * 20 + 10,
            color: ['#3498db', '#9b59b6', '#e74c3c', '#f1c40f', '#2ecc71'][Math.floor(Math.random() * 5)],
            speed: Math.random() * 0.15 + 0.05 // Slower speed
          };
          setPlanets(prev => [newPlanet]);
        }
      }, 3000); // Reduced frequency - only check every 3 seconds
      
      return () => clearInterval(spawnInterval);
    } else {
      // Clear planets when not running
      setPlanets([]);
    }
  }, [gameState]);

  // Generate asteroids rarely
  useEffect(() => {
    if (gameState === 'running') {
      const interval = setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance to generate asteroid (reduced from 30%)
          setAsteroids(prev => [...prev, {
            x: Math.random() * 100,
            y: -10,
            size: Math.random() * 15 + 5,
            speed: Math.random() * 1.5 + 0.5, // Slower speed
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 3 - 1.5 // Reduced rotation speed
          }]);
        }
        
        // Update asteroid positions and remove ones that are off-screen
        setAsteroids(prev => 
          prev
            .map(asteroid => ({
              ...asteroid,
              y: asteroid.y + asteroid.speed,
              rotation: asteroid.rotation + asteroid.rotationSpeed
            }))
            .filter(asteroid => asteroid.y < 110)
        );
      }, 500); // Reduced frequency - check every 500ms
      
      return () => clearInterval(interval);
    } else {
      // Clear asteroids when not running
      setAsteroids([]);
    }
  }, [gameState]);

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
    if (gameState === 'waiting' && (countdownSeconds > 0 || countdownMs > 0)) {
      // Play space ambience sound during countdown if it's not already playing
      if (countdownSeconds === 5 && countdownMs === 0) {
        playControlledSound('space-ambience', '/sounds/space.mp3', 0.3, true);
      }
      
      const timer = setTimeout(() => {
        if (countdownMs === 0) {
          setCountdownSeconds(countdownSeconds - 1);
          setCountdownMs(99);
        } else {
          setCountdownMs(countdownMs - 1);
        }
      }, 10); // Update every 10ms for smoother countdown
      return () => clearTimeout(timer);
    } else if (gameState === 'waiting' && countdownSeconds === 0 && countdownMs === 0) {
      // Stop space ambience when starting game
      stopControlledSound('space-ambience');
      startGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdownSeconds, countdownMs, gameState]);

  // Continuous game loop that keeps running even when not on the page
  useEffect(() => {
    // Run this effect only once on mount
    const handleGameLoop = () => {
      if (gameState === 'crashed') {
        // Reset for next game after a delay of 2 seconds
        setTimeout(() => {
          setCountdownSeconds(5);
          setCountdownMs(0);
          setHasBet(false);
          setGameState('waiting');
        }, 2000);
      }
    };

    // Create an interval that checks the game state and restarts if needed
    const loopInterval = setInterval(handleGameLoop, 1000);
    
    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(loopInterval);
    };
  }, [gameState]);

  // Game loop with slower acceleration
  useEffect(() => {
    if (gameState === 'running') {
      // Start playing the rocket fly sound in a loop
      playControlledSound('rocket-fly', '/sounds/rocket-fly.mp3', 0.2, true);
      
      let startTime = performance.now();
      let lastTickTime = startTime;
      const crashPoint = generateCrashPoint();
      console.log('Crash point:', crashPoint);
      
      const updateMultiplier = (currentTime: number) => {
        // Calculate time elapsed in seconds - Adjusted for slower growth
        // Make it take at least 5 seconds to go from 1x to 2x
        const elapsed = (currentTime - startTime) / 5000;
        
        // Calculate new multiplier with less aggressive exponential acceleration
        // Slower acceleration overall
        const acceleration = multiplier >= 10 ? 1.3 : multiplier >= 5 ? 1.1 : 1.05;
        const newMultiplier = 1 + Math.pow(elapsed, acceleration) / (multiplier >= 10 ? 1.2 : 3);
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
        
        // Bot cash outs - make them more patient to go with higher multipliers
        simulateBotCashouts(roundedMultiplier);
        
        // Play tick sound every 0.5 seconds
        if (currentTime - lastTickTime >= 500) {
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
        // Stop the rocket fly sound when the game stops
        stopControlledSound('rocket-fly');
        stopControlledSound('space-ambience');
      };
    }
  }, [gameState]);

  const simulateBotCashouts = (currentMultiplier: number) => {
    // Each bot has a chance to cash out based on current multiplier
    // Modified to make bots more patient to go for higher multipliers
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        // Skip players who already cashed out
        if (player.cashoutAt !== null) return player;
        
        // Reduced probability - bots are more patient now
        const cashoutProbability = Math.min(0.03 * currentMultiplier, 0.15);
        
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
    playOrderFilledSound();
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
    
    // Use the direct cashout sound function
    playCashoutSound();
    
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
    
    // Use playGameSound for the crash sound effect
    playGameSound('rocketCrash', 0.4);
    
    // Stop the rocket fly sound
    stopControlledSound('rocket-fly');
    
    // Update history
    setCrashHistory(prev => [crashPoint, ...prev.slice(0, 9)]);
    setLastCrashPoint(crashPoint);
    
    // Set players who didn't cash out to null (they lost)
    setPlayers(prevPlayers => 
      prevPlayers.map(player => player.cashoutAt === null ? 
        {...player, cashoutAt: null} : player)
    );
    
    setGameState('crashed');
    
    // Clear planets and asteroids immediately
    setPlanets([]);
    setAsteroids([]);
    
    // If user placed bet but didn't cash out, show game over
    if (hasBet && !hasUserCashedOut) {
      showGameResult({
        success: false,
        message: `Crashed at ${crashPoint.toFixed(2)}x`,
        multiplier: crashPoint,
        amount: betAmount
      });
    }
  };

  // Calculate rocket height percentage based on multiplier with improved scaling
  const getRocketHeight = () => {
    const percentage = Math.min(((multiplier - 1) / 9) * 80, 80);
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
                      <span className="font-mono text-xl">
                        {countdownSeconds}.{countdownMs.toString().padStart(2, '0')}s
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0 h-[400px] relative bg-gradient-to-b from-black to-violet-950/20" ref={gameCanvasRef}>
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
              
              {/* Planets */}
              {gameState === 'running' && planets.map((planet, index) => (
                <div
                  key={`planet-${index}`}
                  className="absolute rounded-full"
                  style={{
                    width: `${planet.size}px`,
                    height: `${planet.size}px`,
                    left: `${planet.x}%`,
                    top: `${planet.y}%`,
                    backgroundColor: planet.color,
                    boxShadow: `0 0 10px ${planet.color}`,
                    opacity: 0.7,
                    transition: 'left 0.5s ease-in-out, top 0.5s ease-in-out',
                  }}
                />
              ))}
              
              {/* Asteroids */}
              {gameState === 'running' && asteroids.map((asteroid, index) => (
                <div
                  key={`asteroid-${index}`}
                  className="absolute bg-gray-400"
                  style={{
                    width: `${asteroid.size}px`,
                    height: `${asteroid.size}px`,
                    left: `${asteroid.x}%`,
                    top: `${asteroid.y}%`,
                    clipPath: 'polygon(50% 0%, 80% 30%, 100% 50%, 80% 70%, 50% 100%, 20% 70%, 0% 50%, 20% 30%)',
                    transform: `rotate(${asteroid.rotation}deg)`,
                    transition: 'top 0.2s linear, transform 0.2s linear',
                  }}
                />
              ))}
              
              {/* Game visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Ground */}
                <div className="absolute bottom-0 w-full h-[60px] bg-gradient-to-t from-violet-900/30 to-transparent" />
                
                {/* Rocket */}
                {gameState !== 'waiting' && (
                  <div 
                    className="absolute transition-all duration-300 ease-out w-32" 
                    style={{ 
                      bottom: '60px', 
                      height: getRocketHeight(),
                      maxHeight: 'calc(100% - 60px)'
                    }}
                  >
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                      <div className={`relative ${gameState === 'crashed' ? 'animate-bounce' : ''}`}>
                        {/* Improved fire effect with multiple layers */}
                        {gameState === 'running' && (
                          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-24">
                            {/* Outer fire glow effect */}
                            <div className="absolute w-full h-full bg-gradient-to-t from-orange-600/40 via-yellow-500/20 to-transparent rounded-b-full blur-md animate-pulse" 
                                 style={{animationDuration: '1.5s'}} />
                            
                            {/* Main fire cone */}
                            <div className="absolute w-full h-full bg-gradient-to-t from-orange-600 via-yellow-500 to-transparent opacity-80 animate-pulse rounded-b-full"
                                 style={{animationDuration: '0.8s'}} />
                            
                            {/* Inner fire core - brighter and more dynamic */}
                            <div className="absolute w-1/2 h-4/5 left-1/4 bg-gradient-to-t from-white via-yellow-300 to-transparent opacity-90 animate-pulse rounded-b-full" 
                                 style={{animationDuration: '0.6s'}} />
                            
                            {/* Center flame - very bright core */}
                            <div className="absolute w-1/4 h-2/5 left-[37.5%] bg-white opacity-80 animate-pulse rounded-b-full"
                                 style={{animationDuration: '0.4s'}} />
                            
                            {/* Smoke particles */}
                            <div className="absolute -bottom-4 left-0 w-full">
                              {Array.from({ length: 12 }).map((_, i) => (
                                <div
                                  key={i}
                                  className="absolute bg-gray-400/40 rounded-full animate-fadeOut"
                                  style={{
                                    width: `${Math.random() * 6 + 3}px`,
                                    height: `${Math.random() * 6 + 3}px`,
                                    left: `${Math.random() * 120 - 10}%`,
                                    bottom: `${Math.random() * 20}px`,
                                    animationDuration: `${Math.random() * 2 + 1}s`,
                                    animationDelay: `${Math.random() * 0.5}s`,
                                  }}
                                />
                              ))}
                            </div>
                            
                            {/* Fire particles - more of them and more varied */}
                            <div className="absolute bottom-0 left-0 w-full">
                              {Array.from({ length: 15 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`absolute rounded-full animate-flickerFire ${
                                    i % 3 === 0 ? 'bg-yellow-300/90' : 
                                    i % 3 === 1 ? 'bg-orange-500/70' : 'bg-red-500/60'
                                  }`}
                                  style={{
                                    width: `${Math.random() * 5 + 2}px`,
                                    height: `${Math.random() * 5 + 2}px`,
                                    left: `${Math.random() * 100}%`,
                                    bottom: `${Math.random() * 15}px`,
                                    animationDuration: `${Math.random() * 0.5 + 0.2}s`,
                                    animationDelay: `${Math.random() * 0.5}s`,
                                    transform: `translateY(${Math.random() * 10}px)`,
                                  }}
                                />
                              ))}
                            </div>
                            
                            {/* Additional effect - occasional larger sparks */}
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div
                                key={`spark-${i}`}
                                className="absolute bg-yellow-200/70 rounded-full animate-spark"
                                style={{
                                  width: `${Math.random() * 3 + 1}px`,
                                  height: `${Math.random() * 3 + 1}px`,
                                  left: `${40 + Math.random() * 20}%`,
                                  bottom: `${Math.random() * 10 + 5}px`,
                                  animationDuration: `${Math.random() * 1 + 0.5}s`,
                                  animationDelay: `${Math.random() * 1}s`,
                                  animationIterationCount: 'infinite',
                                }}
                              />
                            ))}
                          </div>
                        )}
                        
                        {/* Bigger Rocket */}
                        <Rocket 
                          className={`h-20 w-20 ${
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
              
              {/* Countdown overlay */}
              {gameState === 'waiting' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/70 p-8 rounded-full backdrop-blur-sm text-center w-48 h-48 flex flex-col items-center justify-center">
                    <h2 className="text-4xl font-bold text-white mb-1">Starting In</h2>
                    <p className="text-5xl font-mono text-yellow-400 font-bold">
                      {countdownSeconds}.{countdownMs.toString().padStart(2, '0')}s
                    </p>
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
