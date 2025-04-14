
import React, { useRef, useEffect } from 'react';
import { useSoundEffect } from '../../hooks/useSoundEffect';

interface PlinkoBoardProps {
  activeBalls: { id: number; path: number[] }[];
  risk: 'low' | 'medium' | 'high';
}

const PlinkoBoard: React.FC<PlinkoBoardProps> = ({ activeBalls, risk }) => {
  const rows = 12;
  const riskColors = {
    low: 'bg-blue-500',
    medium: 'bg-purple-500',
    high: 'bg-red-500'
  };
  
  const pegColor = riskColors[risk];
  const ballColor = 'bg-yellow-400';
  const boardRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSoundEffect();

  // Track peg positions for collision detection
  const pegPositions = useRef<{row: number; col: number; x: number; y: number}[]>([]);

  // Set up peg positions for collision detection
  useEffect(() => {
    if (boardRef.current) {
      const boardWidth = boardRef.current.clientWidth;
      const boardHeight = boardRef.current.clientHeight;
      const positions: {row: number; col: number; x: number; y: number}[] = [];
      
      for (let row = 0; row < rows; row++) {
        const pegsInRow = row + 1;
        
        for (let col = 0; col < pegsInRow; col++) {
          const x = (50 - (pegsInRow - 1) * 5 + col * 10) / 100 * boardWidth;
          const y = ((row + 1) * 7) / 100 * boardHeight;
          
          positions.push({ row, col, x, y });
        }
      }
      
      pegPositions.current = positions;
    }
  }, [rows]);

  const multipliers = {
    low: [1.2, 1.4, 1.6, 1.8, 2.1, 2.4, 2.9, 3.5, 4.9, 8.9],
    medium: [1.5, 1.8, 2.2, 2.6, 3.5, 5.2, 9.5, 16.2, 44, 100],
    high: [2.7, 3.5, 5.2, 8.1, 15, 29, 58, 140, 400, 1000]
  };

  // Generate pegs grid with visual bounce effect
  const renderPegs = () => {
    const pegs = [];
    
    for (let row = 0; row < rows; row++) {
      const pegsInRow = row + 1;
      
      for (let col = 0; col < pegsInRow; col++) {
        const pegStyle = {
          left: `${50 - (pegsInRow - 1) * 5 + col * 10}%`,
          top: `${(row + 1) * 7}%`
        };
        
        // Add a unique key for each peg for ball collision animation
        const pegKey = `peg-${row}-${col}`;
        
        pegs.push(
          <div 
            key={pegKey}
            data-row={row}
            data-col={col}
            className={`absolute w-3 h-3 rounded-full ${pegColor} transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-150`} 
            style={pegStyle}
          />
        );
      }
    }
    
    return pegs;
  };

  // Render active balls with bounce animation
  const renderBalls = () => {
    return activeBalls.map(ball => {
      // Get the last position in the current path
      const currentPath = ball.path;
      const lastPathIndex = currentPath.length - 1;
      
      // Calculate position based on the current row and column
      const row = lastPathIndex;
      const col = currentPath[lastPathIndex];
      
      // If no path is available, don't render the ball
      if (row === undefined || col === undefined) return null;
      
      // Calculate the position with a slight wiggle effect for the bounce
      const wiggle = Math.sin(Date.now() / 200) * 2; // Subtle side-to-side motion
      
      const ballStyle = {
        left: `${50 - (row) * 5 + col * 10 + wiggle}%`,
        top: `${(row + 1) * 7}%`,
        transition: 'all 0.3s cubic-bezier(0.42, 0, 0.58, 1)', // Bounce effect
        animation: 'bounce 0.3s ease-out'
      };
      
      // Play peg hit sound when ball moves
      if (row > 0 && row !== ball.path.length - 2) {
        // Only play the sound when the ball has actually moved to a new position
        playSound('plinkoPeg');
      }
      
      console.log(`Ball ${ball.id} at row ${row}, col ${col}`);
      
      return (
        <div 
          key={`ball-${ball.id}`} 
          className={`absolute w-4 h-4 rounded-full ${ballColor} shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10`} 
          style={ballStyle}
        />
      );
    });
  };

  // Render multiplier buckets at the bottom
  const renderMultiplierBuckets = () => {
    const currentMultipliers = multipliers[risk];
    
    return currentMultipliers.map((multiplier, index) => (
      <div 
        key={`bucket-${index}`} 
        className="flex flex-col items-center justify-center h-16 text-white font-bold"
        style={{ width: `${100 / currentMultipliers.length}%` }}
      >
        <div className={`w-full h-2 ${riskColors[risk]}`}></div>
        <div className="mt-2">{multiplier}x</div>
      </div>
    ));
  };

  return (
    <div className="relative w-full" style={{ paddingTop: '100%' }} ref={boardRef}>
      <div className="absolute inset-0 bg-gray-900">
        {/* Pegs */}
        {renderPegs()}
        
        {/* Balls */}
        {renderBalls()}
        
        {/* Multiplier buckets at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex">
          {renderMultiplierBuckets()}
        </div>
      </div>
      
      {/* Add bounce animation keyframes */}
      <style jsx>{`
        @keyframes bounce {
          0% { transform: scale(1) translate(-50%, -50%); }
          50% { transform: scale(1.2) translate(-50%, -50%); }
          100% { transform: scale(1) translate(-50%, -50%); }
        }
      `}</style>
    </div>
  );
};

export default PlinkoBoard;
