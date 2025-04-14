import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { motion } from 'framer-motion';
import { useToast } from "../../hooks/use-toast";
import ItemGlowEffect from '../GameEffects/ItemGlowEffect';
import { Gift, DollarSign, RotateCcw, Sparkles, Shield, User, ChevronUp } from 'lucide-react';
import PulseAnimation from '../GameEffects/PulseAnimation';
import LightningEffect from '../GameEffects/LightningEffect';

interface CardType {
  suit: string;
  value: string;
  hidden?: boolean;
}

interface EnhancedBlackjackGameProps {
  minBet: number;
  maxBet: number;
}

const EnhancedBlackjackGame = ({ minBet, maxBet }: EnhancedBlackjackGameProps) => {
  const { toast } = useToast();
  const [playerHand, setPlayerHand] = useState<CardType[]>([]);
  const [dealerHand, setDealerHand] = useState<CardType[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealerTurn' | 'gameOver'>('betting');
  const [result, setResult] = useState<'win' | 'lose' | 'push' | null>(null);
  const [bet, setBet] = useState(minBet);
  const [balance, setBalance] = useState(1000);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showLightning, setShowLightning] = useState(false);

  useEffect(() => {
    setBet(minBet);
  }, [minBet]);

  const suits = ['♠️', '♥️', '♦️', '♣️'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const createDeck = () => {
    let deck: CardType[] = [];
    for (let suit of suits) {
      for (let value of values) {
        deck.push({ suit, value });
      }
    }
    return shuffleDeck(deck);
  };

  const shuffleDeck = (deck: CardType[]) => {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };

  const dealCards = () => {
    if (bet > balance) {
      toast({
        title: "Insufficient funds",
        description: "Please place a smaller bet",
        variant: "destructive"
      });
      return;
    }

    setBalance(prev => prev - bet);
    const deck = createDeck();
    const newPlayerHand = [deck[0], deck[2]];
    const newDealerHand = [
      deck[1], 
      { ...deck[3], hidden: true }
    ];
    
    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setGameState('playing');
    setResult(null);
    
    if (calculateHandValue(newPlayerHand) === 21) {
      if (calculateHandValue([deck[1], deck[3]]) === 21) {
        setDealerHand([deck[1], deck[3]]);
        setTimeout(() => {
          setGameState('gameOver');
          setResult('push');
          setBalance(prev => prev + bet);
        }, 1000);
      } else {
        setDealerHand([deck[1], deck[3]]);
        setTimeout(() => {
          setGameState('gameOver');
          setResult('win');
          setShowAnimation(true);
          setShowLightning(true);
          setBalance(prev => prev + bet * 2.5);
        }, 1000);
      }
    }
  };

  const calculateHandValue = (hand: CardType[]) => {
    let value = 0;
    let aces = 0;
    
    for (let card of hand) {
      if (card.hidden) continue;
      
      if (['J', 'Q', 'K'].includes(card.value)) {
        value += 10;
      } else if (card.value === 'A') {
        value += 11;
        aces += 1;
      } else {
        value += parseInt(card.value);
      }
    }
    
    while (value > 21 && aces > 0) {
      value -= 10;
      aces -= 1;
    }
    
    return value;
  };

  const hit = () => {
    const deck = createDeck();
    const newCard = deck[0];
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    
    if (calculateHandValue(newHand) > 21) {
      setGameState('gameOver');
      setResult('lose');
    }
  };

  const stand = () => {
    setGameState('dealerTurn');
    
    const revealedDealerHand = dealerHand.map(card => ({ ...card, hidden: false }));
    setDealerHand(revealedDealerHand);
    
    setTimeout(() => {
      dealerPlay(revealedDealerHand);
    }, 1000);
  };

  const dealerPlay = (currentDealerHand: CardType[]) => {
    let newDealerHand = [...currentDealerHand];
    const deck = createDeck();
    let dealerValue = calculateHandValue(newDealerHand);
    let deckIndex = 0;
    
    while (dealerValue < 17) {
      const newCard = deck[deckIndex++];
      newDealerHand = [...newDealerHand, newCard];
      dealerValue = calculateHandValue(newDealerHand);
    }
    
    setDealerHand(newDealerHand);
    
    const playerValue = calculateHandValue(playerHand);
    
    setTimeout(() => {
      if (dealerValue > 21 || playerValue > dealerValue) {
        setGameState('gameOver');
        setResult('win');
        setBalance(prev => prev + bet * 2);
        setShowAnimation(true);
        setShowLightning(true);
      } else if (playerValue < dealerValue) {
        setGameState('gameOver');
        setResult('lose');
      } else {
        setGameState('gameOver');
        setResult('push');
        setBalance(prev => prev + bet);
      }
    }, 1000);
  };

  const doubleDown = () => {
    if (balance < bet) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough to double down",
        variant: "destructive"
      });
      return;
    }
    
    setBalance(prev => prev - bet);
    setBet(prev => prev * 2);
    
    const deck = createDeck();
    const newCard = deck[0];
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    
    setTimeout(() => {
      if (calculateHandValue(newHand) <= 21) {
        stand();
      } else {
        setGameState('gameOver');
        setResult('lose');
      }
    }, 1000);
  };

  const newGame = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setGameState('betting');
    setResult(null);
    setShowAnimation(false);
    setShowLightning(false);
  };

  const getCardColor = (suit: string) => {
    return suit === '♥️' || suit === '♦️' ? 'text-red-500' : 'text-black';
  };

  useEffect(() => {
    if (showAnimation) {
      setTimeout(() => {
        setShowAnimation(false);
      }, 3000);
    }
    
    if (showLightning) {
      setTimeout(() => {
        setShowLightning(false);
      }, 1500);
    }
  }, [showAnimation, showLightning]);

  const getResultMessage = () => {
    switch (result) {
      case 'win':
        return 'You Win!';
      case 'lose':
        return 'Dealer Wins';
      case 'push':
        return 'Push - Bet Returned';
      default:
        return '';
    }
  };

  const getResultColor = () => {
    switch (result) {
      case 'win':
        return 'text-green-400';
      case 'lose':
        return 'text-red-400';
      case 'push':
        return 'text-yellow-400';
      default:
        return '';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-between min-h-[80vh] p-4 md:p-8 bg-gradient-to-b from-green-900/40 to-gray-900 rounded-xl border-2 border-green-800/50 relative overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-800/20 to-green-900/10 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik01NCA0OEw2IDQ4TDYgNnY0OGg0OHoiIGZpbGw9Imdyb3VwIiBvcGFjaXR5PSIwLjAyIiAvPgogICAgPHBhdGggZD0iTTEyIDEySDE4VjE4SDI0VjI0SDMwVjEySDM2VjEySDQyVjE4SDQ4VjMwSDQyVjM2SDM2VjQySDMwVjQ4SDI0VjQySDEyVjM2SDZWMzBIMTJWMjRIMTJWMTJaIgogICAgICAgIHN0cm9rZT0iIzBmNjYzMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDgiIGZpbGw9Im5vbmUiIC8+Cjwvc3ZnPg==')] opacity-10 z-0"></div>
      </div>
      
      {showLightning && <LightningEffect isVisible={true} onComplete={() => setShowLightning(false)} />}
      
      <motion.div 
        className="w-full flex justify-between items-center mb-6 text-white relative z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center bg-black/40 rounded-lg px-4 py-2 backdrop-blur-sm">
          <DollarSign className="mr-2 text-yellow-400" />
          <span className="text-xl font-bold">{balance}</span>
        </div>
        
        <PulseAnimation isActive={gameState === 'playing' || gameState === 'dealerTurn'} className="bg-black/40 rounded-lg px-4 py-2 backdrop-blur-sm">
          <div className="flex items-center">
            <span className="text-lg font-medium mr-2">Current Bet:</span>
            <span className="text-xl font-bold text-yellow-400">{bet}</span>
          </div>
        </PulseAnimation>
      </motion.div>
      
      <motion.div 
        className="w-full mb-10 relative z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-center mb-2">
          <div className="bg-black/40 backdrop-blur-sm px-4 py-1 rounded-full">
            <h2 className="text-xl font-bold text-white text-center flex items-center">
              <Shield className="h-5 w-5 text-red-400 mr-2" />
              Dealer's Hand
              <span className={`ml-2 font-mono ${dealerHand.some(card => card.hidden) ? 'text-gray-400' : 'text-white'}`}>
                ({dealerHand.some(card => card.hidden) ? '?' : calculateHandValue(dealerHand)})
              </span>
            </h2>
          </div>
        </div>
        
        <div className="relative flex justify-center">
          <div className="absolute -inset-4 bg-gradient-to-b from-gray-800/20 to-transparent rounded-xl z-0"></div>
          <div className="flex justify-center flex-wrap gap-2 z-10">
            {dealerHand.map((card, index) => (
              <motion.div
                key={index}
                initial={{ rotateY: card.hidden ? 180 : 0, y: -20 }}
                animate={{ 
                  rotateY: card.hidden ? 180 : 0,
                  scale: [1, gameState === 'gameOver' && result === 'lose' ? 1.1 : 1],
                  y: 0
                }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative perspective"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Card className={`w-24 h-36 flex flex-col items-center justify-center text-2xl font-bold bg-white shadow-xl border-2 ${card.hidden ? 'invisible' : ''}`}>
                  <div className={`absolute top-2 left-2 ${getCardColor(card.suit)}`}>
                    <div>{card.value}</div>
                  </div>
                  <div className={`text-4xl ${getCardColor(card.suit)}`}>
                    {card.suit}
                  </div>
                  <div className={`absolute bottom-2 right-2 ${getCardColor(card.suit)}`}>
                    <div>{card.value}</div>
                  </div>
                </Card>
                {card.hidden && (
                  <Card className="w-24 h-36 flex items-center justify-center absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-600 text-white border-2 border-blue-500"
                    style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                  >
                    <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0wIDIwQzAgOC45NTQzMSA4Ljk1NDMxIDAgMjAgMEMzMS4wNDU3IDAgNDAgOC45NTQzMSA0MCAyMEM0MCAzMS4wNDU3IDMxLjA0NTcgNDAgMjAgNDBDOC45NTQzMSA0MCAwIDMxLjA0NTcgMCAyMFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmYiIG9wYWNpdHk9IjAuMiIvPgogICAgPHBhdGggZD0iTTIwIDVMMjAgMjBMMzUgMjAiIHN0cm9rZT0iI2ZmZmYiIG9wYWNpdHk9IjAuMyIgc3Ryb2tlLXdpZHRoPSIyLjUiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4=')] bg-center opacity-30"></div>
                    <div className="font-bold text-4xl">?</div>
                  </Card>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {result && (
        <ItemGlowEffect 
          isActive={true}
          color={result === 'win' ? "rgba(0, 255, 0, 0.5)" : result === 'lose' ? "rgba(255, 0, 0, 0.5)" : "rgba(255, 255, 0, 0.5)"}
          className="my-4 z-10"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-3xl font-bold ${getResultColor()} px-6 py-3 rounded-lg bg-black/50 backdrop-blur-sm border ${result === 'win' ? 'border-green-500' : result === 'lose' ? 'border-red-500' : 'border-yellow-500'}`}
          >
            {result === 'win' && <Sparkles className="inline-block mr-2 text-yellow-400" />}
            {getResultMessage()}
            {result === 'win' && <Sparkles className="inline-block ml-2 text-yellow-400" />}
          </motion.div>
        </ItemGlowEffect>
      )}
      
      <motion.div 
        className="w-full mt-10 relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-center mb-2">
          <div className="bg-black/40 backdrop-blur-sm px-4 py-1 rounded-full">
            <h2 className="text-xl font-bold text-white text-center flex items-center">
              <User className="h-5 w-5 text-blue-400 mr-2" />
              Your Hand
              <span className={`ml-2 font-mono ${calculateHandValue(playerHand) > 21 ? 'text-red-400' : calculateHandValue(playerHand) === 21 ? 'text-yellow-400' : 'text-white'}`}>
                ({calculateHandValue(playerHand)})
              </span>
            </h2>
          </div>
        </div>
        
        <div className="relative flex justify-center">
          <div className="absolute -inset-4 bg-gradient-to-t from-gray-800/20 to-transparent rounded-xl z-0"></div>
          <div className="flex justify-center flex-wrap gap-3 z-10">
            {playerHand.map((card, index) => (
              <ItemGlowEffect 
                key={index}
                isActive={gameState === 'gameOver' && result === 'win'}
                color="rgba(0, 255, 0, 0.5)"
              >
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                >
                  <Card className="w-24 h-36 flex flex-col items-center justify-center text-2xl font-bold bg-white shadow-xl border-2">
                    <div className={`absolute top-2 left-2 ${getCardColor(card.suit)}`}>
                      <div>{card.value}</div>
                    </div>
                    <div className={`text-4xl ${getCardColor(card.suit)}`}>
                      {card.suit}
                    </div>
                    <div className={`absolute bottom-2 right-2 ${getCardColor(card.suit)}`}>
                      <div>{card.value}</div>
                    </div>
                  </Card>
                </motion.div>
              </ItemGlowEffect>
            ))}
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="w-full mt-8 flex flex-col items-center relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {gameState === 'betting' && (
          <div className="w-full max-w-md bg-black/30 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50">
            <div className="flex justify-between items-center mb-4">
              <Button 
                variant="outline"
                onClick={() => setBet(prev => Math.max(minBet, prev - 5))}
                disabled={bet <= minBet}
                className="w-12 h-12 rounded-full bg-red-900/50 border-red-500/50 text-white hover:bg-red-800"
              >
                -
              </Button>
              <div className="text-2xl font-bold text-yellow-400 bg-black/50 px-6 py-2 rounded-lg border border-yellow-500/30">
                ${bet}
              </div>
              <Button 
                variant="outline"
                onClick={() => setBet(prev => Math.min(Math.min(balance, maxBet), prev + 5))}
                disabled={bet >= Math.min(balance, maxBet)}
                className="w-12 h-12 rounded-full bg-green-900/50 border-green-500/50 text-white hover:bg-green-800"
              >
                +
              </Button>
            </div>
            <Button 
              onClick={dealCards}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-lg border border-blue-400/30 shadow-lg"
            >
              Deal Cards
            </Button>
          </div>
        )}
        
        {gameState === 'playing' && (
          <div className="grid grid-cols-3 gap-3 w-full max-w-md bg-black/30 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50">
            <PulseAnimation isActive={true} intensity="low" className="col-span-1">
              <Button 
                onClick={hit}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-3 rounded-lg border border-blue-400/30"
              >
                Hit
              </Button>
            </PulseAnimation>
            
            <Button 
              onClick={stand}
              className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold py-3 rounded-lg border border-red-400/30 col-span-1"
            >
              Stand
            </Button>
            
            <Button 
              onClick={doubleDown}
              disabled={playerHand.length > 2 || balance < bet}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold py-3 rounded-lg border border-purple-400/30 col-span-1 relative overflow-hidden"
            >
              <span className="relative z-10">Double</span>
              {playerHand.length === 2 && balance >= bet && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="absolute h-10 w-10 bg-purple-400/20 rounded-full animate-ping"></span>
                </span>
              )}
            </Button>
          </div>
        )}
        
        {gameState === 'dealerTurn' && (
          <div className="w-full max-w-md bg-black/30 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50">
            <PulseAnimation isActive={true}>
              <Button 
                disabled
                className="w-full bg-gradient-to-r from-amber-600 to-amber-800 text-white font-bold py-3 rounded-lg border border-amber-500/30"
              >
                Dealer's Turn...
              </Button>
            </PulseAnimation>
          </div>
        )}
        
        {gameState === 'gameOver' && (
          <div className="w-full max-w-md bg-black/30 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50">
            <Button 
              onClick={newGame}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-bold flex items-center justify-center py-3 rounded-lg border border-indigo-400/30"
            >
              <RotateCcw className="mr-2" size={16} />
              New Game
            </Button>
          </div>
        )}
      </motion.div>
      
      <div className="absolute bottom-4 left-4 z-0 opacity-40">
        <div className="w-12 h-12 rounded-full bg-red-600 border-4 border-red-400 shadow-lg transform -rotate-12"></div>
      </div>
      <div className="absolute bottom-8 left-12 z-0 opacity-40">
        <div className="w-10 h-10 rounded-full bg-blue-600 border-4 border-blue-400 shadow-lg transform rotate-6"></div>
      </div>
      <div className="absolute bottom-6 left-20 z-0 opacity-40">
        <div className="w-8 h-8 rounded-full bg-green-600 border-4 border-green-400 shadow-lg"></div>
      </div>
    </motion.div>
  );
};

export default EnhancedBlackjackGame;
