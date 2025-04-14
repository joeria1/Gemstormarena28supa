
import React, { useState } from 'react';
import CaseBattlesList, { Battle, BattleParticipant } from '../components/CaseBattle/CaseBattlesList';

// Mock creator participants
const mockCreator1: BattleParticipant = {
  id: 'user1',
  name: 'Player123',
  username: 'player123',
  avatar: '/placeholder.svg'
};

const mockCreator2: BattleParticipant = {
  id: 'user2',
  name: 'Gamer456',
  username: 'gamer456',
  avatar: '/placeholder.svg'
};

// Mock data for case battles
const mockBattles: Battle[] = [
  {
    id: '1',
    type: 'High Roller',
    caseType: 'Premium',
    rounds: 3,
    cursedMode: false,
    creator: mockCreator1,
    players: [mockCreator1],
    maxPlayers: 2,
    cost: 100,
    status: 'waiting',
    createdAt: new Date(),
    cases: [{ id: 'case1', name: 'Premium Case', image: '/placeholder.svg', price: 100 }]
  },
  {
    id: '2',
    type: 'Budget',
    caseType: 'Basic',
    rounds: 2,
    cursedMode: true,
    creator: mockCreator2,
    players: [mockCreator2, { id: 'user3', name: 'Casual123', username: 'casual123', avatar: '/placeholder.svg' }, { id: 'user4', name: 'Gamer789', username: 'gamer789', avatar: '/placeholder.svg' }],
    maxPlayers: 4,
    cost: 25,
    status: 'in-progress',
    createdAt: new Date(),
    cases: [{ id: 'case2', name: 'Basic Case', image: '/placeholder.svg', price: 25 }]
  }
];

const CaseBattles = () => {
  // Mock handlers
  const handleJoinBattle = (battleId: string) => {
    console.log("Joining battle:", battleId);
  };

  const handleSpectate = (battleId: string) => {
    console.log("Spectating battle:", battleId);
  };

  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
          Case Battles
        </h1>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
          Compete with other players in epic case opening battles. Create your own battle or join an existing one.
        </p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Active Battles</h2>
        <CaseBattlesList 
          battles={mockBattles} 
          onJoinBattle={handleJoinBattle} 
          onSpectate={handleSpectate}
        />
      </div>
    </div>
  );
};

export default CaseBattles;
