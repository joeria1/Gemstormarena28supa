import React, { useRef, useEffect } from 'react';
import { useSoundEffect } from '../../hooks/useSoundEffect';

interface PlinkoBoardProps {
  activeBalls: { 
    id: number; 
    x: number; 
    y: number; 
    vx: number; 
    vy: number; 
    currentRow: number;
    inPocket: boolean;
    pocketIndex?: number;
    lastHitPeg?: {row: number, col: number}; 
    stuckTime?: number;
    scale?: number;
    growing?: boolean;
    lastMultiplier?: number;
  }[];
  risk: 'low' | 'medium' | 'high';
  lastHitMultiplier: number | null;
  ballRadius: number;
  boardWidth: number;
  boardHeight: number;
}

const PlinkoBoard: React.FC<PlinkoBoardProps> = ({ 
  activeBalls, 
  risk, 
  lastHitMultiplier, 
  ballRadius,
  boardWidth = 600,
  boardHeight = 750
}) => {
  // Adjust rows based on risk level
  const rowsByRisk = {
    low: 8,      // Fewer rows for low risk
    medium: 12,  // Medium rows for medium risk
    high: 16     // More rows for high risk
  };
  
  // Set up pockets/goals by risk level
  const pocketCountsByRisk = {
    low: 8,     // 8 goals for low risk
    medium: 12, // 12 goals for medium risk
    high: 16    // 16 goals for high risk
  };
  
  const rows = rowsByRisk[risk];
  const pocketCount = pocketCountsByRisk[risk];
  
  // White pegs for all risk levels as shown in reference
  const pegColor = 'bg-white';
  const ballColor = 'bg-yellow-400';
  const boardRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSoundEffect();

  // Risk-specific colors for buckets/goals
  const bucketColors = {
    low: {
      high: 'bg-red-600',
      medium: 'bg-green-600',
      low: 'bg-orange-500'
    },
    medium: {
      high: 'bg-purple-600',
      medium: 'bg-blue-600',
      low: 'bg-orange-500'
    },
    high: {
      high: 'bg-red-600',
      medium: 'bg-orange-600',
      low: 'bg-orange-500'
    }
  };

  // Calculate peg size based on risk level to match PlinkoGame PEG_RADIUS values
  const getPegSize = () => {
    switch (risk) {
      case 'low': return 'w-6 h-6';     // Larger pegs for low risk
      case 'medium': return 'w-5 h-5';  // Medium pegs
      case 'high': return 'w-4 h-4';    // Smaller pegs for high risk
    }
  };
  
  const currentPegSize = getPegSize();
  
  // Track animated pegs
  const pegRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const pocketRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const multiplierRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const activeHitPegs = useRef<Set<string>>(new Set());
  // Track the last hit peg for each ball to ensure sound plays once per hit
  const lastHitPegRefs = useRef<{[key: number]: string}>({});

  // Set up peg positions for rendering - proper triangular arrangement, skipping entire first row
  const pegPositions = [];
  for (let row = 1; row < rows; row++) {
    // Skip the entire first row by starting from index 1
    const pegsInRow = row + 1;
    
    for (let col = 0; col < pegsInRow; col++) {
      const pegStyle = {
        left: `${50 - (pegsInRow - 1) * 5 + col * 10}%`,
        top: `${5 + (row + 1) * (80 / rows)}%`
      };
      pegPositions.push({ row, col, style: pegStyle });
    }
  }

  // Generate multipliers based on risk level with proper distribution
  const generateMultipliers = (risk: 'low' | 'medium' | 'high', count: number): number[] => {
    // Multiplier ranges based on risk
    const baseValues = {
      low: { min: 0.3, mid: 0.9, max: 9 },
      medium: { min: 0.2, mid: 0.8, max: 50 },
      high: { min: 0.1, mid: 0.3, max: 1000 }
    };
    
    const { min, mid, max } = baseValues[risk];
    const result: number[] = [];
    
    for (let i = 0; i < count; i++) {
      // Calculate position relative to center (0 = middle, 1 = edge)
      const positionFactor = Math.abs((i - (count - 1) / 2) / ((count - 1) / 2));
      
      let value;
      if (risk === 'high') {
        // High risk has extreme values on edges
        if (positionFactor > 0.96) {
          value = max;
        } else if (positionFactor > 0.9) {
          value = max / 8; // 125x
        } else if (positionFactor > 0.8) {
          value = max / 40; // 25x
        } else if (positionFactor > 0.6) {
          value = max / 100; // 10x
        } else if (positionFactor > 0.4) {
          value = max / 250; // 4x
        } else if (positionFactor > 0.2) {
          value = max / 1000; // 1x
        } else {
          value = min; // 0.1x (lowest)
        }
      } else if (risk === 'medium') {
        if (positionFactor > 0.9) {
          value = max; // 50x
        } else if (positionFactor > 0.75) {
          value = max / 5; // 10x
        } else if (positionFactor > 0.5) {
          value = 2;
        } else if (positionFactor > 0.25) {
          value = 0.8;
        } else {
          value = min; // 0.2x
        }
      } else {
        // Low risk
        if (positionFactor > 0.85) {
          value = max; // 9x
        } else if (positionFactor > 0.6) {
          value = 4;
        } else if (positionFactor > 0.4) {
          value = 2;
        } else if (positionFactor > 0.2) {
          value = 0.8;
        } else {
          value = min; // 0.3x
        }
      }
      
      // Round to 1 decimal place for cleaner display
      const roundedValue = Math.round(value * 10) / 10;
      result.push(roundedValue);
    }
    
    return result;
  };

  const multipliers = generateMultipliers(risk, pocketCount);

  // Light up pegs and animate pockets when hit
  useEffect(() => {
    // Reset any previously highlighted pegs
    Object.keys(pegRefs.current).forEach(pegKey => {
      const pegElement = pegRefs.current[pegKey];
      if (pegElement) {
        // Remove animation classes for all pegs at start of frame
        pegElement.classList.remove('peg-hit');
        pegElement.classList.remove('peg-glow');
        delete pegElement.dataset.active;
      }
    });

    // Check if any balls are hitting pegs
    activeBalls.forEach(ball => {
      // If the ball has a lastHitPeg, animate that peg
      if (ball.lastHitPeg) {
        const pegKey = `peg-${ball.lastHitPeg.row}-${ball.lastHitPeg.col}`;
        const pegElement = pegRefs.current[pegKey];
        
        // Keep track of the last peg hit by this ball
        const lastPegKey = lastHitPegRefs.current[ball.id];
        
        // Only play sound and animate if this is a new peg hit for this ball
        if (pegElement && pegKey !== lastPegKey) {
          // Add glow and animation effects
          pegElement.classList.add('peg-hit');
          pegElement.classList.add('peg-glow');
          
          // Play peg hit sound - only once per new peg hit
          playSound('plinkoPeg');
          
          // Mark this peg as the last one hit by this ball
          lastHitPegRefs.current[ball.id] = pegKey;
          
          // Auto-remove the highlight after a short time
          setTimeout(() => {
            if (pegElement) {
              pegElement.classList.remove('peg-hit');
              pegElement.classList.remove('peg-glow');
            }
          }, 150); // Very short duration to match fast game pace
        }
      }
    });

    // Remove tracking for balls that no longer exist
    Object.keys(lastHitPegRefs.current).forEach(ballId => {
      if (!activeBalls.some(ball => ball.id === Number(ballId))) {
        delete lastHitPegRefs.current[Number(ballId)];
      }
    });

    // Handle pocket animations
    activeBalls.forEach(ball => {
      if (ball.inPocket && ball.pocketIndex !== undefined) {
        const pocketKey = `pocket-${ball.pocketIndex}`;
        const pocketElement = pocketRefs.current[pocketKey];
        const multiplierElement = multiplierRefs.current[pocketKey];
        
        if (pocketElement && !pocketElement.dataset.active) {
          // Add more vibrant highlight to the pocket with enhanced animations
          pocketElement.classList.add('pocket-active');
          pocketElement.classList.add('pocket-pulse');
          pocketElement.dataset.active = 'true';
          
          // Enhanced highlight for multiplier text
          if (multiplierElement) {
            multiplierElement.classList.add('multiplier-highlight');
          }
          
          // Play win sound
          playSound('plinkoWin');
          
          // Reset pocket animations after longer delay
          setTimeout(() => {
            if (pocketElement) {
              pocketElement.classList.remove('pocket-active');
              pocketElement.classList.remove('pocket-pulse');
              delete pocketElement.dataset.active;
            }
            if (multiplierElement) {
              multiplierElement.classList.remove('multiplier-highlight');
            }
          }, 1000); // Increased from 500ms to 1000ms for more visible effect
        }
      }
    });
  }, [activeBalls, rows, playSound]);

  // Render pegs in triangular arrangement
  const renderPegs = () => {
    return pegPositions.map(({ row, col, style }) => {
      const pegKey = `peg-${row}-${col}`;
      
      return (
        <div 
          ref={el => pegRefs.current[pegKey] = el}
          key={pegKey}
          data-row={row}
          data-col={col}
          className={`absolute ${currentPegSize} rounded-full ${pegColor} transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150 shadow-md`} 
          style={style}
        />
      );
    });
  };

  // Render balls with improved animations
  const renderBalls = () => {
    return activeBalls.map(ball => {
      // Convert normalized positions to percentages
      const ballX = (ball.x / boardWidth) * 100;
      const ballY = (ball.y / boardHeight) * 100;
      
      // Calculate ball rotation based on velocity
      const rotation = ball.vx * 10;
      
      // Ball scale animation
      const ballScale = ball.scale !== undefined ? ball.scale : 1;
      
      const ballStyle = {
        left: `${ballX}%`,
        top: `${ballY}%`,
        width: `${ballRadius * 2}px`,
        height: `${ballRadius * 2}px`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${ballScale})`,
        transition: ball.growing ? 'transform 0.15s ease-out' : 'transform 0.05s linear',
        boxShadow: '0 0 5px rgba(255, 255, 0, 0.5)',
        opacity: ballScale < 0.3 ? 0.7 : 1
      };
      
      return (
        <div 
          key={`ball-${ball.id}`} 
          className={`absolute rounded-full ${ballColor} shadow-lg z-10`}
          style={ballStyle}
        />
      );
    });
  };

  // Render multiplier buckets with enhanced styling and animations
  const renderMultiplierBuckets = () => {
    return multipliers.map((multiplier, index) => {
      // Determine text and background colors based on multiplier value
      const getMultiplierCategory = (value: number) => {
        if (risk === 'high') {
          if (value >= 10) return 'high';
          if (value >= 1) return 'medium';
          return 'low';
        } else if (risk === 'medium') {
          if (value >= 5) return 'high';
          if (value >= 1) return 'medium';
          return 'low';
        } else {
          if (value >= 4) return 'high';
          if (value >= 1) return 'medium';
          return 'low';
        }
      };
      
      const category = getMultiplierCategory(multiplier);
      const bgColor = bucketColors[risk][category];
      
      // Text styling based on multiplier
      const textColor = 
        multiplier >= 100 ? 'text-yellow-300' :
        multiplier >= 10 ? 'text-yellow-400' :
        multiplier >= 1 ? 'text-white' :
        'text-gray-200';
      
      // Text size based on multiplier length
      const textSize = 
        multiplier >= 100 ? 'text-xs' :
        'text-sm';
      
      return (
        <div 
          key={`bucket-${index}`} 
          className="flex flex-col items-center justify-center h-14"
          style={{ width: `${100 / pocketCount}%` }}
        >
          <div 
            ref={el => pocketRefs.current[`pocket-${index}`] = el}
            className={`w-full h-10 ${bgColor} rounded-md transition-all duration-300 flex items-center justify-center`}
          >
            <div 
              ref={el => multiplierRefs.current[`pocket-${index}`] = el}
              className={`${textSize} font-bold ${textColor} transition-transform duration-300`}
            >
              {multiplier}x
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="relative w-full h-full border-2 border-gray-700 rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-gray-900 overflow-hidden px-2 flex flex-col">
        <div className="flex-grow relative">
          {/* Pegs */}
          {renderPegs()}
          
          {/* Balls */}
          {renderBalls()}
        </div>
        
        {/* Multiplier buckets at the bottom */}
        <div className="flex mb-2">
          {renderMultiplierBuckets()}
        </div>
      </div>
      
      <style>
        {`
        .peg-glow {
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
          z-index: 5;
        }
        
        .peg-hit {
          animation: hit-pulse 0.15s ease-out;
          background-color: #ffffaa;
        }
        
        @keyframes hit-pulse {
          0% { transform: translate(-50%, -50%) scale(1.0); background-color: white; }
          50% { transform: translate(-50%, -50%) scale(1.3); background-color: #ffffaa; }
          100% { transform: translate(-50%, -50%) scale(1.0); background-color: white; }
        }
        
        .pocket-pulse {
          animation: pocket-pulse-animation 0.8s ease-out;
          filter: brightness(1.5);
          z-index: 20;
        }
        
        @keyframes pocket-pulse-animation {
          0% { transform: scaleY(1); filter: brightness(1); }
          40% { transform: scaleY(1.2); filter: brightness(1.8); }
          70% { transform: scaleY(1.1); filter: brightness(1.5); }
          100% { transform: scaleY(1); filter: brightness(1.2); }
        }
        
        .multiplier-highlight {
          animation: multiplier-pop 0.8s ease-out;
          color: white;
          text-shadow: 0 0 12px rgba(255, 255, 255, 1);
          font-weight: bold;
        }
        
        @keyframes multiplier-pop {
          0% { transform: scale(1); }
          40% { transform: scale(1.5); }
          70% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        
        .multiplier-highlight-simple {
          color: white;
          text-shadow: 0 0 5px rgba(255, 255, 255, 0.6);
          font-weight: bold;
        }
        `}
      </style>
    </div>
  );
};

export default PlinkoBoard;
