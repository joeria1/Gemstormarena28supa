
import React, { useState } from 'react';
import CaseBattleGame from './CaseBattleGame';
import { toast } from 'sonner';

interface CaseOption {
  id: string;
  name: string;
  price: number;
  image: string;
}

const mockCases: CaseOption[] = [
  { id: '1', name: 'Basic Case', price: 100, image: '/placeholder.svg' },
  { id: '2', name: 'Premium Case', price: 250, image: '/placeholder.svg' },
  { id: '3', name: 'Luxury Case', price: 500, image: '/placeholder.svg' },
  { id: '4', name: 'Extreme Case', price: 1000, image: '/placeholder.svg' },
];

const EnhancedCaseBattleCreator: React.FC = () => {
  const [selectedCases, setSelectedCases] = useState<CaseOption[]>([]);
  const [battleSettings, setBattleSettings] = useState({
    roundsPerPlayer: 1,
    maxPlayers: 2,
    isPrivate: false,
  });
  const [battleId, setBattleId] = useState<string | null>(null);
  const [showGame, setShowGame] = useState(false);
  
  const handleAddCase = (caseOption: CaseOption) => {
    setSelectedCases(prev => [...prev, caseOption]);
  };
  
  const handleRemoveCase = (index: number) => {
    setSelectedCases(prev => prev.filter((_, i) => i !== index));
  };
  
  const calculateTotalCost = () => {
    return selectedCases.reduce((total, caseOption) => total + caseOption.price, 0);
  };
  
  const handleCreateBattle = () => {
    if (selectedCases.length === 0) {
      toast.error("Please add at least one case to the battle");
      return;
    }
    
    // Generate a random battle ID
    const newBattleId = Math.random().toString(36).substring(2, 10).toUpperCase();
    setBattleId(newBattleId);
    setShowGame(true);
    toast.success("Battle created successfully!");
  };
  
  const handleCloseGame = () => {
    setShowGame(false);
    setBattleId(null);
    setSelectedCases([]);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-white">
      <h2 className="text-2xl font-bold mb-6">Create Case Battle</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Available Cases</h3>
          <div className="grid grid-cols-2 gap-2">
            {mockCases.map(caseOption => (
              <div 
                key={caseOption.id}
                className="border border-gray-700 rounded-lg p-3 bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => handleAddCase(caseOption)}
              >
                <div className="flex justify-center mb-2">
                  <img src={caseOption.image} alt={caseOption.name} className="w-16 h-16 object-contain" />
                </div>
                <p className="font-medium text-center">{caseOption.name}</p>
                <p className="text-yellow-400 text-center font-bold">{caseOption.price} gems</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Battle Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Rounds per Player</label>
                <select 
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                  value={battleSettings.roundsPerPlayer}
                  onChange={(e) => setBattleSettings({...battleSettings, roundsPerPlayer: Number(e.target.value)})}
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Max Players</label>
                <select 
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                  value={battleSettings.maxPlayers}
                  onChange={(e) => setBattleSettings({...battleSettings, maxPlayers: Number(e.target.value)})}
                >
                  {[2, 3, 4].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="private-battle"
                  checked={battleSettings.isPrivate}
                  onChange={(e) => setBattleSettings({...battleSettings, isPrivate: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="private-battle">Private Battle</label>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">Selected Cases</h3>
          {selectedCases.length === 0 ? (
            <div className="border border-dashed border-gray-700 rounded-lg p-8 text-center text-gray-500">
              Click on cases from the left to add them to your battle
            </div>
          ) : (
            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
              {selectedCases.map((caseOption, index) => (
                <div key={index} className="flex items-center justify-between mb-2 p-2 bg-gray-700 rounded">
                  <div className="flex items-center">
                    <img src={caseOption.image} alt={caseOption.name} className="w-10 h-10 object-contain mr-3" />
                    <div>
                      <p className="font-medium">{caseOption.name}</p>
                      <p className="text-sm text-yellow-400">{caseOption.price} gems</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveCase(index)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex justify-between font-bold">
                  <span>Total Cost:</span>
                  <span className="text-yellow-400">{calculateTotalCost()} gems</span>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleCreateBattle}
            disabled={selectedCases.length === 0}
            className={`w-full mt-6 py-3 rounded-md font-bold ${
              selectedCases.length === 0 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
            } transition-all`}
          >
            Create Battle
          </button>
        </div>
      </div>
      
      {showGame && battleId && (
        <CaseBattleGame battleId={battleId} onClose={handleCloseGame} />
      )}
    </div>
  );
};

export default EnhancedCaseBattleCreator;
