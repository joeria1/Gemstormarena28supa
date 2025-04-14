
import React from 'react';
import { Helmet } from 'react-helmet';
import ImprovedMinesGame from '../components/Mines/ImprovedMinesGame';
import { Diamond } from 'lucide-react';

const Mines = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Mines | DUMP.FUN</title>
      </Helmet>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Mines</h1>
        <p className="text-gray-400 mt-2 flex items-center justify-center gap-2">
          <Diamond className="h-4 w-4 text-blue-400" /> 
          Reveal tiles, avoid mines, and cash out with multipliers!
        </p>
      </div>
      
      <ImprovedMinesGame />
    </div>
  );
};

export default Mines;
