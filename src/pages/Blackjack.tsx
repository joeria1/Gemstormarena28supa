
import React, { useState } from 'react';
import EnhancedBlackjackGame from '../components/Blackjack/EnhancedBlackjackGame';

const tables = [
  {
    id: 1,
    name: 'Beginner Table',
    minBet: 10,
    maxBet: 100,
    backgroundColor: 'bg-gradient-to-br from-emerald-800 to-emerald-900',
    borderColor: 'border-emerald-600',
  },
  {
    id: 2,
    name: 'Standard Table',
    minBet: 50,
    maxBet: 500,
    backgroundColor: 'bg-gradient-to-br from-blue-800 to-blue-900',
    borderColor: 'border-blue-600',
  },
  {
    id: 3,
    name: 'High Roller',
    minBet: 100,
    maxBet: 1000,
    backgroundColor: 'bg-gradient-to-br from-purple-800 to-purple-900',
    borderColor: 'border-purple-600',
  },
  {
    id: 4,
    name: 'VIP Table',
    minBet: 500,
    maxBet: 5000,
    backgroundColor: 'bg-gradient-to-br from-red-800 to-red-900',
    borderColor: 'border-red-600',
  },
];

const Blackjack = () => {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  const selectTable = (tableId: number) => {
    setSelectedTable(tableId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      {selectedTable === null ? (
        <div className="container mx-auto py-8">
          <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-600">
            Blackjack Tables
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tables.map((table) => (
              <div
                key={table.id}
                onClick={() => selectTable(table.id)}
                className={`${table.backgroundColor} ${table.borderColor} border-2 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer`}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-black bg-opacity-30" />
                  <div className="h-40 flex items-center justify-center">
                    <div className="relative z-10 p-6 text-center">
                      <div className="w-20 h-20 mx-auto mb-4 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <svg 
                          className="w-12 h-12 text-white" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" 
                          />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold">{table.name}</h2>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4 bg-black bg-opacity-50">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Min Bet:</span>
                    <span className="font-semibold text-yellow-400">${table.minBet}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Max Bet:</span>
                    <span className="font-semibold text-yellow-400">${table.maxBet}</span>
                  </div>
                  <button className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold rounded-lg transition transform hover:scale-105">
                    Play Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start">
            <div className="mb-6 lg:mb-0">
              <button
                onClick={() => setSelectedTable(null)}
                className="flex items-center mb-6 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition duration-300"
              >
                <svg
                  className="w-5 h-5 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Tables
              </button>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl border border-gray-700 p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-600">
                  {tables.find((t) => t.id === selectedTable)?.name}
                </h2>
                <div className="flex justify-between mb-4">
                  <span className="text-gray-400">Min Bet:</span>
                  <span className="font-semibold text-yellow-400">
                    ${tables.find((t) => t.id === selectedTable)?.minBet}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Bet:</span>
                  <span className="font-semibold text-yellow-400">
                    ${tables.find((t) => t.id === selectedTable)?.maxBet}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className={`${tables.find((t) => t.id === selectedTable)?.backgroundColor} rounded-t-xl p-6 shadow-lg`}>
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white drop-shadow-lg">
                  Blackjack
                </h1>
              </div>
              <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-b-xl shadow-lg border border-gray-700">
                <EnhancedBlackjackGame 
                  minBet={tables.find((t) => t.id === selectedTable)?.minBet || 10}
                  maxBet={tables.find((t) => t.id === selectedTable)?.maxBet || 100}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blackjack;
