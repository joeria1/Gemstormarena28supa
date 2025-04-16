
import React from 'react';
import CaseBattlesList from '@/components/CaseBattle/CaseBattlesList';
import EnhancedCaseBattles from './EnhancedCaseBattles';

const CaseBattles = () => {
  // Show the enhanced version - uncomment the following line
  return <EnhancedCaseBattles />;
  
  // For now, use the list component which has all the implementation
  // return <CaseBattlesList />;
};

export default CaseBattles;
