
import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { motion } from 'framer-motion';
import { useToast } from "../../hooks/use-toast";
import ItemGlowEffect from '../GameEffects/ItemGlowEffect';
import { Gift, DollarSign, RotateCcw } from 'lucide-react';

interface CardType {
  suit: string;
  value: string;
  hidden?: boolean;
}

const EnhancedBlackjackGame = () => {
  const { toast } = useToast();
  const [playerHand, setPlayerHand] = useState<CardType[]>([]);
  const [dealerHand, setDealerHand] = useState<CardType[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealerTurn' | 'gameOver'>('betting');
  const [result, setResult] = useState<'win' | 'lose' | 'push' | null>(null);
  const [bet, setBet] = useState(10);
  const [balance, setBalance] = useState(1000);
  const [showAnimation, setShowAnimation] = useState(false);

  const suits = ['♠️', '♥️', '♦️', '♣️'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  // Create a new deck and shuffle it
  const createDeck = () => {
    let deck: CardType[] = [];
    for (let suit of suits) {
      for (let value of values) {
        deck.push({ suit, value });
      }
    }
    return shuffleDeck(deck);
  };

  // Shuffle the deck using Fisher-Yates algorithm
  const shuffleDeck = (deck: CardType[]) => {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };

  // Deal initial cards
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
    
    // Check for natural blackjack
    if (calculateHandValue(newPlayerHand) === 21) {
      if (calculateHandValue([deck[1], deck[3]]) === 21) {
        setDealerHand([deck[1], deck[3]]); // Reveal dealer's second card
        setTimeout(() => {
          setGameState('gameOver');
          setResult('push');
          setBalance(prev => prev + bet);
        }, 1000);
      } else {
        setDealerHand([deck[1], deck[3]]); // Reveal dealer's second card
        setTimeout(() => {
          setGameState('gameOver');
          setResult('win');
          setBalance(prev => prev + bet * 2.5);
        }, 1000);
      }
    }
  };

  // Calculate the value of a hand
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
    
    // Adjust for aces if needed
    while (value > 21 && aces > 0) {
      value -= 10;
      aces -= 1;
    }
    
    return value;
  };

  // Player hits
  const hit = () => {
    const deck = createDeck();
    const newCard = deck[0];
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    
    // Check if player busts
    if (calculateHandValue(newHand) > 21) {
      setGameState('gameOver');
      setResult('lose');
    }
  };

  // Player stands, dealer's turn
  const stand = () => {
    setGameState('dealerTurn');
    
    // Reveal dealer's hidden card
    const revealedDealerHand = dealerHand.map(card => ({ ...card, hidden: false }));
    setDealerHand(revealedDealerHand);
    
    setTimeout(() => {
      dealerPlay(revealedDealerHand);
    }, 1000);
  };

  // Dealer's turn
  const dealerPlay = (currentDealerHand: CardType[]) => {
    let newDealerHand = [...currentDealerHand];
    const deck = createDeck();
    let dealerValue = calculateHandValue(newDealerHand);
    let deckIndex = 0;
    
    // Dealer draws until 17 or higher
    while (dealerValue < 17) {
      const newCard = deck[deckIndex++];
      newDealerHand = [...newDealerHand, newCard];
      dealerValue = calculateHandValue(newDealerHand);
    }
    
    setDealerHand(newDealerHand);
    
    // Determine the winner
    const playerValue = calculateHandValue(playerHand);
    
    setTimeout(() => {
      if (dealerValue > 21 || playerValue > dealerValue) {
        setGameState('gameOver');
        setResult('win');
        setBalance(prev => prev + bet * 2);
        setShowAnimation(true);
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

  // Double down
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
    
    // Deal one more card to the player
    const deck = createDeck();
    const newCard = deck[0];
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    
    // Then stand
    setTimeout(() => {
      if (calculateHandValue(newHand) <= 21) {
        stand();
      } else {
        setGameState('gameOver');
        setResult('lose');
      }
    }, 1000);
  };

  // Reset the game
  const newGame = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setGameState('betting');
    setResult(null);
    setShowAnimation(false);
  };

  // Get card color based on suit
  const getCardColor = (suit: string) => {
    return suit === '♥️' || suit === '♦️' ? 'text-red-500' : 'text-black';
  };

  useEffect(() => {
    if (showAnimation) {
      setTimeout(() => {
        setShowAnimation(false);
      }, 3000);
    }
  }, [showAnimation]);

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
      className="flex flex-col items-center justify-between min-h-[80vh] p-4 md:p-8 bg-gradient-to-b from-green-900/40 to-gray-900 rounded-xl"
    >
      {/* Top Info Bar */}
      <motion.div 
        className="w-full flex justify-between items-center mb-6 text-white"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center">
          <DollarSign className="mr-2 text-yellow-400" />
          <span className="text-xl font-bold">{balance}</span>
        </div>
        <div className="flex items-center">
          <span className="text-lg font-medium mr-2">Current Bet:</span>
          <span className="text-xl font-bold text-yellow-400">{bet}</span>
        </div>
      </motion.div>
      
      {/* Dealer's Area */}
      <motion.div 
        className="w-full mb-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-bold mb-4 text-white text-center">
          Dealer's Hand ({dealerHand.some(card => card.hidden) ? '?' : calculateHandValue(dealerHand)})
        </h2>
        <div className="flex justify-center flex-wrap gap-2">
          {dealerHand.map((card, index) => (
            <motion.div
              key={index}
              initial={{ rotateY: card.hidden ? 180 : 0 }}
              animate={{ 
                rotateY: card.hidden ? 180 : 0,
                scale: [1, gameState === 'gameOver' && result === 'lose' ? 1.1 : 1]
              }}
              transition={{ duration: 0.5 }}
              className="relative perspective"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Card className={`w-20 h-32 flex items-center justify-center text-2xl font-bold bg-white shadow-xl ${card.hidden ? 'invisible' : ''}`}>
                <div className={getCardColor(card.suit)}>
                  <div>{card.value}</div>
                  <div>{card.suit}</div>
                </div>
              </Card>
              {card.hidden && (
                <Card className="w-20 h-32 flex items-center justify-center absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-600 text-white"
                  style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                >
                  <div className="font-bold text-2xl">?</div>
                </Card>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* Result Message */}
      {result && (
        <ItemGlowEffect 
          isActive={true}
          color={result === 'win' ? "rgba(0, 255, 0, 0.5)" : result === 'lose' ? "rgba(255, 0, 0, 0.5)" : "rgba(255, 255, 0, 0.5)"}
          className="my-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-3xl font-bold ${getResultColor()} px-6 py-3 rounded-lg bg-black/30 backdrop-blur-sm`}
          >
            {getResultMessage()}
          </motion.div>
        </ItemGlowEffect>
      )}
      
      {/* Player's Area */}
      <motion.div 
        className="w-full mt-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-bold mb-4 text-white text-center">
          Your Hand ({calculateHandValue(playerHand)})
        </h2>
        <div className="flex justify-center flex-wrap gap-2">
          {playerHand.map((card, index) => (
            <ItemGlowEffect 
              key={index}
              isActive={gameState === 'gameOver' && result === 'win'}
              color="rgba(0, 255, 0, 0.5)"
            >
              <Card className="w-20 h-32 flex items-center justify-center text-2xl font-bold bg-white shadow-xl">
                <div className={getCardColor(card.suit)}>
                  <div>{card.value}</div>
                  <div>{card.suit}</div>
                </div>
              </Card>
            </ItemGlowEffect>
          ))}
        </div>
      </motion.div>
      
      {/* Controls Area */}
      <motion.div 
        className="w-full mt-8 flex flex-col items-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {gameState === 'betting' && (
          <div className="w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <Button 
                variant="outline"
                onClick={() => setBet(prev => Math.max(5, prev - 5))}
                disabled={bet <= 5}
                className="w-12 h-12 rounded-full"
              >
                -
              </Button>
              <div className="text-2xl font-bold text-yellow-400">${bet}</div>
              <Button 
                variant="outline"
                onClick={() => setBet(prev => Math.min(balance, prev + 5))}
                disabled={bet >= balance}
                className="w-12 h-12 rounded-full"
              >
                +
              </Button>
            </div>
            <Button 
              onClick={dealCards}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 rounded-lg"
            >
              Deal Cards
            </Button>
          </div>
        )}
        
        {gameState === 'playing' && (
          <div className="grid grid-cols-3 gap-2 w-full max-w-md">
            <Button 
              onClick={hit}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg"
            >
              Hit
            </Button>
            <Button 
              onClick={stand}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 rounded-lg"
            >
              Stand
            </Button>
            <Button 
              onClick={doubleDown}
              disabled={playerHand.length > 2 || balance < bet}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 rounded-lg"
            >
              Double
            </Button>
          </div>
        )}
        
        {gameState === 'dealerTurn' && (
          <div className="w-full max-w-md">
            <Button 
              disabled
              className="w-full bg-gray-600 text-white font-bold py-3 rounded-lg"
            >
              Dealer's Turn...
            </Button>
          </div>
        )}
        
        {gameState === 'gameOver' && (
          <div className="w-full max-w-md">
            <Button 
              onClick={newGame}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold flex items-center justify-center py-3 rounded-lg"
            >
              <RotateCcw className="mr-2" size={16} />
              New Game
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default EnhancedBlackjackGame;
