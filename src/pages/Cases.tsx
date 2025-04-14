
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import ImprovedCaseBattleCreator from '../components/CaseBattle/ImprovedCaseBattleCreator';
import CaseBattlesList from '../components/CaseBattle/CaseBattlesList';
import ImprovedCaseBattleGame from '../components/CaseBattle/ImprovedCaseBattleGame';

const Cases = () => {
  const [activeBattleId, setActiveBattleId] = useState<string | null>(null);
  
  const handleCreateBattle = (battleSettings: any) => {
    // In a real app, you'd create a battle on the server
    // For now, we'll just generate a random ID
    const newBattleId = `battle-${Math.floor(Math.random() * 10000)}`;
    setActiveBattleId(newBattleId);
  };
  
  const handleJoinBattle = (battleId: string) => {
    setActiveBattleId(battleId);
  };
  
  const handleCloseBattle = () => {
    setActiveBattleId(null);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Case Battles | DUMP.FUN</title>
      </Helmet>
      
      {activeBattleId ? (
        <ImprovedCaseBattleGame 
          battleId={activeBattleId}
          onClose={handleCloseBattle}
        />
      ) : (
        <>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Case Battles</h1>
            <p className="text-gray-400 mt-2">Challenge other players and win valuable items!</p>
          </div>
          
          <div className="space-y-8">
            <ImprovedCaseBattleCreator onCreateBattle={handleCreateBattle} />
            <CaseBattlesList onJoinBattle={handleJoinBattle} />
          </div>
        </>
      )}
    </div>
  );
};

export default Cases;
