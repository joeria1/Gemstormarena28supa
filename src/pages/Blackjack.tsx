
import React from 'react';
import { Helmet } from 'react-helmet';
import EnhancedBlackjackGame from '../components/Blackjack/EnhancedBlackjackGame';

const Blackjack = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Blackjack | DUMP.FUN</title>
      </Helmet>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Blackjack</h1>
        <p className="text-gray-400 mt-2">Play up to 3 hands simultaneously and beat the dealer to win!</p>
      </div>
      
      <EnhancedBlackjackGame minBet={10} maxBet={1000} />
    </div>
  );
};

export default Blackjack;
