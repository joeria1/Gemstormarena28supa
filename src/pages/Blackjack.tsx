
import React, { useState, useEffect } from 'react';
import EnhancedBlackjackGame from '../components/Blackjack/EnhancedBlackjackGame';
import { motion } from 'framer-motion';
import ChatWindow from '../components/Chat/ChatWindow';
import { Card } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Helmet } from 'react-helmet';
import PulseAnimation from '../components/GameEffects/PulseAnimation';

const Blackjack = () => {
  // Animation states
  const [showEntranceAnimation, setShowEntranceAnimation] = useState(true);

  useEffect(() => {
    // Hide entrance animation after 1 second
    const timer = setTimeout(() => {
      setShowEntranceAnimation(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container py-6 mx-auto">
      <Helmet>
        <title>Blackjack - Crypto Casino</title>
        <meta name="description" content="Play classic Blackjack with crypto" />
      </Helmet>

      {/* Entrance animation */}
      {showEntranceAnimation && (
        <motion.div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          onAnimationComplete={() => setShowEntranceAnimation(false)}
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <div className="flex items-center space-x-2 text-4xl font-bold text-white">
              <span className="text-red-600">♥</span>
              <span>Blackjack</span>
              <span className="text-red-600">♦</span>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-6 text-center">
          <PulseAnimation isActive={true} intensity="low" duration={2} type="glow" color="255, 215, 0">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
              Blackjack
            </h1>
          </PulseAnimation>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Beat the dealer to 21 without going over. Blackjack pays 3:2. Dealer stands on soft 17.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-b from-green-900/60 to-green-950/80 backdrop-blur-sm">
                <EnhancedBlackjackGame />
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <Card className="p-6 bg-black/40 backdrop-blur-sm border-0 shadow-lg">
                <h2 className="text-xl font-bold mb-3 text-white">How to Play</h2>
                <Separator className="bg-white/10 my-3" />
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">•</span>
                    <span>Get closer to 21 than the dealer without going over</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">•</span>
                    <span>Face cards are worth 10, Aces are 1 or 11</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">•</span>
                    <span>Blackjack (A + 10 value card) pays 3:2</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">•</span>
                    <span>Dealer must hit on 16 or less and stand on 17+</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-black/40 backdrop-blur-sm border-0 shadow-lg">
                <h2 className="text-xl font-bold mb-3 text-white">Payouts</h2>
                <Separator className="bg-white/10 my-3" />
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex justify-between">
                    <span>Win</span>
                    <span className="font-semibold text-green-400">1:1</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Blackjack</span>
                    <span className="font-semibold text-green-400">3:2</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Insurance</span>
                    <span className="font-semibold text-green-400">2:1</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Push (Tie)</span>
                    <span className="font-semibold text-blue-400">Bet Returns</span>
                  </li>
                </ul>
              </Card>
            </motion.div>
          </div>

          <div className="col-span-1">
            <ChatWindow className="h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blackjack;
