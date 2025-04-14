
import React from 'react';

interface BallResult {
  id: number;
  multiplier: number;
  amount: number;
  timestamp: Date;
}

interface PlinkoResultsProps {
  results: BallResult[];
}

const PlinkoResults: React.FC<PlinkoResultsProps> = ({ results }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Results</h3>
      
      {results.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          No results yet. Drop some balls!
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[500px] pr-1">
          {results.map(result => (
            <div 
              key={result.id} 
              className="bg-gray-700 rounded-lg p-3 mb-2 flex items-center justify-between"
            >
              <div>
                <div className="text-gray-300 text-sm">{formatTime(result.timestamp)}</div>
                <div className="text-white font-medium">${result.amount.toFixed(2)}</div>
              </div>
              <div className={`text-lg font-bold ${
                result.multiplier >= 10 ? 'text-yellow-400' : 
                result.multiplier >= 5 ? 'text-green-400' : 'text-blue-400'
              }`}>
                {result.multiplier}x
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlinkoResults;
