
import React from 'react';
import { Helmet } from 'react-helmet';
import SimplifiedCaseBattleGame from '../components/CaseBattle/SimplifiedCaseBattleGame';

const CaseBattles = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Case Battles | DUMP.FUN</title>
      </Helmet>
      
      <SimplifiedCaseBattleGame />
    </div>
  );
};

export default CaseBattles;
