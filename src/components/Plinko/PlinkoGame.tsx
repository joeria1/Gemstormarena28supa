
import React, { useState, useEffect, useRef } from 'react';
import PlinkoBoard from './PlinkoBoard';
import PlinkoControls from './PlinkoControls';
import PlinkoResults from './PlinkoResults';
import { useSound } from '../ui/sound-context';
import { playGameSound } from '../../utils/gameSounds';
import { useSoundEffect } from '../../hooks/useSoundEffect';
import { toast } from 'sonner';

interface BallResult {
  id: number;
  multiplier: number;
  amount: number;
  timestamp: Date;
}

const PlinkoGame: React.FC = () => {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [risk, setRisk] = useState<'low' | 'medium' | 'high'>('medium');
  const [results, setResults] = useState<BallResult[]>([]);
  const [activeBalls, setActiveBalls] = useState<{id: number, x: number, y: number, vx: number, vy: number, currentRow: number, inPocket: boolean, pocketIndex?: number}[]>([]);
  const nextBallId = useRef(1);
  const maxSimultaneousBalls = 5; // Maximum balls that can be in play at once
  const { volume, isMuted } = useSound();
  const { playSound } = useSoundEffect();
  const physicsInterval = useRef<number | null>(null);
  const ballsInPlay = useRef<number>(0);

  const riskMultipliers = {
    low: [1.2, 1.4, 1.6, 1.8, 2.1, 2.4, 2.9, 3.5, 4.9, 8.9],
    medium: [1.5, 1.8, 2.2, 2.6, 3.5, 5.2, 9.5, 16.2, 44, 100],
    high: [2.7, 3.5, 5.2, 8.1, 15, 29, 58, 140, 400, 1000]
  };

  // Initialize the physics engine
  useEffect(() => {
    // Start the physics simulation loop when component mounts
    if (physicsInterval.current === null) {
      physicsInterval.current = window.setInterval(() => {
        updatePhysics();
      }, 16); // ~60fps
    }
    
    // Clean up interval when component unmounts
    return () => {
      if (physicsInterval.current !== null) {
        window.clearInterval(physicsInterval.current);
        physicsInterval.current = null;
      }
    };
  }, []);

  // Physics constants - tuned for more realistic bounces
  const GRAVITY = 0.28; // Slightly reduced gravity for slower falls
  const BOUNCE_FACTOR = 0.65; // Higher bounce factor for more elastic collisions
  const FRICTION = 0.97; // Slightly more friction
  const MAX_VELOCITY = 16; // Higher max velocity
  const PEG_RADIUS = 10;
  const BALL_RADIUS = 12;
  const BOARD_WIDTH = 1000; // Normalized board width
  const BOARD_HEIGHT = 1400; // Normalized board height
  const PEG_ROWS = 12;
  const INITIAL_VELOCITY_RANGE = 2.0; // Range for initial velocity randomness
  
  // Get peg positions for collision detection
  const getPegPositions = () => {
    const positions = [];
    
    for (let row = 0; row < PEG_ROWS; row++) {
      const pegsInRow = row + 1;
      const rowWidth = (pegsInRow - 1) * 100;
      const startX = (BOARD_WIDTH - rowWidth) / 2;
      
      for (let col = 0; col < pegsInRow; col++) {
        const x = startX + col * 100;
        const y = 100 + row * 100; // Start pegs 100px down
        
        positions.push({ row, col, x, y });
      }
    }
    
    return positions;
  };
  
  // Get pocket positions for score detection
  const getPocketPositions = () => {
    const multipliers = riskMultipliers[risk];
    const pocketCount = multipliers.length;
    const pocketWidth = BOARD_WIDTH / pocketCount;
    
    return multipliers.map((_, index) => {
      return {
        left: index * pocketWidth,
        right: (index + 1) * pocketWidth,
        y: BOARD_HEIGHT - 30, // Bottom position
        index
      };
    });
  };
  
  // Check if ball collides with a peg
  const checkPegCollision = (ball: typeof activeBalls[0], pegPositions: ReturnType<typeof getPegPositions>) => {
    // Keep track of closest collision
    let closestCollision = null;
    let closestDistance = Infinity;
    
    for (const peg of pegPositions) {
      // Skip pegs that are in rows we've already passed (with some buffer to catch edge cases)
      if (peg.row < ball.currentRow - 2) continue;
      
      // Skip pegs that are too far away horizontally (optimization)
      if (Math.abs(ball.x - peg.x) > BALL_RADIUS + PEG_RADIUS + 5) continue;
      
      const dx = ball.x - peg.x;
      const dy = ball.y - peg.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Check if this is a collision and closer than previous collisions
      if (distance < BALL_RADIUS + PEG_RADIUS && distance < closestDistance) {
        closestDistance = distance;
        
        // Calculate collision response (bounce) - more accurate physics
        const nx = dx / distance; // Normalized x component of collision normal
        const ny = dy / distance; // Normalized y component of collision normal
        
        // Dot product of velocity and normal
        const dotProduct = ball.vx * nx + ball.vy * ny;
        
        // Calculate new velocity components with bounce factor
        const newVx = ball.vx - (1 + BOUNCE_FACTOR) * dotProduct * nx;
        const newVy = ball.vy - (1 + BOUNCE_FACTOR) * dotProduct * ny;
        
        // Add a touch of randomness to prevent predictable paths
        const randomFactor = 0.95 + Math.random() * 0.1; // Random factor between 0.95 and 1.05
        
        // Update row if we've passed into a new row
        const newRow = peg.row >= ball.currentRow ? peg.row + 1 : ball.currentRow;
        
        closestCollision = {
          vx: Math.min(Math.max(newVx * randomFactor, -MAX_VELOCITY), MAX_VELOCITY),
          vy: Math.min(Math.max(newVy * randomFactor, -MAX_VELOCITY / 2), MAX_VELOCITY),
          row: newRow,
          pegRow: peg.row,
          pegCol: peg.col
        };
      }
    }
    
    if (closestCollision) {
      // Play peg hit sound with varying volume based on impact velocity
      if (!isMuted) {
        const impactSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        const volume = Math.min(0.3 + (impactSpeed / MAX_VELOCITY) * 0.7, 1.0);
        playGameSound('plinkoPeg', volume * 0.5);
      }
      
      // Update the ball's current row
      ball.currentRow = closestCollision.row;
      
      return {
        vx: closestCollision.vx,
        vy: closestCollision.vy
      };
    }
    
    return null;
  };
  
  // Check if ball enters a pocket
  const checkPocketEntry = (ball: typeof activeBalls[0], pocketPositions: ReturnType<typeof getPocketPositions>) => {
    if (ball.y >= BOARD_HEIGHT - 100) {
      // Find which pocket the ball is in
      const pocket = pocketPositions.find(p => ball.x >= p.left && ball.x <= p.right);
      if (pocket && !ball.inPocket) {
        return pocket.index;
      }
    }
    return null;
  };

  // Main physics update loop
  const updatePhysics = () => {
    setActiveBalls(prevBalls => {
      if (prevBalls.length === 0) return prevBalls;
      
      const pegPositions = getPegPositions();
      const pocketPositions = getPocketPositions();
      
      // Process each ball with improved physics
      const updatedBalls = prevBalls.map(ball => {
        // Skip balls that are already in a pocket
        if (ball.inPocket) return ball;
        
        // Apply gravity with more natural acceleration
        let newVy = ball.vy + GRAVITY * (1 + Math.random() * 0.05); // Slight random variation
        let newVx = ball.vx * FRICTION;
        
        // Add a tiny amount of horizontal drift (simulates air resistance, imperfections)
        newVx += (Math.random() - 0.5) * 0.03;
        
        // Check for collisions with pegs
        const collision = checkPegCollision(ball, pegPositions);
        if (collision) {
          newVx = collision.vx;
          newVy = collision.vy;
          
          // Add post-collision "wobble" for more natural movement
          if (Math.random() > 0.7) {
            newVx += (Math.random() - 0.5) * 0.8;
            newVy += (Math.random() - 0.5) * 0.4;
          }
        }
        
        // Update position
        let newX = ball.x + newVx;
        let newY = ball.y + newVy;
        
        // Board edge bounds with improved bounce physics
        if (newX < BALL_RADIUS) {
          newX = BALL_RADIUS + (BALL_RADIUS - newX) * 0.2; // Slight correction to prevent sticking
          newVx = -newVx * (0.7 + Math.random() * 0.2); // Variable bounce off left wall
          
          // Small vertical component on wall bounce
          newVy += (Math.random() - 0.3) * 0.5;
        } else if (newX > BOARD_WIDTH - BALL_RADIUS) {
          newX = BOARD_WIDTH - BALL_RADIUS - (newX - (BOARD_WIDTH - BALL_RADIUS)) * 0.2;
          newVx = -newVx * (0.7 + Math.random() * 0.2); // Variable bounce off right wall
          
          // Small vertical component on wall bounce
          newVy += (Math.random() - 0.3) * 0.5;
        }
        
        // Apply velocity limits
        newVx = Math.min(Math.max(newVx, -MAX_VELOCITY), MAX_VELOCITY);
        newVy = Math.min(Math.max(newVy, -MAX_VELOCITY / 1.5), MAX_VELOCITY);
        
        // Check if ball entered a pocket
        const pocketIndex = checkPocketEntry(
          { ...ball, x: newX, y: newY },
          pocketPositions
        );
        
        let inPocket = ball.inPocket;
        if (pocketIndex !== null) {
          inPocket = true;
          
          // Handle pocket entry logic here (determined by pocketIndex)
          handleBallInPocket(ball.id, pocketIndex);
        }
        
        return {
          ...ball,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          inPocket,
          pocketIndex: inPocket ? (pocketIndex ?? ball.pocketIndex) : undefined
        };
      });
      
      // Remove balls that have fallen past the bottom
      const ballsToKeep = updatedBalls.filter(ball => 
        ball.inPocket || ball.y < BOARD_HEIGHT + BALL_RADIUS * 2
      );
      
      // Update ball count
      ballsInPlay.current = ballsToKeep.filter(ball => !ball.inPocket).length;
      
      return ballsToKeep;
    });
  };

  // Handle a ball entering a pocket
  const handleBallInPocket = (ballId: number, pocketIndex: number) => {
    // Calculate winnings
    const multipliers = riskMultipliers[risk];
    const multiplier = multipliers[pocketIndex] || 1; 
    const winAmount = betAmount * multiplier;
    
    // Play win sounds with slight delay so they don't overlap
    setTimeout(() => {
      if (!isMuted) {
        playGameSound('plinkoWin', volume * 0.7);
        if (multiplier >= 5) {
          setTimeout(() => playGameSound('win', volume), 300);
        }
      }
      
      // Add to results
      const newResult: BallResult = {
        id: ballId,
        multiplier,
        amount: winAmount,
        timestamp: new Date()
      };
      
      setResults(prev => [newResult, ...prev].slice(0, 50));
      setBalance(prev => prev + winAmount);
      
      // Show toast notification for significant wins
      if (multiplier >= 5) {
        toast.success(`You won ${multiplier}x - $${winAmount.toFixed(2)}!`, {
          position: 'top-center',
          duration: 3000,
        });
      }
      
      // Decrement ball count
      ballsInPlay.current--;
    }, 100);
  };

  // Drop a new ball
  const dropBall = () => {
    if (ballsInPlay.current >= maxSimultaneousBalls) {
      // Too many balls in play
      toast.error(`Max ${maxSimultaneousBalls} balls in play at once`, {
        position: 'top-center',
        duration: 2000,
      });
      return;
    }
    
    if (balance < betAmount) return;
    
    // Deduct bet amount
    setBalance(prev => prev - betAmount);
    const ballId = nextBallId.current++;
    ballsInPlay.current++;
    
    // Play drop sound
    if (!isMuted) {
      playGameSound('plinkoPeg', volume * 0.7);
    }
    
    // Calculate an initial position with some randomness
    // This creates more varied and realistic starting positions
    const dropPosition = BOARD_WIDTH / 2 + (Math.random() * 100 - 50);
    
    // Calculate initial velocity components
    // Adding a bit of initial spin and movement makes the physics more interesting
    const initialVx = (Math.random() * INITIAL_VELOCITY_RANGE - INITIAL_VELOCITY_RANGE/2) * 
                      (dropPosition > BOARD_WIDTH / 2 ? -0.5 : 0.5); // Bias toward center
    const initialVy = Math.random() * 0.5; // Small initial downward velocity
    
    // Add a new ball with improved starting conditions
    const newBall = {
      id: ballId,
      x: Math.max(BALL_RADIUS * 2, Math.min(BOARD_WIDTH - BALL_RADIUS * 2, dropPosition)), // Keep within bounds
      y: 30 + (Math.random() * 20), // Varied starting height
      vx: initialVx,
      vy: initialVy,
      currentRow: 0, // Track which row the ball is passing
      inPocket: false
    };
    
    // Add to active balls
    setActiveBalls(prev => [...prev, newBall]);
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg w-full max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-3/4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Plinko</h2>
            <div className="text-xl text-yellow-400">Balance: ${balance.toFixed(2)}</div>
          </div>
          
          <PlinkoControls 
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            risk={risk}
            setRisk={setRisk}
            onDrop={dropBall}
            balance={balance}
          />
          
          <div className="mt-4 bg-gray-800 rounded-lg overflow-hidden">
            <PlinkoBoard activeBalls={activeBalls} risk={risk} />
          </div>
        </div>
        
        <div className="lg:w-1/4 bg-gray-800 p-4 rounded-lg">
          <PlinkoResults results={results} />
        </div>
      </div>
    </div>
  );
};

export default PlinkoGame;
