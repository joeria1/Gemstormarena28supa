
import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import EnhancedBlackjackGame from '../components/Blackjack/EnhancedBlackjackGame';
import EnhancedMinesGame from '../components/Mines/EnhancedMinesGame';
import EnhancedHorseRacing from '../components/HorseRacing/EnhancedHorseRacing';

const EnhancedGames = () => {
  const { game } = useParams<{ game: string }>();
  
  const renderGame = () => {
    switch (game) {
      case 'blackjack':
        return <EnhancedBlackjackGame />;
      case 'mines':
        return <EnhancedMinesGame />;
      case 'horse-racing':
        return <EnhancedHorseRacing />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-400 mb-3">Game Not Found</h2>
            <p className="text-gray-300">The game you're looking for is not available.</p>
          </div>
        );
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container max-w-6xl mx-auto px-4 py-8"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">
          {game === 'blackjack' && 'Blackjack'}
          {game === 'mines' && 'Mines'}
          {game === 'horse-racing' && 'Horse Racing'}
        </h1>
        <p className="text-gray-400">
          {game === 'blackjack' && 'Beat the dealer to 21 without going over.'}
          {game === 'mines' && 'Avoid the mines and collect the gems.'}
          {game === 'horse-racing' && 'Bet on horses and win big.'}
        </p>
      </div>
      
      {renderGame()}
    </motion.div>
  );
};

export default EnhancedGames;
