
import React from 'react';

interface PlinkoControlsProps {
  betAmount: number;
  setBetAmount: (amount: number) => void;
  risk: 'low' | 'medium' | 'high';
  setRisk: (risk: 'low' | 'medium' | 'high') => void;
  onDrop: () => void;
  balance: number;
}

const PlinkoControls: React.FC<PlinkoControlsProps> = ({ 
  betAmount, 
  setBetAmount, 
  risk, 
  setRisk, 
  onDrop,
  balance
}) => {
  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setBetAmount(value);
    }
  };

  const quickBetValues = [5, 10, 25, 50, 100];

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-gray-300 mb-1">Bet Amount</label>
          <div className="flex items-center">
            <input
              type="number"
              value={betAmount}
              onChange={handleBetChange}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2"
              min="1"
              step="1"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {quickBetValues.map(value => (
              <button
                key={`bet-${value}`}
                onClick={() => setBetAmount(value)}
                className={`px-2 py-1 text-sm rounded ${
                  betAmount === value ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white'
                }`}
              >
                ${value}
              </button>
            ))}
            <button
              onClick={() => setBetAmount(Math.max(1, Math.floor(balance / 2)))}
              className="px-2 py-1 text-sm rounded bg-gray-700 text-white"
            >
              1/2
            </button>
            <button
              onClick={() => setBetAmount(Math.max(1, Math.floor(balance)))}
              className="px-2 py-1 text-sm rounded bg-gray-700 text-white"
            >
              Max
            </button>
          </div>
        </div>
        
        <div className="flex-1">
          <label className="block text-gray-300 mb-1">Risk Level</label>
          <div className="flex gap-2">
            <button
              onClick={() => setRisk('low')}
              className={`flex-1 py-2 rounded ${
                risk === 'low' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'
              }`}
            >
              Low
            </button>
            <button
              onClick={() => setRisk('medium')}
              className={`flex-1 py-2 rounded ${
                risk === 'medium' ? 'bg-purple-500 text-white' : 'bg-gray-700 text-white'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setRisk('high')}
              className={`flex-1 py-2 rounded ${
                risk === 'high' ? 'bg-red-500 text-white' : 'bg-gray-700 text-white'
              }`}
            >
              High
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <button
          onClick={onDrop}
          disabled={betAmount > balance}
          className={`w-full py-3 rounded-lg font-bold text-lg ${
            betAmount > balance
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700'
          }`}
        >
          Drop Ball
        </button>
      </div>
    </div>
  );
};

export default PlinkoControls;
