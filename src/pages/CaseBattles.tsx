
import React, { useState } from 'react';
import CaseBattlesList from '@/components/CaseBattle/CaseBattlesList';
import EnhancedCaseBattles from './EnhancedCaseBattles';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const CaseBattles = () => {
  const [isCreating, setIsCreating] = useState(false);

  if (isCreating) {
    return <EnhancedCaseBattles onBack={() => setIsCreating(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#080F1C] text-white pb-10">
      <div className="w-full max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Case Battles</h1>
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-[#00d7a3] hover:bg-[#00bf8f] text-white rounded-md transition-colors"
          >
            <Plus size={18} className="mr-1" />
            Create Battle
          </Button>
        </div>
        <CaseBattlesList />
      </div>
    </div>
  );
};

export default CaseBattles;
