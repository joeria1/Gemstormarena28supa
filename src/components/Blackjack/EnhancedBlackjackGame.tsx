import React, { useState, useEffect, useRef } from 'react';
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { motion } from 'framer-motion';
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import ItemGlowEffect from '../GameEffects/ItemGlowEffect';
import { Gift, DollarSign, RotateCcw, Sparkles, Shield, User, ChevronUp, Hash, Scissors, Clock } from 'lucide-react';
import PulseAnimation from '../GameEffects/PulseAnimation';
import LightningEffect from '../GameEffects/LightningEffect';

interface CardType {
  suit: string;
  value: string;
  hidden: boolean;
}

interface BlackjackHand {
  cards: CardType[];
  bet: number;
  result: 'playing' | 'win' | 'lose' | 'push' | 'blackjack' | null;
  doubledDown: boolean;
  stand: boolean;
}

interface EnhancedBlackjackGameProps {
  minBet: number;
  maxBet: number;
}

const EnhancedBlackjackGame = ({ minBet, maxBet }: EnhancedBlackjackGameProps) => {
  const { user, updateBalance } = useUser();
  
  const [playerHands, setPlayerHands] = useState<BlackjackHand[]>([]);
  const [currentHandIndex, setCurrentHandIndex] = useState(0);
  const [dealerHand, setDealerHand] = useState<CardType[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealerTurn' | 'gameOver'>('betting');
  const [bet, setBet] = useState(minBet);
  const [balance, setBalance] = useState(user?.balance || 1000);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showLightning, setShowLightning] = useState(false);
  const [activeHandCount, setActiveHandCount] = useState(1);
  const [totalWon, setTotalWon] = useState(0);
  const [timerCount, setTimerCount] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const MAX_HANDS = 3;
  const AUTO_STAND_TIME = 12; // Change from 7 to 12 seconds

  useEffect(() => {
    setBet(minBet);
    if (user) {
      setBalance(user.balance);
    }
  }, [minBet, user]);

  const suits = ['♠️', '♥️', '♦️', '♣️'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const addHand = () => {
    if (activeHandCount < MAX_HANDS) {
      setActiveHandCount(prev => prev + 1);
    }
  };

  const removeHand = () => {
    if (activeHandCount > 1) {
      setActiveHandCount(prev => prev - 1);
    }
  };

  const createDeck = () => {
    let deck: CardType[] = [];
    for (let suit of suits) {
      for (let value of values) {
        deck.push({ suit, value, hidden: false });
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
    const totalBetAmount = bet * activeHandCount;
    
    if (!user) {
      toast("You need to be logged in to play", {
        description: "Please log in to continue",
        style: { backgroundColor: 'rgb(239, 68, 68)', color: 'white' }
      });
      return;
    }
    
    if (totalBetAmount > balance) {
      toast("Insufficient funds", {
        description: `You need ${totalBetAmount} to place these bets`,
        style: { backgroundColor: 'rgb(239, 68, 68)', color: 'white' }
      });
      return;
    }

    updateBalance(-totalBetAmount);
    setBalance(prev => prev - totalBetAmount);
    
    const deck = createDeck();
    
    const newDealerHand = [
      { ...deck.pop()!, hidden: false },
      { ...deck.pop()!, hidden: true }
    ];
    
    const initialHands: BlackjackHand[] = [];
    
    for (let i = 0; i < activeHandCount; i++) {
      initialHands.push({
        cards: [
          { ...deck.pop()!, hidden: false }, 
          { ...deck.pop()!, hidden: false }
        ],
        bet: bet,
        result: 'playing',
        doubledDown: false,
        stand: false
      });
    }
    
    setDealerHand(newDealerHand);
    setPlayerHands(initialHands);
    setCurrentHandIndex(0);
    setGameState('playing');
    setTotalWon(0);
    
    initialHands.forEach((hand, index) => {
      if (calculateHandValue(hand.cards) === 21) {
        const updatedHands = [...initialHands];
        
        if (calculateHandValue([newDealerHand[0], {...newDealerHand[1], hidden: false}]) === 21) {
          updatedHands[index] = {...hand, result: 'push'};
        } else {
          updatedHands[index] = {...hand, result: 'blackjack'};
        }
        
        setPlayerHands(updatedHands);
      }
    });
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

  // Add timer logic
  useEffect(() => {
    // Start timer when it's player's turn
    if (gameState === 'playing' && playerHands.length > 0 && currentHandIndex < playerHands.length) {
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Set initial timer value
      setTimerCount(AUTO_STAND_TIME);
      
      // Start countdown
      timerRef.current = setInterval(() => {
        setTimerCount(prev => {
          if (prev === null || prev <= 1) {
            // Time's up, auto-stand
            clearInterval(timerRef.current!);
            if (gameState === 'playing') {
              stand();
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    // Clear timer when not player's turn
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, currentHandIndex, playerHands.length]);
  
  // Reset timer when player takes an action
  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setTimerCount(AUTO_STAND_TIME);
      
      timerRef.current = setInterval(() => {
        setTimerCount(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timerRef.current!);
            if (gameState === 'playing') {
              stand();
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const hit = () => {
    if (gameState !== 'playing' || currentHandIndex >= playerHands.length) return;
    
    if (playerHands[currentHandIndex].stand) {
      return;
    }
    
    resetTimer();
    
    const deck = createDeck();
    const newCard = deck.pop()!;
    
    const updatedHands = [...playerHands];
    const currentHand = {...updatedHands[currentHandIndex]};
    
    currentHand.cards = [...currentHand.cards, newCard];
    
    const handValue = calculateHandValue(currentHand.cards);
    if (handValue > 21) {
      currentHand.result = 'lose';
      currentHand.stand = true;
      
      updatedHands[currentHandIndex] = currentHand;
      setPlayerHands(updatedHands);
      
      if (currentHandIndex < playerHands.length - 1) {
        setCurrentHandIndex(currentHandIndex + 1);
      } else {
        const allHandsFinished = updatedHands.every(hand => 
          hand.result !== 'playing' || hand.stand
        );
        
        if (allHandsFinished) {
          setGameState('gameOver');
          calculateResults();
        } else {
          setGameState('dealerTurn');
          dealerPlay();
        }
      }
    } else {
      updatedHands[currentHandIndex] = currentHand;
      setPlayerHands(updatedHands);
    }
  };

  const stand = () => {
    if (gameState !== 'playing') return;
    
    // Clear the timer when standing
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setTimerCount(null);
    }
    
    const updatedHands = [...playerHands];
    updatedHands[currentHandIndex] = {
      ...updatedHands[currentHandIndex],
      stand: true
    };
    
    setPlayerHands(updatedHands);
    
    if (currentHandIndex < playerHands.length - 1) {
      setCurrentHandIndex(currentHandIndex + 1);
    } else {
      const allHandsFinished = updatedHands.every(hand => 
        hand.result !== 'playing' || hand.stand
      );
      
      if (allHandsFinished) {
        setGameState('dealerTurn');
        dealerPlay();
      }
    }
  };

  // Function to handle dealer's hidden card reveal
  const revealDealerHiddenCard = () => {
    // Create a new array with the hidden property set to false for all cards
    const revealedHand = dealerHand.map(card => ({
      ...card,
      hidden: false
    }));
    
    setDealerHand(revealedHand);
  };

  const doubleDown = () => {
    if (gameState !== 'playing' || playerHands[currentHandIndex].cards.length !== 2) return;
    
    // Clear the timer when doubling down
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setTimerCount(null);
    }
    
    const doubleAmount = playerHands[currentHandIndex].bet;
    
    if (balance < doubleAmount) {
      toast("Insufficient funds", {
        description: "You don't have enough to double down",
        style: { backgroundColor: 'rgb(239, 68, 68)', color: 'white' }
      });
      return;
    }
    
    updateBalance(-doubleAmount);
    setBalance(prev => prev - doubleAmount);
    
    // Create a separate deck for drawing a card
    const deck = createDeck();
    const newCard = deck.pop()!;
    
    const updatedHands = [...playerHands];
    const currentHand = {...updatedHands[currentHandIndex]};
    
    // Add the new card to the current hand
    currentHand.cards = [...currentHand.cards, newCard];
    currentHand.bet = currentHand.bet * 2;
    currentHand.doubledDown = true;
    currentHand.stand = true;
    
    // Check for bust
    const handValue = calculateHandValue(currentHand.cards);
    if (handValue > 21) {
      currentHand.result = 'lose';
    }
    
    updatedHands[currentHandIndex] = currentHand;
    setPlayerHands(updatedHands);
    
    // Give player more time to see the new card - increase to 3 seconds
    setTimeout(() => {
      if (currentHandIndex < playerHands.length - 1) {
        setCurrentHandIndex(currentHandIndex + 1);
      } else {
        // First reveal dealer card regardless of outcome
        revealDealerHiddenCard();
        
        // Check if all hands are busted or finished
        const allHandsFinished = updatedHands.every(hand => 
          hand.result === 'lose' || hand.result === 'blackjack' || hand.result === 'push' || 
          (hand.stand && calculateHandValue(hand.cards) <= 21)
        );
        
        // Add a delay to ensure dealer card is visible
        setTimeout(() => {
          if (allHandsFinished) {
            // If some hands aren't busted, dealer needs to play
            const someHandsNotBusted = updatedHands.some(hand => 
              hand.stand && hand.result !== 'lose' && hand.result !== 'blackjack' && hand.result !== 'push'
            );
            
            if (someHandsNotBusted) {
              setGameState('dealerTurn');
              dealerPlay();
            } else {
              setGameState('gameOver');
              calculateResults();
            }
          } else {
            setGameState('dealerTurn');
            dealerPlay();
          }
        }, 1500);
      }
    }, 3000);
  };

  const dealerPlay = () => {
    // First reveal dealer's hidden card
    revealDealerHiddenCard();
    
    // Check if all hands have already been settled
    const allHandsSettled = playerHands.every(hand => 
      hand.result !== 'playing'
    );
    
    if (allHandsSettled) {
      // Give time to see dealer's revealed card
      setTimeout(() => {
        setGameState('gameOver');
        calculateResults(dealerHand);
      }, 1500);
      return;
    }
    
    // First pause to allow player to see the revealed hidden card
    setTimeout(() => {
      const currentDealerValue = calculateHandValue(dealerHand);
      
      // If dealer already has 17 or more after revealing hidden card, no need to draw
      if (currentDealerValue >= 17) {
        setTimeout(() => {
          setGameState('gameOver');
          calculateResults(dealerHand);
        }, 1000);
        return;
      }
      
      // Otherwise, start drawing cards until dealer reaches 17 or busts
      const drawDealerCards = () => {
        const deck = createDeck();
        let newDealerHand = [...dealerHand.map(card => ({...card, hidden: false}))];
        let dealerValue = calculateHandValue(newDealerHand);
        
        const drawCard = () => {
          if (dealerValue < 17) {
            // Draw a new card and ensure it's visible
            const newCard = { ...deck.pop()!, hidden: false };
            newDealerHand = [...newDealerHand, newCard];
            dealerValue = calculateHandValue(newDealerHand);
            
            // Update dealer hand with all visible cards
            setDealerHand(newDealerHand);
            
            // Allow time to see each new card
            setTimeout(() => {
              drawCard();
            }, 1000);
          } else {
            // Dealer is done drawing - show results
            setTimeout(() => {
              setGameState('gameOver');
              calculateResults(newDealerHand);
            }, 1000);
          }
        };
        
        // Start the card drawing sequence
        drawCard();
      };
      
      // Start drawing cards
      drawDealerCards();
    }, 1500); // Pause 1.5 seconds after revealing hidden card before drawing more
  };

  const calculateResults = (finalDealerHand = dealerHand) => {
    // Make sure no dealer cards are hidden before calculating results
    const visibleDealerHand = finalDealerHand.map(card => ({...card, hidden: false}));
    setDealerHand(visibleDealerHand);
    
    const dealerValue = calculateHandValue(visibleDealerHand);
    const dealerBusted = dealerValue > 21;
    
    let winAmount = 0;
    
    const updatedHands = playerHands.map(hand => {
      if (hand.result !== null && hand.result !== 'playing') {
        // If hand already has a result (like blackjack or already bust), keep it
        if (hand.result === 'blackjack') {
          winAmount += hand.bet * 2.5;
        } else if (hand.result === 'win') {
          winAmount += hand.bet * 2;
        } else if (hand.result === 'push') {
          winAmount += hand.bet;
        }
        return hand;
      }
      
      const handValue = calculateHandValue(hand.cards);
      
      // Skip busted hands, they already have result 'lose'
      if (handValue > 21) {
        return { ...hand, result: 'lose' as const };
      }
      
      let result: BlackjackHand['result'] = 'playing';
      
      if (dealerBusted) {
        // Dealer busted, player wins if not busted
        result = 'win';
        winAmount += hand.bet * 2;
      } else if (handValue > dealerValue) {
        // Player has higher value than dealer
        result = 'win';
        winAmount += hand.bet * 2;
      } else if (handValue === dealerValue) {
        // Same value is a push
        result = 'push';
        winAmount += hand.bet;
      } else {
        // Dealer has higher value
        result = 'lose';
      }
      
      return { ...hand, result };
    });
    
    setPlayerHands(updatedHands);
    
    if (winAmount > 0) {
      updateBalance(winAmount);
      setBalance(prev => prev + winAmount);
      setTotalWon(winAmount);
      
      setShowAnimation(true);
      if (winAmount > bet * 3) {
        setShowLightning(true);
      }
      
      // Check if there were any push results to include in the message
      const pushHands = updatedHands.filter(hand => hand.result === 'push');
      
      if (pushHands.length > 0) {
        // If there are push hands, include that in the toast message
        const pushAmount = pushHands.reduce((total, hand) => total + hand.bet, 0);
        
        toast("Result", {
          description: `You won ${winAmount - pushAmount} gems + ${pushAmount} returned from push!`,
          style: { backgroundColor: 'rgb(34, 197, 94)', color: 'white' }
        });
      } else {
        toast("Win!", {
          description: `You won ${winAmount} gems!`,
          style: { backgroundColor: 'rgb(34, 197, 94)', color: 'white' }
        });
      }
    } else {
      // Check if there were any push results to include in the message
      const pushHands = updatedHands.filter(hand => hand.result === 'push');
      
      if (pushHands.length > 0) {
        // If only push hands, show a neutral toast
        const pushAmount = pushHands.reduce((total, hand) => total + hand.bet, 0);
        
        toast("Push", {
          description: `${pushAmount} gems returned to you.`,
          style: { backgroundColor: 'rgb(59, 130, 246)', color: 'white' }
        });
      }
    }
  };

  const newGame = () => {
    setPlayerHands([]);
    setDealerHand([]);
    setGameState('betting');
    setCurrentHandIndex(0);
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

  const getResultMessage = (hand: BlackjackHand) => {
    switch (hand.result) {
      case 'win':
        return 'You Win!';
      case 'lose':
        // Only say "Bust!" if hand value is over 21, otherwise say "You Lose"
        return calculateHandValue(hand.cards) > 21 ? 'Bust!' : 'You Lose';
      case 'push':
        return 'Push (Bet Returned)';
      case 'blackjack':
        return 'Blackjack!';
      default:
        return '';
    }
  };

  const getResultColor = (result: BlackjackHand['result']) => {
    switch (result) {
      case 'win':
      case 'blackjack':
        return 'text-green-400';
      case 'lose':
        return 'text-red-400';
      case 'push':
        return 'text-yellow-400';
      default:
        return '';
    }
  };

  const isCurrentHand = (index: number) => {
    return gameState === 'playing' && index === currentHandIndex;
  };

  // Fix the canSplitHand function to only allow identical cards
  const canSplitHand = (hand: BlackjackHand): boolean => {
    if (hand.cards.length !== 2 || hand.stand || hand.doubledDown) return false;
    
    // Check if the two cards have exactly the same value (not just point value)
    const card1Value = hand.cards[0].value;
    const card2Value = hand.cards[1].value;
    
    // Only allow splitting of identical cards (e.g., two Kings, two 8s)
    return card1Value === card2Value;
  };
  
  // Add split function
  const splitHand = () => {
    if (gameState !== 'playing' || !canSplitHand(playerHands[currentHandIndex])) return;
    
    resetTimer();
    
    // Check if player has enough funds to split
    const currentBet = playerHands[currentHandIndex].bet;
    if (balance < currentBet) {
      toast("Insufficient funds", {
        description: "You need more gems to split this hand",
        style: { backgroundColor: 'rgb(239, 68, 68)', color: 'white' }
      });
      return;
    }
    
    // Deduct the bet amount for the new hand
    updateBalance(-currentBet);
    setBalance(prev => prev - currentBet);
    
    const deck = createDeck();
    
    // Create two new hands from the split
    const updatedHands = [...playerHands];
    const currentHand = updatedHands[currentHandIndex];
    
    // First hand gets the first card and a new card
    const firstHand: BlackjackHand = {
      cards: [currentHand.cards[0], { ...deck.pop()!, hidden: false }],
      bet: currentBet,
      result: 'playing',
      doubledDown: false,
      stand: false
    };
    
    // Second hand gets the second card and a new card
    const secondHand: BlackjackHand = {
      cards: [currentHand.cards[1], { ...deck.pop()!, hidden: false }],
      bet: currentBet,
      result: 'playing',
      doubledDown: false,
      stand: false
    };
    
    // Replace current hand with first hand, add second hand after it
    updatedHands[currentHandIndex] = firstHand;
    updatedHands.splice(currentHandIndex + 1, 0, secondHand);
    
    setPlayerHands(updatedHands);
    
    // Check for blackjacks on the new hands
    if (calculateHandValue(firstHand.cards) === 21) {
      updatedHands[currentHandIndex].result = 'blackjack';
    }
    
    if (calculateHandValue(secondHand.cards) === 21) {
      updatedHands[currentHandIndex + 1].result = 'blackjack';
    }
    
    setPlayerHands(updatedHands);
    
    toast("Hand Split", {
      description: "You've split your hand into two separate hands",
      style: { backgroundColor: 'rgb(59, 130, 246)', color: 'white' }
    });
  };

  // Add a function to determine the bet increment based on minBet
  const getBetIncrement = () => {
    if (minBet >= 500) return 500; // VIP Table
    if (minBet >= 100) return 100; // High Roller
    if (minBet >= 50) return 50;   // Standard Table
    return 10;                     // Beginner Table
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex flex-col items-center justify-between w-full p-4 md:p-6 bg-gradient-to-b from-green-900/40 to-gray-900 rounded-xl border-2 border-green-800/50 relative overflow-hidden ${
        gameState === 'betting' ? 'min-h-[65vh]' : 'min-h-[50vh]'
      }`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-800/20 to-green-900/10 z-0"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik01NCA0OEw2IDQ4TDYgNnY0OGg0OHoiIGZpbGw9Imdyb3VwIiBvcGFjaXR5PSIwLjAyIiAvPgogICAgPHBhdGggZD0iTTEyIDEySDE4VjE4SDI0VjI0SDMwVjEySDM2VjEySDQyVjE4SDQ4VjMwSDQyVjM2SDM2VjQySDMwVjQ4SDI0VjQySDEyVjM2SDZWMzBIMTJWMjRIMTJWMTJaIgogICAgICAgIHN0cm9rZT0iIzBmNjYzMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDgiIGZpbGw9Im5vbmUiIC8+Cjwvc3ZnPg==')] opacity-10 z-0"></div>
      </div>
      
      {showLightning && <LightningEffect isVisible={true} onComplete={() => setShowLightning(false)} />}
      
      <motion.div 
        className="w-full flex justify-between items-center mb-2 text-white relative z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center bg-black/40 rounded-lg px-4 py-2 backdrop-blur-sm">
          <DollarSign className="mr-2 text-yellow-400" />
          <span className="text-xl font-bold">{balance.toFixed(2)}</span>
        </div>
        
        {gameState === 'playing' && timerCount !== null && (
          <div className={`flex items-center bg-black/40 rounded-lg px-4 py-2 backdrop-blur-sm ${
            timerCount <= 3 ? 'bg-red-900/40' : ''
          }`}>
            <Clock className={`mr-2 ${timerCount <= 3 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`} />
            <span className={`text-xl font-bold ${timerCount <= 3 ? 'text-red-400' : 'text-white'}`}>
              {timerCount}s
            </span>
          </div>
        )}
        
        <PulseAnimation isActive={gameState === 'playing' || gameState === 'dealerTurn'} className="bg-black/40 rounded-lg px-4 py-2 backdrop-blur-sm">
          <div className="flex items-center">
            <span className="text-lg font-medium mr-2">Current Bet:</span>
            <span className="text-xl font-bold text-yellow-400">{bet}</span>
            {activeHandCount > 1 && (
              <span className="ml-2 text-sm">x{activeHandCount} = {(bet * activeHandCount).toFixed(2)}</span>
            )}
          </div>
        </PulseAnimation>
      </motion.div>
      
      <motion.div 
        className="w-full mb-3 relative z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-center mb-1">
          <div className="bg-black/40 backdrop-blur-sm px-4 py-1 rounded-full">
            <h2 className="text-lg font-bold text-white text-center flex items-center">
              <Shield className="h-4 w-4 text-red-400 mr-2" />
              Dealer's Hand
              <span className={`ml-2 font-mono ${dealerHand.some(card => card.hidden) ? 'text-gray-400' : 'text-white'}`}>
                ({dealerHand.some(card => card.hidden) ? '?' : calculateHandValue(dealerHand)})
              </span>
            </h2>
          </div>
        </div>
        
        <div className="relative flex justify-center">
          <div className="absolute -inset-2 bg-gradient-to-b from-gray-800/20 to-transparent rounded-xl z-0"></div>
          <div className="flex justify-center flex-wrap gap-1 z-10">
            {dealerHand.map((card, index) => (
              <motion.div
                key={index}
                initial={{ rotateY: card.hidden ? 180 : 0, y: -20 }}
                animate={{ 
                  rotateY: card.hidden ? 180 : 0,
                  scale: [1, gameState === 'gameOver' && playerHands.some(h => h.result === 'lose') ? 1.1 : 1],
                  y: 0
                }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative perspective"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Card className={`w-20 h-32 flex flex-col items-center justify-center text-xl font-bold bg-white shadow-xl border-2 ${card.hidden ? 'invisible' : ''}`}>
                  <div className={`absolute top-2 left-2 ${getCardColor(card.suit)}`}>
                    <div>{card.value}</div>
                  </div>
                  <div className={`text-3xl ${getCardColor(card.suit)}`}>
                    {card.suit}
                  </div>
                  <div className={`absolute bottom-2 right-2 ${getCardColor(card.suit)}`}>
                    <div>{card.value}</div>
                  </div>
                </Card>
                {card.hidden && (
                  <Card className="w-20 h-32 flex items-center justify-center absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-600 text-white border-2 border-blue-500"
                    style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                  >
                    <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0wIDIwQzAgOC45NTQzMSA4Ljk1NDMxIDAgMjAgMEMzMS4wNDU3IDAgNDAgOC45NTQzMSA0MCAyMEM0MCAzMS4wNDU3IDMxLjA0NTcgNDAgMjAgNDBDOC45NTQzMSA0MCAwIDMxLjA0NTcgMCAyMFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmYiIG9wYWNpdHk9IjAuMiIvPgogICAgPHBhdGggZD0iTTIwIDVMMjAgMjBMMzUgMjAiIHN0cm9rZT0iI2ZmZmYiIG9wYWNpdHk9IjAuMyIgc3Ryb2tlLXdpZHRoPSIyLjUiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4=')] bg-center opacity-30"></div>
                    <div className="font-bold text-3xl">?</div>
                  </Card>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {totalWon > 0 && gameState === 'gameOver' && (
        <ItemGlowEffect 
          isActive={true}
          color="rgba(0, 255, 0, 0.5)"
          className="my-2 z-10"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold text-green-400 px-5 py-2 rounded-lg bg-black/50 backdrop-blur-sm border border-green-500"
          >
            <Sparkles className="inline-block mr-2 text-yellow-400" />
            Total Won: {totalWon} gems!
            <Sparkles className="inline-block ml-2 text-yellow-400" />
          </motion.div>
        </ItemGlowEffect>
      )}
      
      <motion.div 
        className="w-full mt-2 relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-center mb-1">
          <div className="bg-black/40 backdrop-blur-sm px-4 py-1 rounded-full">
            <h2 className="text-lg font-bold text-white text-center flex items-center">
              <User className="h-4 w-4 text-blue-400 mr-2" />
              Your {playerHands.length > 1 ? "Hands" : "Hand"}
            </h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 z-10">
          {playerHands.map((hand, handIndex) => (
            <div 
              key={handIndex} 
              className={`relative ${isCurrentHand(handIndex) ? 'ring-2 ring-green-500 ring-offset-1' : ''}`}
            >
              {isCurrentHand(handIndex) && (
                <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center z-20">
                  ↓
                </div>
              )}
              <div className="bg-gray-800/80 backdrop-blur-sm p-3 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gray-900/50 px-2 py-1 text-xs rounded-bl-lg">
                  <span className="font-bold text-white">Hand {handIndex + 1}</span>
                  <span className="text-yellow-400 ml-2">{hand.bet}</span>
                  {hand.doubledDown && <span className="text-green-400 ml-1">(2x)</span>}
                </div>
                
                <div className="relative flex justify-center">
                  <div className="flex justify-center flex-wrap gap-1 mt-6">
                    {hand.cards.map((card, cardIndex) => (
                      <ItemGlowEffect 
                        key={cardIndex}
                        isActive={gameState === 'gameOver' && hand.result === 'win'}
                        color="rgba(0, 255, 0, 0.5)"
                      >
                        <motion.div
                          initial={{ y: 50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: cardIndex * 0.1 + 0.2 }}
                        >
                          <Card className="w-20 h-32 flex flex-col items-center justify-center text-xl font-bold bg-white shadow-xl border-2">
                            <div className={`absolute top-2 left-2 ${getCardColor(card.suit)}`}>
                              <div>{card.value}</div>
                            </div>
                            <div className={`text-3xl ${getCardColor(card.suit)}`}>
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
                
                <div className="mt-2 flex justify-between items-center">
                  <div className={`font-bold ${
                    calculateHandValue(hand.cards) > 21 
                      ? 'text-red-400' 
                      : calculateHandValue(hand.cards) === 21 
                        ? 'text-green-400' 
                        : 'text-white'
                  }`}>
                    Value: {calculateHandValue(hand.cards)}
                  </div>
                  
                  {hand.result && hand.result !== 'playing' && (
                    <div className={`font-bold ${getResultColor(hand.result)}`}>
                      {getResultMessage(hand)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      
      <motion.div 
        className="w-full mt-8 flex flex-col items-center relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {gameState === 'betting' && (
          <div className="w-full max-w-xl bg-black/30 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col items-center">
                <div className="text-white mb-2">Hands to Play</div>
                <div className="flex items-center">
                  <Button 
                    variant="outline"
                    onClick={removeHand} 
                    disabled={activeHandCount <= 1}
                    className="w-10 h-10 rounded-full bg-red-900/50 border-red-500/50 text-white hover:bg-red-800"
                  >
                    -
                  </Button>
                  <div className="mx-3 text-2xl font-bold text-white">
                    {activeHandCount}
                  </div>
                  <Button 
                    variant="outline"
                    onClick={addHand} 
                    disabled={activeHandCount >= MAX_HANDS}
                    className="w-10 h-10 rounded-full bg-green-900/50 border-green-500/50 text-white hover:bg-green-800"
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="text-white mb-2">Bet Amount</div>
                <div className="flex items-center">
                  <Button 
                    variant="outline"
                    onClick={() => setBet(prev => Math.max(minBet, prev - getBetIncrement()))}
                    disabled={bet <= minBet}
                    className="w-10 h-10 rounded-full bg-red-900/50 border-red-500/50 text-white hover:bg-red-800"
                  >
                    -
                  </Button>
                  <div className="mx-3 text-2xl font-bold text-yellow-400">
                    {bet}
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setBet(prev => Math.min(Math.min(balance, maxBet), prev + getBetIncrement()))}
                    disabled={bet >= Math.min(balance, maxBet)}
                    className="w-10 h-10 rounded-full bg-green-900/50 border-green-500/50 text-white hover:bg-green-800"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={dealCards}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-lg border border-blue-400/30 shadow-lg"
            >
              Deal Cards (Total: {(bet * activeHandCount).toFixed(2)})
            </Button>
          </div>
        )}
        
        {gameState === 'playing' && currentHandIndex < playerHands.length && (
          <div className="grid grid-cols-4 gap-2 w-full max-w-xl bg-black/30 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50">
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
              disabled={playerHands[currentHandIndex].cards.length > 2 || balance < playerHands[currentHandIndex].bet || playerHands[currentHandIndex].stand}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold py-3 rounded-lg border border-purple-400/30 col-span-1 relative overflow-hidden"
            >
              <span className="relative z-10">Double</span>
              {playerHands[currentHandIndex].cards.length === 2 && balance >= playerHands[currentHandIndex].bet && !playerHands[currentHandIndex].stand && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="absolute h-10 w-10 bg-purple-400/20 rounded-full animate-ping"></span>
                </span>
              )}
            </Button>
            
            <Button 
              onClick={splitHand}
              disabled={!canSplitHand(playerHands[currentHandIndex]) || balance < playerHands[currentHandIndex].bet}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-bold py-3 rounded-lg border border-amber-400/30 col-span-1 relative overflow-hidden"
            >
              <Scissors className="mr-1 h-4 w-4" />
              <span className="relative z-10">Split</span>
              {canSplitHand(playerHands[currentHandIndex]) && balance >= playerHands[currentHandIndex].bet && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="absolute h-10 w-10 bg-amber-400/20 rounded-full animate-ping"></span>
                </span>
              )}
            </Button>
          </div>
        )}
        
        {gameState === 'dealerTurn' && (
          <div className="w-full max-w-xl bg-black/30 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50">
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
          <div className="w-full max-w-xl bg-black/30 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50">
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
