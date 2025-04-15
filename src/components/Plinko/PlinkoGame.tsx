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
  const [activeBalls, setActiveBalls] = useState<{
    id: number, 
    x: number, 
    y: number, 
    vx: number, 
    vy: number, 
    currentRow: number, 
    inPocket: boolean, 
    pocketIndex?: number, 
    lastHitPeg?: {row: number, col: number}, 
    stuckTime?: number,
    scale?: number,
    growing?: boolean
  }[]>([]);
  const nextBallId = useRef(1);
  const { volume, isMuted } = useSound();
  const { playSound } = useSoundEffect();
  const physicsInterval = useRef<number | null>(null);
  const ballsInPlay = useRef<number>(0);
  const [riskLockEnabled, setRiskLockEnabled] = useState(false);

  // Custom multipliers distribution with improved house edge - lower values in middle, higher on edges
  // but with natural bias toward middle positions
  const generateMultipliers = (risk: 'low' | 'medium' | 'high', count: number = 10): number[] => {
    // Base multiplier values based on risk - adjusted for better house edge
    const baseValues = {
      low: { min: 0.5, mid: 0.9, max: 9 },
      medium: { min: 0.3, mid: 0.8, max: 100 },
      high: { min: 0.1, mid: 0.5, max: 1000 }
    };
    
    const { min, mid, max } = baseValues[risk];
    const result: number[] = [];
    
    // Fill in multipliers, higher on edges, lower in middle
    for (let i = 0; i < count; i++) {
      // Calculate position relative to center (0 = middle, 1 = edge)
      const positionFactor = Math.abs((i - (count - 1) / 2) / ((count - 1) / 2));
      
      // Calculate multiplier value based on position
      // Use steeper exponential curve for more dramatic edge values
      let value;
      if (positionFactor < 0.3) {
        // Center positions - lowest multipliers (house edge)
        value = min + (mid - min) * (positionFactor / 0.3);
      } else {
        // Exponential increase for edge positions
        const expFactor = (positionFactor - 0.3) / 0.7;
        value = mid + (max - mid) * Math.pow(expFactor, 2.5); // Even steeper curve for bigger edge multipliers
      }
      
      // Round to 1 decimal place
      result.push(Math.round(value * 10) / 10);
    }
    
    return result;
  };

  const riskMultipliers = {
    low: generateMultipliers('low'),
    medium: generateMultipliers('medium'),
    high: generateMultipliers('high')
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

  // Lock/unlock risk selection based on active balls
  useEffect(() => {
    // If there are balls in play, prevent risk change
    const hasBalls = activeBalls.some(ball => !ball.inPocket);
    setRiskLockEnabled(hasBalls);
  }, [activeBalls]);

  // Physics constants - further improved for more reliable behavior
  const GRAVITY = 0.32; // Increased for faster falling
  const BOUNCE_FACTOR = 0.55; // Reduced bounce for more natural physics
  const FRICTION = 0.97; // Increased friction to prevent excessive slipping
  const MAX_VELOCITY = 14; // Increased max velocity for more dynamic gameplay
  const PEG_RADIUS = 15; // Increased peg radius for better collisions
  const BALL_RADIUS = 14; // Ball radius
  const BOARD_WIDTH = 1000; // Normalized board width
  const BOARD_HEIGHT = 1400; // Normalized board height
  const PEG_ROWS = 12;
  const INITIAL_VELOCITY_RANGE = 0.6; // Reduced for more consistent initial paths
  const STUCK_DETECTION_TIME = 400; // Reduced time to detect stuck balls faster
  const STUCK_VELOCITY_THRESHOLD = 0.6; // Increased threshold to detect stuck balls sooner
  const PEG_REPULSION_STRENGTH = 0.15; // Added repulsion to prevent balls sticking on pegs
  
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
  
  // Check if ball collides with a peg - significantly improved to prevent getting stuck
  const checkPegCollision = (ball: typeof activeBalls[0], pegPositions: ReturnType<typeof getPegPositions>) => {
    // Keep track of closest collision
    let closestCollision = null;
    let closestDistance = Infinity;
    let hitPeg = null;
    
    for (const peg of pegPositions) {
      // Skip pegs that are in rows we've already passed (with some buffer to catch edge cases)
      if (peg.row < ball.currentRow - 2) continue;
      
      // Skip pegs that are too far away horizontally (optimization)
      if (Math.abs(ball.x - peg.x) > BALL_RADIUS + PEG_RADIUS + 8) continue;
      
      const dx = ball.x - peg.x;
      const dy = ball.y - peg.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Check if this is a collision and closer than previous collisions
      if (distance < BALL_RADIUS + PEG_RADIUS && distance < closestDistance) {
        closestDistance = distance;
        hitPeg = { row: peg.row, col: peg.col };
        
        // Calculate collision response (bounce) - more accurate physics
        const nx = dx / distance; // Normalized x component of collision normal
        const ny = dy / distance; // Normalized y component of collision normal
        
        // Dot product of velocity and normal
        const dotProduct = ball.vx * nx + ball.vy * ny;
        
        // Calculate new velocity components with bounce factor
        const newVx = ball.vx - (1 + BOUNCE_FACTOR) * dotProduct * nx;
        const newVy = ball.vy - (1 + BOUNCE_FACTOR) * dotProduct * ny;
        
        // Calculate collision intensity for better physics feedback
        const impactIntensity = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        
        // Add natural variance to prevent balls from taking the same path
        const xVariance = (Math.random() - 0.5) * 0.2;
        const yVariance = Math.random() * 0.15;
        
        // Update row if we've passed into a new row
        const newRow = peg.row >= ball.currentRow ? peg.row + 1 : ball.currentRow;
        
        closestCollision = {
          vx: newVx + xVariance,
          vy: newVy + yVariance,
          row: newRow,
          pegRow: peg.row,
          pegCol: peg.col,
          impactIntensity
        };
      }
    }
    
    if (closestCollision) {
      // Check if the ball might be stuck on this peg
      const sameHitPeg = ball.lastHitPeg && 
                        ball.lastHitPeg.row === hitPeg?.row && 
                        ball.lastHitPeg.col === hitPeg?.col;
      
      // If ball hit the same peg, apply stronger countermeasures
      let extraRandomness = 1.0;
      let repulsionFactor = 0;
      
      if (sameHitPeg) {
        // Apply strong randomization and added downward momentum to escape
        extraRandomness = 1.1 + Math.random() * 0.2;
        repulsionFactor = PEG_REPULSION_STRENGTH;
        
        // If velocity is too low, give a significant boost downward
        if (Math.abs(closestCollision.vx) + Math.abs(closestCollision.vy) < STUCK_VELOCITY_THRESHOLD * 2) {
          closestCollision.vy = Math.max(closestCollision.vy, GRAVITY * 5);
          // Add horizontal push in random direction
          closestCollision.vx += (Math.random() > 0.5 ? 1 : -1) * GRAVITY * 3;
        }
      }

      // Play peg hit sound with varying volume based on impact velocity
      if (!isMuted) {
        const impactSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        const volume = Math.min(0.3 + (impactSpeed / MAX_VELOCITY) * 0.7, 1.0);
        playGameSound('plinkoPeg', volume * 0.5);
      }
      
      // Update the ball's current row
      ball.currentRow = closestCollision.row;
      ball.lastHitPeg = hitPeg;
      
      // Apply repulsion to push ball away from peg (stronger for same-peg hits)
      const dx = ball.x - (hitPeg ? pegPositions.find(p => p.row === hitPeg.row && p.col === hitPeg.col)?.x || ball.x : ball.x);
      const dy = ball.y - (hitPeg ? pegPositions.find(p => p.row === hitPeg.row && p.col === hitPeg.col)?.y || ball.y : ball.y);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      let repulsionVx = 0;
      let repulsionVy = 0;
      
      if (distance > 0) {
        // Add repulsion force to push ball away from peg
        repulsionVx = (dx / distance) * repulsionFactor * MAX_VELOCITY;
        repulsionVy = (dy / distance) * repulsionFactor * MAX_VELOCITY;
        // Add extra downward momentum to prevent getting stuck
        repulsionVy = Math.max(repulsionVy, 0);
      }
      
      // Apply velocity limits with repulsion force
      const vx = Math.min(Math.max((closestCollision.vx * extraRandomness) + repulsionVx, -MAX_VELOCITY), MAX_VELOCITY);
      const vy = Math.min(Math.max(closestCollision.vy + repulsionVy, -MAX_VELOCITY / 2), MAX_VELOCITY);
      
      return { vx, vy };
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

  // Enhanced detection and fixing of stuck balls
  const handleStuckBalls = (ball: typeof activeBalls[0]) => {
    const currentTime = Date.now();
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    
    // Check if the ball hasn't made vertical progress (potentially stuck)
    const isMovingTooSlow = speed < STUCK_VELOCITY_THRESHOLD;
    const hasStoppedVertically = ball.vy < GRAVITY / 2;
    const isSpinningHorizontally = Math.abs(ball.vx) > Math.abs(ball.vy) * 2;
    
    // Detect both low velocity and horizontal spinning (common for stuck balls)
    if (isMovingTooSlow || hasStoppedVertically || isSpinningHorizontally) {
      if (!ball.stuckTime) {
        ball.stuckTime = currentTime;
      } else if (currentTime - ball.stuckTime > STUCK_DETECTION_TIME) {
        // Ball has been stuck for too long - apply stronger fix
        
        // Calculate a mostly downward kick angle with some random horizontal component
        const kickAngle = Math.PI / 2 + (Math.random() - 0.5) * 0.5; 
        const kickStrength = GRAVITY * 10; // Stronger impulse
        
        // Apply stronger kick with more downward velocity
        ball.vx = Math.cos(kickAngle) * kickStrength * (Math.random() > 0.5 ? 1 : -1);
        ball.vy = Math.sin(kickAngle) * kickStrength * 1.2; // Extra downward boost
        
        // Add a slight position nudge to help it escape
        ball.y += 2;
        ball.x += (Math.random() - 0.5) * 4;
        
        ball.stuckTime = 0; // Reset stuck timer
        return true;
      }
    } else {
      // Ball is moving fine, reset stuck timer
      ball.stuckTime = 0;
    }
    
    // If ball is moving horizontally more than vertically, add a small gravity boost
    if (Math.abs(ball.vx) > Math.abs(ball.vy) * 1.5 && ball.vy < GRAVITY * 3) {
      ball.vy += GRAVITY * 0.5;
    }
    
    return false;
  };

  // Main physics update loop - enhanced with better physics behavior and animations
  const updatePhysics = () => {
    setActiveBalls(prevBalls => {
      if (prevBalls.length === 0) return prevBalls;
      
      const pegPositions = getPegPositions();
      const pocketPositions = getPocketPositions();
      
      // Process each ball with significantly improved physics
      const updatedBalls = prevBalls.map(ball => {
        // Skip balls that are already in a pocket
        if (ball.inPocket) return ball;
        
        // Check if the ball is stuck and fix if necessary
        const wasUnstuck = handleStuckBalls(ball);
        
        // Apply gravity with more natural acceleration and subtle randomness
        let newVy = ball.vy + GRAVITY + (Math.random() * 0.02);
        let newVx = ball.vx * FRICTION;
        
        // Add subtle random drift for natural movement
        newVx += (Math.random() - 0.5) * 0.04;
        
        // Check for collisions with pegs
        const collision = checkPegCollision(ball, pegPositions);
        if (collision) {
          newVx = collision.vx;
          newVy = collision.vy;
        }
        
        // Update position with slight additional random movement for natural feel
        let newX = ball.x + newVx + (Math.random() - 0.5) * 0.2;
        let newY = ball.y + newVy;
        
        // Board edge bounds with improved bounce physics
        if (newX < BALL_RADIUS) {
          newX = BALL_RADIUS + (BALL_RADIUS - newX) * 0.3; // Better edge correction
          newVx = -newVx * 0.7; // Reduced bounce off wall
          
          // Add strong downward push on wall bounce to prevent getting stuck
          newVy = Math.max(newVy, GRAVITY * 3);
          // Also add slight inward push
          newVx += 0.3;
        } else if (newX > BOARD_WIDTH - BALL_RADIUS) {
          newX = BOARD_WIDTH - BALL_RADIUS - (newX - (BOARD_WIDTH - BALL_RADIUS)) * 0.3;
          newVx = -newVx * 0.7; // Reduced bounce off wall
          
          // Add strong downward push on wall bounce to prevent getting stuck
          newVy = Math.max(newVy, GRAVITY * 3);
          // Also add slight inward push
          newVx -= 0.3;
        }
        
        // Add a subtle natural bias toward the center to increase house edge
        // Balls on the edges have a slight tendency to move toward the center
        const distanceFromCenter = (newX - BOARD_WIDTH / 2) / (BOARD_WIDTH / 2);
        if (Math.abs(distanceFromCenter) > 0.2) {
          // Apply a very subtle centralizing force - stronger the further from center
          newVx -= distanceFromCenter * 0.02;
        }
        
        // Apply velocity limits with greater Y velocity allowed for faster gameplay
        newVx = Math.min(Math.max(newVx, -MAX_VELOCITY), MAX_VELOCITY);
        newVy = Math.min(Math.max(newVy, -MAX_VELOCITY / 1.5), MAX_VELOCITY * 1.2);
        
        // Check if ball entered a pocket
        const pocketIndex = checkPocketEntry(
          { ...ball, x: newX, y: newY },
          pocketPositions
        );
        
        let inPocket = ball.inPocket;
        if (pocketIndex !== null) {
          inPocket = true;
          
          // Handle pocket entry logic
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
      
      // Remove balls that have fallen past the bottom or have been in a pocket for more than a second
      const ballsToKeep = updatedBalls.filter(ball => 
        (!ball.inPocket && ball.y < BOARD_HEIGHT + BALL_RADIUS * 2) ||
        (ball.inPocket && Date.now() - (ball as any).pocketTime < 1000)
      );
      
      // Update ball count
      ballsInPlay.current = ballsToKeep.filter(ball => !ball.inPocket).length;
      
      return ballsToKeep;
    });
  };

  // Handle a ball entering a pocket - enhanced animation and sound effects
  const handleBallInPocket = (ballId: number, pocketIndex: number) => {
    // Calculate winnings
    const multipliers = riskMultipliers[risk];
    const multiplier = multipliers[pocketIndex] || 1; 
    const winAmount = betAmount * multiplier;
    
    // Update the ball to add a timestamp for removing it after animation
    setActiveBalls(prev => 
      prev.map(ball => 
        ball.id === ballId 
          ? { ...ball, inPocket: true, pocketIndex, pocketTime: Date.now() } 
          : ball
      )
    );
    
    // Play sounds with appropriate volumes and timing based on win amount
    setTimeout(() => {
      if (!isMuted) {
        // Always play the base plinko win sound
        playGameSound('plinkoWin', volume * 0.8);
        
        // Play additional sound effects based on multiplier
        if (multiplier >= 10) {
          // Big win - play multiple win sounds with increasing volume
          setTimeout(() => playGameSound('win', volume * 0.7), 200);
          setTimeout(() => playGameSound('win', volume * 0.9), 500);
          setTimeout(() => playGameSound('win', volume), 800);
        } else if (multiplier >= 3) {
          // Medium win - play win sound once
          setTimeout(() => playGameSound('win', volume * 0.8), 300);
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
      
      // Show toast notification with different messages based on multiplier
      if (multiplier >= 10) {
        toast.success(`AMAZING WIN! ${multiplier}x - $${winAmount.toFixed(2)}!`, {
          position: 'top-center',
          duration: 4000,
          style: { background: '#ffd700', color: '#000' }
        });
      } else if (multiplier >= 3) {
        toast.success(`Great win! ${multiplier}x - $${winAmount.toFixed(2)}`, {
          position: 'top-center',
          duration: 3000,
        });
      } else if (multiplier >= 1) {
        toast.success(`You won ${multiplier}x - $${winAmount.toFixed(2)}`, {
          position: 'top-center',
          duration: 2000,
        });
      } else {
        // For multipliers less than 1 (losses)
        toast(`Payout: ${multiplier}x - $${winAmount.toFixed(2)}`, {
          position: 'top-center',
          duration: 2000,
        });
      }
      
      // Decrement ball count
      ballsInPlay.current--;
    }, 100);
  };

  // Drop a new ball with enhanced animation and sound effects
  const dropBall = () => {
    if (balance < betAmount) return;
    
    // Deduct bet amount
    setBalance(prev => prev - betAmount);
    const ballId = nextBallId.current++;
    ballsInPlay.current++;
    
    // Play better drop sound with slight delay for realism
    if (!isMuted) {
      // First play a subtle click sound for the ball release
      playGameSound('caseSelect', volume * 0.3);
      
      // Then play peg hit sound when ball would hit first pegs
      setTimeout(() => {
        playGameSound('plinkoPeg', volume * 0.6);
      }, 200);
    }
    
    // Calculate initial position with controlled randomness for better house edge
    // Slightly bias toward center positions which have lower payouts
    const centerBias = Math.random() > 0.4 ? 0.6 : 1.0; // 60% chance of more center-biased drop
    const dropPosition = BOARD_WIDTH / 2 + (Math.random() * 50 - 25) * centerBias;
    
    // Calculate initial velocity components - more controlled for better gameplay
    const initialVx = (Math.random() * INITIAL_VELOCITY_RANGE - INITIAL_VELOCITY_RANGE/2) * 0.8;
    const initialVy = 0.3 + Math.random() * 0.4; // Slightly increased initial downward velocity
    
    // Add a new ball with improved starting conditions
    const newBall = {
      id: ballId,
      x: Math.max(BALL_RADIUS * 2, Math.min(BOARD_WIDTH - BALL_RADIUS * 2, dropPosition)), // Keep within bounds
      y: 25 + (Math.random() * 15), // Slightly lower starting height for faster gameplay
      vx: initialVx,
      vy: initialVy,
      currentRow: 0, // Track which row the ball is passing
      inPocket: false,
      // Scale animation effect for ball entry (starts small and grows)
      scale: 0.2, // Start small
      growing: true // Flag for growth animation
    };
    
    // Add to active balls
    setActiveBalls(prev => [...prev, newBall]);
    
    // Animate ball entry with scaling effect - ball gets bigger as it appears
    const animateBallEntry = () => {
      setActiveBalls(prev => 
        prev.map(ball => 
          ball.id === ballId && ball.scale < 1
            ? { 
                ...ball, 
                scale: Math.min(ball.scale + 0.2, 1),
                growing: ball.scale < 0.8
              }
            : ball
        )
      );
      
      const currentBall = activeBalls.find(b => b.id === ballId);
      if (currentBall && currentBall.scale < 1) {
        requestAnimationFrame(animateBallEntry);
      }
    };
    
    // Start animation
    requestAnimationFrame(animateBallEntry);
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg w-full max-w-7xl mx-auto">
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
            riskLocked={riskLockEnabled}
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
