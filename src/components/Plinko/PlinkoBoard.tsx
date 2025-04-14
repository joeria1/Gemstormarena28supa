
import React from 'react';

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

  const multipliers = {
    low: [1.2, 1.4, 1.6, 1.8, 2.1, 2.4, 2.9, 3.5, 4.9, 8.9],
    medium: [1.5, 1.8, 2.2, 2.6, 3.5, 5.2, 9.5, 16.2, 44, 100],
    high: [2.7, 3.5, 5.2, 8.1, 15, 29, 58, 140, 400, 1000]
  };

  // Generate pegs grid
  const renderPegs = () => {
    const pegs = [];
    
    for (let row = 0; row < rows; row++) {
      const pegsInRow = row + 1;
      
      for (let col = 0; col < pegsInRow; col++) {
        const pegStyle = {
          left: `${50 - (pegsInRow - 1) * 5 + col * 10}%`,
          top: `${(row + 1) * 7}%`
        };
        
        pegs.push(
          <div 
            key={`peg-${row}-${col}`} 
            className={`absolute w-3 h-3 rounded-full ${pegColor} transform -translate-x-1/2 -translate-y-1/2`} 
            style={pegStyle}
          />
        );
      }
    }
    
    return pegs;
  };

  // Render active balls
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
      
      const ballStyle = {
        left: `${50 - (row) * 5 + col * 10}%`,
        top: `${(row + 1) * 7}%`,
        transition: 'all 0.3s ease-out'
      };
      
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
    <div className="relative w-full" style={{ paddingTop: '100%' }}>
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
    </div>
  );
};

export default PlinkoBoard;
