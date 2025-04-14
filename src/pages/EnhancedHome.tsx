import React, { useEffect, useState } from 'react';
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import CaseBattlesList from '../components/CaseBattle/CaseBattlesList';
import { RocketLogo } from '../components/RocketLogo';
import GameCard from '../components/GameCard';
import { useToast } from "../components/ui/use-toast";
import DailyFreeCase from '../components/Rewards/DailyFreeCase';
import { Trophy, Dice1 as Dice, ChevronRight, Zap, Users, Gift, CircleDot } from 'lucide-react';
import HomepagePopup from '../components/HomePage/HomepagePopup';

const EnhancedHome = () => {
  const { toast } = useToast();
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [battles, setBattles] = useState([]);
  
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
      localStorage.setItem('hasVisitedBefore', 'true');
    } else {
      setShowWelcomePopup(true);
      setTimeout(() => setShowWelcomePopup(false), 5000);
    }
    
    // Mock battle data for demonstration
    const mockBattles = [
      {
        id: '1',
        type: '1v1',
        caseType: 'Standard',
        rounds: 3,
        cursedMode: false,
        creator: {
          id: 'user1',
          name: 'Player1',
          username: 'player1',
          avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Player1'
        },
        players: [
          {
            id: 'user1',
            name: 'Player1',
            username: 'player1',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Player1'
          }
        ],
        maxPlayers: 2,
        cost: 100,
        status: 'waiting',
        createdAt: new Date(),
        cases: [
          {
            id: 'case1',
            name: 'Standard Case',
            image: '/placeholder.svg',
            price: 100
          }
        ]
      },
      {
        id: '2',
        type: '2v2',
        caseType: 'Premium',
        rounds: 5,
        cursedMode: true,
        creator: {
          id: 'user2',
          name: 'Player2',
          username: 'player2',
          avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Player2'
        },
        players: [
          {
            id: 'user2',
            name: 'Player2',
            username: 'player2',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Player2'
          },
          {
            id: 'user3',
            name: 'Player3',
            username: 'player3',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Player3'
          }
        ],
        maxPlayers: 4,
        cost: 250,
        status: 'in-progress',
        createdAt: new Date(),
        cases: [
          {
            id: 'case2',
            name: 'Premium Case',
            image: '/placeholder.svg',
            price: 250
          }
        ]
      }
    ];
    
    setBattles(mockBattles);
  }, []);

  const games = [
    { title: "Case Battles", icon: <Trophy size={24} />, path: "/case-battles", description: "Battle against others for the best drops" },
    { title: "Crash", icon: <RocketLogo className="w-6 h-6" />, path: "/crash", description: "Cash out before the rocket crashes" },
    { title: "Blackjack", icon: <Dice size={24} />, path: "/blackjack", description: "Beat the dealer to 21" },
    { title: "Mines", icon: <Zap size={24} />, path: "/mines", description: "Avoid the mines, collect the gems" },
    { title: "Tower", icon: <ChevronRight size={24} />, path: "/tower", description: "Climb to win big prizes" },
    { title: "Horse Racing", icon: <Users size={24} />, path: "/horse-racing", description: "Bet on your favorite horse" },
    { title: "Plinko", icon: <CircleDot size={24} />, path: "/plinko", description: "Watch balls bounce for big wins" },
  ];

  const handleJoinBattle = (battleId: string) => {
    toast({
      title: "Joining Battle",
      description: `Attempting to join battle ${battleId}`,
    });
    // In a real app, this would call an API to join the battle
  };

  const handleSpectateBattle = (battleId: string) => {
    toast({
      title: "Spectating Battle",
      description: `Now spectating battle ${battleId}`,
    });
    // In a real app, this would navigate to a battle view page
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pb-16">
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-[url('/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png')] bg-cover bg-center"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
          >
            DUMP.FUN
          </motion.h1>
          <motion.p 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-xl md:text-2xl mb-8"
          >
            Profit from Market Volatility with Thrilling Games
          </motion.p>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Link to="/cases">
              <Button variant="default" size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all">
                Open Cases Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <section className="py-12 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Your Daily Reward</h2>
        <div className="flex justify-center">
          <DailyFreeCase />
        </div>
      </section>

      <section className="py-12 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Popular Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <motion.div
              key={game.title}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="transition-all duration-300"
            >
              <Link to={game.path}>
                <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-all duration-300 h-full overflow-hidden relative">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 mr-4">
                        {game.icon}
                      </div>
                      <h3 className="text-xl font-bold">{game.title}</h3>
                    </div>
                    <p className="text-gray-300">{game.description}</p>
                    <div className="mt-4 flex justify-end">
                      <Button variant="ghost" className="group">
                        Play Now <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-12 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Live Case Battles</h2>
        <CaseBattlesList 
          onJoinBattle={handleJoinBattle} 
          onSpectate={handleSpectateBattle} 
        />
      </section>

      {/* Replace the old popup with our new enhanced one */}
      <HomepagePopup isOpen={showWelcomePopup} onClose={() => setShowWelcomePopup(false)} />
    </div>
  );
};

export default EnhancedHome;
