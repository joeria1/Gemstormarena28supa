
import React from 'react';
import { useUser } from '../context/UserContext';

const Home = () => {
  const { user } = useUser();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-gray-900 rounded-lg p-8 shadow-lg max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome to DUMP.FUN</h1>
        
        <div className="bg-blue-900/20 p-6 rounded-lg mb-8 border border-blue-800/30">
          <h2 className="text-xl font-bold mb-4 text-blue-300">Welcome back, {user.username}!</h2>
          <p className="text-gray-300 mb-4">
            Your balance: ${user.balance.toFixed(2)}
          </p>
          <p className="text-gray-400">
            Start playing games to earn more rewards!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
            <h3 className="text-lg font-bold mb-2">Popular Games</h3>
            <ul className="list-disc list-inside text-gray-400 space-y-1">
              <li>Case Battles</li>
              <li>Mines</li>
              <li>Blackjack</li>
              <li>Crash</li>
            </ul>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-green-500 transition-colors">
            <h3 className="text-lg font-bold mb-2">Latest Promotions</h3>
            <ul className="list-disc list-inside text-gray-400 space-y-1">
              <li>Daily Rewards</li>
              <li>Weekend Bonus</li>
              <li>Referral Program</li>
              <li>Level-up Rewards</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
