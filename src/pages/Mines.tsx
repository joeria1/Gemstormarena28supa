
import React from 'react';
import { Helmet } from 'react-helmet';
import ImprovedMinesGame from '../components/Mines/ImprovedMinesGame';

const Mines = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Mines | DUMP.FUN</title>
      </Helmet>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Mines</h1>
        <p className="text-gray-400 mt-2">Reveal tiles, avoid mines, and cash out with multipliers!</p>
      </div>
      
      <ImprovedMinesGame />
    </div>
  );
};

export default Mines;
