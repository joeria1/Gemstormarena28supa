import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useToast } from '../ui/use-toast';
import { useUser } from '../../context/UserContext';
import BettingOptions from './BettingOptions';

// Card types and deck
type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Value = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
type PlayingCard = {
  suit: Suit;
  value: Value;
  hidden?: boolean;
};

// Define a hand in blackjack
interface BlackjackHand {
  cards: PlayingCard[];
  bet: number;
  result: 'playing' | 'won' | 'lost' | 'push' | 'blackjack';
  settled: boolean;
  doubleDown: boolean;
  stand: boolean;
}

// This reference exists outside of the component and will never be cleared by React
const globalDoubledCards = {
  storage: {} as Record<string, PlayingCard[]>
};

// Function to generate a fresh deck of cards
const generateDeck = (): PlayingCard[] => {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values: Value[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: PlayingCard[] = [];

  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }

  return shuffleDeck(deck);
};

// Fisher-Yates shuffle algorithm
const shuffleDeck = (deck: PlayingCard[]): PlayingCard[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Function to calculate the value of a hand
const calculateHandValue = (cards: PlayingCard[]): number => {
  let value = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.hidden) continue;

    if (card.value === 'A') {
      aces++;
      value += 11;
    } else if (['K', 'Q', 'J'].includes(card.value)) {
      value += 10;
    } else {
      value += parseInt(card.value as string);
    }
  }

  // Adjust for aces
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
};

// Card component
const PlayingCardComponent: React.FC<{ card: PlayingCard }> = ({ card }) => {
  if (card.hidden) {
    return (
      <div className="w-20 h-28 bg-gradient-to-br from-blue-700 to-blue-900 rounded-md m-1 flex items-center justify-center border-2 border-blue-400 text-white">
        <span className="text-xl font-bold">?</span>
      </div>
    );
  }

  const suitColor = card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-600' : 'text-black';
  
  const getSuitSymbol = (suit: Suit) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
    }
  };

  return (
    <div className="w-20 h-28 bg-white rounded-md m-1 flex flex-col items-center justify-between p-2 border border-gray-300 shadow-md">
      <div className="self-start">
        <span className={`font-bold ${suitColor}`}>{card.value}</span>
      </div>
      <div className={`text-2xl ${suitColor}`}>
        {getSuitSymbol(card.suit)}
      </div>
      <div className="self-end rotate-180">
        <span className={`font-bold ${suitColor}`}>{card.value}</span>
      </div>
    </div>
  );
};

const MAX_HANDS = 3;

const MultiHandBlackjack: React.FC = () => {
  const { toast } = useToast();
  const { user, updateBalance } = useUser();
  
  const [deck, setDeck] = useState<PlayingCard[]>(generateDeck());
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([]);
  const [playerHands, setPlayerHands] = useState<BlackjackHand[]>([]);
  const [currentHandIndex, setCurrentHandIndex] = useState<number>(0);
  const [gamePhase, setGamePhase] = useState<'betting' | 'playing' | 'dealer' | 'results'>('betting');
  const [betAmount, setBetAmount] = useState<number>(10);
  const [activeHandCount, setActiveHandCount] = useState<number>(1);
  
  // Initialize the game
  const initializeGame = () => {
    setDeck(generateDeck());
    setDealerHand([]);
    setPlayerHands([]);
    setGamePhase('betting');
    // Clear the global storage when starting a new game
    Object.keys(globalDoubledCards.storage).forEach(key => {
      delete globalDoubledCards.storage[key];
    });
  };

  // Add a new player hand
  const addPlayerHand = () => {
    if (activeHandCount < MAX_HANDS) {
      setActiveHandCount(prev => prev + 1);
    }
  };

  // Remove a player hand
  const removePlayerHand = () => {
    if (activeHandCount > 1) {
      setActiveHandCount(prev => prev - 1);
    }
  };

  // Start the game
  const startGame = () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You need to be logged in to play.",
        variant: "destructive",
      });
      return;
    }

    const totalBet = betAmount * activeHandCount;
    if (user.balance < totalBet) {
      toast({
        title: "Insufficient funds",
        description: `You need $${totalBet.toFixed(2)} to place these bets.`,
        variant: "destructive",
      });
      return;
    }

    updateBalance(-totalBet);
    
    const newDeck = [...deck];
    
    // Create dealer's hand with explicit hidden property
    const newDealerHand: PlayingCard[] = [
      { ...newDeck.pop()!, hidden: false },
      { ...newDeck.pop()!, hidden: true }
    ];
    
    const initialPlayerHands: BlackjackHand[] = [];
    
    for (let i = 0; i < activeHandCount; i++) {
      // Make sure each card has hidden property set to false
      const card1 = { ...newDeck.pop()!, hidden: false };
      const card2 = { ...newDeck.pop()!, hidden: false };
      
      initialPlayerHands.push({
        cards: [card1, card2],
        bet: betAmount,
        result: 'playing',
        settled: false,
        doubleDown: false,
        stand: false
      });
    }
    
    setDeck(newDeck);
    setDealerHand(newDealerHand);
    setPlayerHands(initialPlayerHands);
    setCurrentHandIndex(0);
    setGamePhase('playing');
  };
  
  // Hit action for current hand
  const handleHit = () => {
    if (gamePhase !== 'playing') return;
    
    const currentHand = playerHands[currentHandIndex];
    const newDeck = [...deck];
    const newCard = { ...newDeck.pop()!, hidden: false };
    
    const updatedHands = [...playerHands];
    updatedHands[currentHandIndex] = {
      ...currentHand,
      cards: [...currentHand.cards, newCard]
    };
    
    setDeck(newDeck);
    setPlayerHands(updatedHands);
    
    // Check for bust
    const newHandValue = calculateHandValue([...currentHand.cards, newCard]);
    if (newHandValue > 21) {
      handleBust();
    }
  };
  
  // Stand action for current hand
  const handleStand = () => {
    if (gamePhase !== 'playing') return;
    
    const updatedHands = [...playerHands];
    updatedHands[currentHandIndex] = {
      ...updatedHands[currentHandIndex],
      stand: true
    };
    
    setPlayerHands(updatedHands);
    
    // Move to next hand or dealer phase
    moveToNextHandOrDealer();
  };
  
  // Double down action for current hand
  const handleDoubleDown = () => {
    if (gamePhase !== 'playing') return;
    
    const currentHand = playerHands[currentHandIndex];
    
    // Check if we can double down (only with first two cards)
    if (currentHand.cards.length !== 2) return;
    
    // Check if player has enough balance
    if (!user || user.balance < currentHand.bet) {
      toast({
        title: "Insufficient funds",
        description: `You need an additional $${currentHand.bet.toFixed(2)} to double down.`,
        variant: "destructive",
      });
      return;
    }
    
    // Deduct additional bet amount
    updateBalance(-currentHand.bet);
    
    // Deal one more card and stand
    const newDeck = [...deck];
    const newCard = { ...newDeck.pop()!, hidden: false };
    
    // Store the entire hand in our global storage
    const completeHand = [...currentHand.cards, newCard];
    const gameId = Date.now().toString(); // Use unique ID for this game
    const handKey = `hand_${currentHandIndex}_${gameId}`;
    globalDoubledCards.storage[handKey] = [...completeHand];
    
    // Update component state
    const updatedHands = [...playerHands];
    updatedHands[currentHandIndex] = {
      ...currentHand,
      cards: completeHand,
      bet: currentHand.bet * 2,
      doubleDown: true,
      stand: true
    };
    
    setDeck(newDeck);
    setPlayerHands(updatedHands);
    
    // Check for bust
    const newHandValue = calculateHandValue(completeHand);
    if (newHandValue > 21) {
      handleBust();
    } else {
      // Move to next hand or dealer phase
      moveToNextHandOrDealer();
    }
  };
  
  // Handle bust for current hand
  const handleBust = () => {
    const updatedHands = [...playerHands];
    updatedHands[currentHandIndex] = {
      ...updatedHands[currentHandIndex],
      result: 'lost',
      settled: true,
      stand: true
    };
    
    setPlayerHands(updatedHands);
    
    // Move to next hand or dealer phase
    moveToNextHandOrDealer();
  };
  
  // Move to next hand or dealer phase
  const moveToNextHandOrDealer = () => {
    const nextHandIndex = currentHandIndex + 1;
    
    if (nextHandIndex < playerHands.length) {
      setCurrentHandIndex(nextHandIndex);
    } else {
      // All hands played, move to dealer phase
      setGamePhase('dealer');
    }
  };
  
  // Rendering function to handle doubled-down hands properly
  const renderHandCards = (hand: BlackjackHand, handIndex: number) => {
    // Create a unique key pattern for this hand
    const handKeyPattern = `hand_${handIndex}_`;
    
    // If this is a doubled-down hand, look for matching keys in global storage
    if (hand.doubleDown) {
      const matchingKey = Object.keys(globalDoubledCards.storage).find(key => 
        key.startsWith(handKeyPattern)
      );
      
      if (matchingKey && globalDoubledCards.storage[matchingKey]?.length === 3) {
        // Use the cards from global storage to ensure all three cards are displayed
        return globalDoubledCards.storage[matchingKey].map((card, cardIndex) => (
          <PlayingCardComponent 
            key={`player-${handIndex}-${cardIndex}-global`} 
            card={card} 
          />
        ));
      }
    }
    
    // If this is a doubled-down hand missing its third card
    if (hand.doubleDown && hand.cards.length < 3) {
      return (
        <>
          {/* Render the cards we have */}
          {hand.cards.map((card, cardIndex) => (
            <PlayingCardComponent 
              key={`player-${handIndex}-${cardIndex}`} 
              card={card} 
            />
          ))}
          
          {/* Add a placeholder card for the doubled-down hand */}
          <div className="w-20 h-28 bg-gradient-to-br from-gray-300 to-white rounded-md m-1 flex items-center justify-center border border-gray-300">
            <span className="text-gray-400 font-bold text-sm">Card missing</span>
          </div>
        </>
      );
    }
    
    // Normal rendering for other hands
    return hand.cards.map((card, cardIndex) => (
      <PlayingCardComponent 
        key={`player-${handIndex}-${cardIndex}`} 
        card={card} 
      />
    ));
  };

  // Helper function to get the correct hand value
  const getHandValue = (hand: BlackjackHand, handIndex: number): number => {
    // If this is a doubled down hand, check if we have cards in global storage
    if (hand.doubleDown) {
      // Look for matching keys in the global storage
      const handKeyPattern = `hand_${handIndex}_`;
      const matchingKey = Object.keys(globalDoubledCards.storage).find(key => 
        key.startsWith(handKeyPattern)
      );
      
      if (matchingKey && globalDoubledCards.storage[matchingKey]) {
        return calculateHandValue(globalDoubledCards.storage[matchingKey]);
      }
    }
    
    // Otherwise just calculate from the hand cards
    return calculateHandValue(hand.cards);
  };

  // Helper function to get the status text for a hand
  const getHandStatusText = (hand: BlackjackHand, handIndex: number): string => {
    // If the hand is settled, show the result
    if (hand.settled) {
      if (hand.result === 'blackjack') return "Blackjack!";
      if (hand.result === 'won') return "Won!";
      if (hand.result === 'lost') return "Lost!";
      if (hand.result === 'push') return "Push!";
    }
    
    const value = getHandValue(hand, handIndex);
    
    if (value > 21) return "Bust!";
    if (hand.doubleDown) return `Doubled: ${value}`;
    if (hand.cards.length === 2 && value === 21) return "Blackjack!";
    
    return value.toString();
  };

  // Get hand CSS class based on status
  const getHandStatusClass = (hand: BlackjackHand, isCurrentHand: boolean) => {
    if (gamePhase !== 'playing') return '';
    
    if (isCurrentHand) {
      return 'ring-2 ring-green-500 ring-offset-2';
    }
    return '';
  };
  
  // Function to get result color class
  const getResultColorClass = (hand: BlackjackHand) => {
    if (hand.result === 'blackjack' || hand.result === 'won') {
      return 'text-green-500 font-bold';
    } else if (hand.result === 'lost') {
      return 'text-red-500 font-bold';
    } else if (hand.result === 'push') {
      return 'text-blue-500 font-bold';
    }
    return '';
  };

  // Update dealer effect
  useEffect(() => {
    if (gamePhase !== 'dealer') return;
    
    // Reveal dealer's hidden card
    setDealerHand(prev => prev.map(card => ({ ...card, hidden: false })));
    
    // Check if there are any hands still in play
    const activeHands = playerHands.filter(hand => !hand.settled);
    if (activeHands.length === 0) {
      // Add a timeout before changing state to ensure all updates are processed
      setTimeout(() => {
        setGamePhase('results');
      }, 50);
      return;
    }
    
    // Dealer draws until 17 or higher
    const dealerPlay = async () => {
      let currentDealerHand = dealerHand.map(card => ({ ...card, hidden: false }));
      let currentDeck = [...deck];
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      while (calculateHandValue(currentDealerHand) < 17) {
        const newCard = { ...currentDeck.pop()!, hidden: false };
        currentDealerHand = [...currentDealerHand, newCard];
        
        // Use complete copies
        setDealerHand([...currentDealerHand]);
        setDeck([...currentDeck]);
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Add a timeout before changing state to ensure all updates are processed
      setTimeout(() => {
        // This prevents mutation of state during phase change
        setPlayerHands(hands => hands.map(hand => ({
          ...hand,
          cards: [...hand.cards] // Ensure cards are deep copied
        })));
        
        setTimeout(() => {
          setGamePhase('results');
        }, 50);
      }, 100);
    };
    
    dealerPlay();
  }, [gamePhase, dealerHand, deck, playerHands]);

  // Calculate results when dealer is done
  useEffect(() => {
    if (gamePhase !== 'results') return;
    
    // Process with a short delay to ensure all rendering is complete
    setTimeout(() => {
      const dealerValue = calculateHandValue(dealerHand);
      const dealerBusted = dealerValue > 21;
      
      const updatedHands = playerHands.map((hand, handIndex) => {
        if (hand.settled) return hand;
        
        // Get the correct hand value using our helper
        const handValue = getHandValue(hand, handIndex);
        
        // Check for blackjack
        const isBlackjack = !hand.doubleDown && hand.cards.length === 2 && handValue === 21;
        const dealerBlackjack = dealerHand.length === 2 && dealerValue === 21;
        
        if (isBlackjack) {
          if (dealerBlackjack) {
            return { ...hand, result: 'push' as const, settled: true };
          } else {
            return { ...hand, result: 'blackjack' as const, settled: true };
          }
        }
        
        if (dealerBusted) {
          return { ...hand, result: 'won' as const, settled: true };
        }
        
        if (handValue > dealerValue) {
          return { ...hand, result: 'won' as const, settled: true };
        } else if (handValue === dealerValue) {
          return { ...hand, result: 'push' as const, settled: true };
        } else {
          return { ...hand, result: 'lost' as const, settled: true };
        }
      });
      
      // Force a state update to trigger a rerender
      setPlayerHands([...updatedHands]);
      
      // Calculate winnings
      let totalWinnings = 0;
      
      updatedHands.forEach(hand => {
        if (hand.result === 'won') {
          totalWinnings += hand.bet * 2;
        } else if (hand.result === 'blackjack') {
          totalWinnings += hand.bet * 2.5;
        } else if (hand.result === 'push') {
          totalWinnings += hand.bet;
        }
      });
      
      if (totalWinnings > 0) {
        updateBalance(totalWinnings);
        
        toast({
          title: "Winnings",
          description: `You won $${totalWinnings.toFixed(2)}!`,
        });
      }
    }, 300); // Add a delay to ensure all state updates are completed
  }, [gamePhase]);

  return (
    <div className="bg-gray-900 p-4 rounded-lg max-w-5xl mx-auto my-8">
      <div className="flex flex-col items-center space-y-8">
        {/* Dealer section */}
        <div className="w-full">
          <h2 className="text-xl text-white mb-2">Dealer {gamePhase === 'results' && `(${calculateHandValue(dealerHand)})`}</h2>
          <div className="bg-gray-800 p-4 rounded-lg flex flex-wrap justify-center">
            {dealerHand.map((card, index) => (
              <PlayingCardComponent key={`dealer-${index}`} card={card} />
            ))}
          </div>
        </div>
        
        {/* Player hands section */}
        <div className="w-full">
          <h2 className="text-xl text-white mb-2">Your Hands</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playerHands.map((hand, handIndex) => (
              <div 
                key={`hand-${handIndex}`} 
                className={`bg-gray-800 p-4 rounded-lg flex flex-col items-center ${getHandStatusClass(hand, handIndex === currentHandIndex)}`}
              >
                <div className="flex flex-wrap justify-center mb-2">
                  {renderHandCards(hand, handIndex)}
                </div>
                <div className="mt-2 flex flex-col items-center">
                  <span className="text-white">Bet: ${hand.bet.toFixed(2)}</span>
                  <span className={`text-white ${getResultColorClass(hand)}`}>
                    {getHandStatusText(hand, handIndex)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Controls section */}
        {gamePhase === 'betting' && (
          <div className="w-full">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
                <Card className="p-4 flex flex-col items-center">
                  <span className="text-lg mb-2">Number of Hands</span>
                  <div className="flex items-center space-x-4">
                    <Button 
                      onClick={removePlayerHand} 
                      disabled={activeHandCount <= 1}
                      variant="outline"
                    >
                      -
                    </Button>
                    <span className="text-2xl font-bold">{activeHandCount}</span>
                    <Button 
                      onClick={addPlayerHand} 
                      disabled={activeHandCount >= MAX_HANDS}
                      variant="outline"
                    >
                      +
                    </Button>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <BettingOptions
                    currentBet={betAmount}
                    onBetChange={setBetAmount}
                    isGameActive={gamePhase !== 'betting'}
                  />
                </Card>
              </div>
              
              <div className="flex justify-center">
                <Button onClick={startGame} className="bg-green-600 hover:bg-green-700 text-white">
                  Deal Cards (Total Bet: ${(betAmount * activeHandCount).toFixed(2)})
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Game actions */}
        {gamePhase === 'playing' && currentHandIndex < playerHands.length && (
          <div className="w-full">
            <div className="bg-gray-800 p-4 rounded-lg flex flex-wrap justify-center gap-2">
              <Button onClick={handleHit} className="bg-blue-600 hover:bg-blue-700">
                Hit
              </Button>
              <Button onClick={handleStand} className="bg-red-600 hover:bg-red-700">
                Stand
              </Button>
              <Button 
                onClick={handleDoubleDown} 
                disabled={playerHands[currentHandIndex].cards.length !== 2 || user?.balance < playerHands[currentHandIndex].bet}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Double Down
              </Button>
            </div>
          </div>
        )}
        
        {/* Game results and new game */}
        {gamePhase === 'results' && (
          <div className="w-full">
            <div className="bg-gray-800 p-4 rounded-lg flex justify-center">
              <Button onClick={initializeGame} className="bg-green-600 hover:bg-green-700 text-white">
                New Game
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiHandBlackjack;
