
import React from 'react';
import EnhancedCaseBattleCreator from '../components/CaseBattle/EnhancedCaseBattleCreator';
import EnhancedChatContainer from '../components/Chat/EnhancedChatContainer';

const Crash: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Case Battles</h1>
      
      <EnhancedCaseBattleCreator />
      
      {/* Enhanced Chat Container will appear on the side */}
      <EnhancedChatContainer />
    </div>
  );
};

export default Crash;
