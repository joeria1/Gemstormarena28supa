
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Gem, Plus, Minus, Trash, Trophy } from 'lucide-react';
import { useUser } from '@/context/UserContext';

interface Case {
  id: string;
  name: string;
  price: number;
  image: string;
  rarity: string;
}

const availableCases: Case[] = [
  { id: '1', name: 'Starter Case', price: 50, image: '/placeholder.svg', rarity: 'common' },
  { id: '2', name: 'Uncommon Case', price: 100, image: '/placeholder.svg', rarity: 'uncommon' },
  { id: '3', name: 'Rare Case', price: 250, image: '/placeholder.svg', rarity: 'rare' },
  { id: '4', name: 'Epic Case', price: 500, image: '/placeholder.svg', rarity: 'epic' },
  { id: '5', name: 'Legendary Case', price: 1000, image: '/placeholder.svg', rarity: 'legendary' }
];

interface ImprovedCaseBattleCreatorProps {
  onCreateBattle: (battleSettings: any) => void;
}

const ImprovedCaseBattleCreator: React.FC<ImprovedCaseBattleCreatorProps> = ({ onCreateBattle }) => {
  const { user } = useUser();
  const [selectedCases, setSelectedCases] = useState<Case[]>([]);
  const [playersCount, setPlayersCount] = useState(2);
  const [isPrivate, setIsPrivate] = useState(false);
  
  const totalCost = selectedCases.reduce((sum, c) => sum + c.price, 0);
  
  const handleAddCase = (caseItem: Case) => {
    if (selectedCases.length >= 5) {
      toast.error("Maximum 5 cases per battle");
      return;
    }
    
    setSelectedCases(prev => [...prev, caseItem]);
  };
  
  const handleRemoveCase = (index: number) => {
    setSelectedCases(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleCreateBattle = () => {
    if (selectedCases.length === 0) {
      toast.error("Please select at least one case");
      return;
    }
    
    if (!user) {
      toast.error("Please log in to create a battle");
      return;
    }
    
    if (user.balance < totalCost) {
      toast.error("Insufficient balance to create this battle");
      return;
    }
    
    const battleSettings = {
      cases: selectedCases,
      players: playersCount,
      private: isPrivate,
      totalCost
    };
    
    onCreateBattle(battleSettings);
    toast.success("Battle created successfully!");
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-4">Create a Case Battle</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-300 mb-2">Select Cases</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {availableCases.map(caseItem => (
            <button
              key={caseItem.id}
              onClick={() => handleAddCase(caseItem)}
              className="bg-gray-900 border border-gray-700 rounded-lg p-2 hover:bg-gray-700 transition-colors"
            >
              <div className="text-center">
                <img src={caseItem.image} alt={caseItem.name} className="w-full h-20 object-contain mb-2" />
                <div className="text-white text-sm font-medium">{caseItem.name}</div>
                <div className="flex justify-center items-center mt-1">
                  <Gem className="h-3 w-3 text-yellow-400 mr-1" />
                  <span className="text-yellow-400 text-sm">{caseItem.price}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-300 mb-2">Your Battle</h3>
        
        {selectedCases.length > 0 ? (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-5 gap-2 mb-4">
              {selectedCases.map((caseItem, index) => (
                <div key={index} className="relative">
                  <button
                    onClick={() => handleRemoveCase(index)}
                    className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 z-10"
                  >
                    <Trash className="h-3 w-3 text-white" />
                  </button>
                  <div className="bg-gray-800 border border-gray-700 rounded p-2">
                    <img src={caseItem.image} alt={caseItem.name} className="w-full h-12 object-contain mb-1" />
                    <div className="text-xs text-center text-white">{caseItem.name}</div>
                    <div className="flex justify-center items-center mt-1">
                      <Gem className="h-3 w-3 text-yellow-400 mr-1" />
                      <span className="text-yellow-400 text-xs">{caseItem.price}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {Array(5 - selectedCases.length).fill(0).map((_, index) => (
                <div key={`empty-${index}`} className="border border-dashed border-gray-700 rounded p-2 flex items-center justify-center h-24">
                  <Plus className="h-4 w-4 text-gray-600" />
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-gray-300 mr-2">Players:</span>
                <div className="inline-flex items-center bg-gray-800 rounded-md">
                  <button
                    onClick={() => setPlayersCount(prev => Math.max(2, prev - 1))}
                    className="px-2 py-1 text-gray-400 hover:text-white"
                    disabled={playersCount <= 2}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-3 text-white">{playersCount}</span>
                  <button
                    onClick={() => setPlayersCount(prev => Math.min(4, prev + 1))}
                    className="px-2 py-1 text-gray-400 hover:text-white"
                    disabled={playersCount >= 4}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center">
                <span className="text-gray-300 mr-2">Total Cost:</span>
                <span className="flex items-center text-yellow-400 font-bold">
                  <Gem className="h-4 w-4 mr-1 text-yellow-400" />
                  {totalCost}
                </span>
              </div>
            </div>
            
            <Button 
              onClick={handleCreateBattle}
              className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
              disabled={!user || user.balance < totalCost}
            >
              <Trophy className="h-4 w-4 mr-2" />
              Create Battle
            </Button>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center">
            <div className="text-gray-400 mb-2">Select cases to create your battle</div>
            <div className="text-sm text-gray-500">Cases will appear here</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImprovedCaseBattleCreator;
