
import React, { useState, useEffect } from 'react';
import CaseBattlesList, { Battle, BattleParticipant } from '../components/CaseBattle/CaseBattlesList';
import ImprovedCaseBattleCreator from '../components/CaseBattle/ImprovedCaseBattleCreator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import LightningEffect from '../components/GameEffects/LightningEffect';
import PulseAnimation from '../components/GameEffects/PulseAnimation';

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
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [showLightning, setShowLightning] = useState(false);
  
  // Show lightning effect occasionally
  useEffect(() => {
    const lightningTimer = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance
        setShowLightning(true);
        setTimeout(() => setShowLightning(false), 2000);
      }
    }, 15000); // Every 15 seconds check
    
    return () => clearInterval(lightningTimer);
  }, []);
  
  // Show lightning when switching to create tab
  useEffect(() => {
    if (activeTab === 'create') {
      setShowLightning(true);
      setTimeout(() => setShowLightning(false), 2000);
    }
  }, [activeTab]);

  // Mock handlers
  const handleJoinBattle = (battleId: string) => {
    console.log("Joining battle:", battleId);
  };

  const handleSpectate = (battleId: string) => {
    console.log("Spectating battle:", battleId);
  };

  const handleCreateBattle = (battleConfig: any) => {
    console.log("Creating battle with config:", battleConfig);
  };

  const handleCancelCreation = () => {
    setActiveTab('list');
  };

  return (
    <div className="container py-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <PulseAnimation isActive={true} intensity="low" duration={3} type="glow" color="255, 205, 43">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
            Case Battles
          </h1>
        </PulseAnimation>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
          Compete with other players in epic case opening battles. Create your own battle or join an existing one.
        </p>
      </motion.div>

      <Tabs defaultValue="list" className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="bg-gray-800 border border-gray-700">
            <TabsTrigger 
              value="list" 
              onClick={() => setActiveTab('list')}
              className={`${activeTab === 'list' ? 'bg-primary text-white' : 'text-gray-400'} px-8 py-3`}
            >
              Active Battles
            </TabsTrigger>
            <TabsTrigger 
              value="create" 
              onClick={() => setActiveTab('create')}
              className={`${activeTab === 'create' ? 'bg-primary text-white' : 'text-gray-400'} px-8 py-3`}
            >
              Create Battle
            </TabsTrigger>
          </TabsList>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <TabsContent value="list" className="mt-0">
            <CaseBattlesList 
              battles={mockBattles} 
              onJoinBattle={handleJoinBattle} 
              onSpectate={handleSpectate}
            />
          </TabsContent>

          <TabsContent value="create" className="mt-0">
            <ImprovedCaseBattleCreator 
              onCreateBattle={handleCreateBattle}
              onCancel={handleCancelCreation}
              userBalance={1000}
            />
          </TabsContent>
        </motion.div>
      </Tabs>
      
      {/* Lightning effect for dramatic moments */}
      <LightningEffect isVisible={showLightning} onComplete={() => setShowLightning(false)} />
    </div>
  );
};

export default CaseBattles;
