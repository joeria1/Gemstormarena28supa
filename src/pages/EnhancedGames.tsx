
import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import EnhancedBlackjackGame from '../components/Blackjack/EnhancedBlackjackGame';
import EnhancedMinesGame from '../components/Mines/EnhancedMinesGame';
import EnhancedHorseRacing from '../components/HorseRacing/EnhancedHorseRacing';
import Tower from './Tower';
import LightningEffect from '../components/GameEffects/LightningEffect';

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
      case 'tower':
        return <Tower />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-400 mb-3">Game Not Found</h2>
            <p className="text-gray-300">The game you're looking for is not available.</p>
          </div>
        );
    }
  };
  
  const getGameDetails = () => {
    switch (game) {
      case 'blackjack':
        return {
          title: 'Blackjack',
          description: 'Beat the dealer to 21 without going over.'
        };
      case 'mines':
        return {
          title: 'Mines',
          description: 'Avoid the mines and collect the gems.'
        };
      case 'horse-racing':
        return {
          title: 'Horse Racing',
          description: 'Bet on horses and win big.'
        };
      case 'tower':
        return {
          title: 'Tower',
          description: 'Climb the tower and avoid the bombs to win big.'
        };
      default:
        return {
          title: 'Game Not Found',
          description: 'This game is not available.'
        };
    }
  };
  
  const gameDetails = getGameDetails();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container max-w-6xl mx-auto px-4 py-8"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">{gameDetails.title}</h1>
        <p className="text-gray-400">{gameDetails.description}</p>
      </div>
      
      {renderGame()}
    </motion.div>
  );
};

export default EnhancedGames;
