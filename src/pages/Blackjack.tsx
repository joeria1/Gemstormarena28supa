import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { Card } from "@/components/ui/card";
import { useSound } from "@/components/SoundManager";
import { preventAutoScroll, disableScrollRestoration } from "@/utils/scrollFix";
import { Gem } from "lucide-react";

// Card values and suits
const CARD_VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const CARD_SUITS = ['♠', '♥', '♦', '♣'];

// Table data
const TABLES = [
  { id: 1, name: "Table 1", minBet: 50, maxBet: 500 },
  { id: 2, name: "Table 2", minBet: 100, maxBet: 1000 },
  { id: 3, name: "Table 3", minBet: 250, maxBet: 2500 },
  { id: 4, name: "Table 4", minBet: 500, maxBet: 5000 },
];

// Define a card type
type BlackjackCard = {
  value: string;
  suit: string;
  hidden?: boolean;
};

// Define a hand type
type Hand = {
  cards: BlackjackCard[];
  bet: number;
  standing: boolean;
  busted: boolean;
  blackjack: boolean;
  finalValue?: number;
};

// Define a player spot
type PlayerSpot = {
  occupied: boolean;
  isBot: boolean;
  name: string;
  hands: Hand[];
  activeHandIndex: number;
};

// Define a table type
type Table = {
  id: number;
  name: string;
  minBet: number;
  maxBet: number;
  spots: PlayerSpot[];
  dealer: {
    cards: BlackjackCard[];
    value: number;
    busted: boolean;
    blackjack: boolean;
  };
  deck: BlackjackCard[];
  isActive: boolean;
  countdown: number;
  gameStarted: boolean;
  roundFinished: boolean;
};

const Blackjack = () => {
  const { user, updateBalance } = useUser();
  const { playSound } = useSound();
  const [tables, setTables] = useState<Table[]>([]);
  const [activeTable, setActiveTable] = useState<number | null>(null);
  const [currentBet, setCurrentBet] = useState<number>(100);
  const [userSpots, setUserSpots] = useState<number[]>([]);

  // Prevent automatic scrolling
  useEffect(() => {
    preventAutoScroll();
    disableScrollRestoration();
    initializeTables();
  }, []);

  // Initialize tables
  const initializeTables = () => {
    const initializedTables = TABLES.map(table => ({
      ...table,
      spots: Array(5).fill(null).map(() => ({
        occupied: false,
        isBot: false,
        name: "",
        hands: [],
        activeHandIndex: 0
      })),
      dealer: {
        cards: [],
        value: 0,
        busted: false,
        blackjack: false
      },
      deck: [],
      isActive: false,
      countdown: 10,
      gameStarted: false,
      roundFinished: false
    }));
    setTables(initializedTables);
  };

  // Create a new deck and shuffle it
  const createDeck = (): BlackjackCard[] => {
    const deck: BlackjackCard[] = [];
    for (const suit of CARD_SUITS) {
      for (const value of CARD_VALUES) {
        deck.push({ value, suit });
      }
    }
    
    // Shuffle the deck (Fisher-Yates algorithm)
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
  };

  // Draw a card from the deck
  const drawCard = (tableId: number, hidden = false): BlackjackCard => {
    const tableIndex = tables.findIndex(t => t.id === tableId);
    if (tableIndex === -1) return { value: '2', suit: '♠' }; // Fallback
    
    const updatedTables = [...tables];
    let deck = [...updatedTables[tableIndex].deck];
    
    // If deck is running low, create a new deck
    if (deck.length < 10) {
      deck = createDeck();
    }
    
    const card = { ...deck.pop()!, hidden };
    updatedTables[tableIndex].deck = deck;
    setTables(updatedTables);
    
    return card;
  };

  // Calculate the value of a hand
  const calculateHandValue = (cards: BlackjackCard[]): number => {
    let value = 0;
    let aceCount = 0;

    // Count visible cards only
    for (const card of cards.filter(c => !c.hidden)) {
      if (card.value === 'A') {
        aceCount++;
        value += 11;
      } else if (['K', 'Q', 'J'].includes(card.value)) {
        value += 10;
      } else {
        value += parseInt(card.value);
      }
    }

    // Adjust for aces
    while (value > 21 && aceCount > 0) {
      value -= 10;
      aceCount--;
    }

    return value;
  };

  // Join a table at a specific spot
  const joinTable = (tableId: number, spotIndex: number) => {
    if (!user) {
      toast.error("Please login to play");
      return;
    }

    const tableIndex = tables.findIndex(t => t.id === tableId);
    if (tableIndex === -1) return;
    
    const table = tables[tableIndex];
    
    // Check if spot is available
    if (table.spots[spotIndex].occupied) {
      toast.error("This spot is already taken");
      return;
    }
    
    // Check if player already has 3 spots
    if (userSpots.filter(spot => Math.floor(spot / 10) === tableId).length >= 3) {
      toast.error("You can only play with 3 hands per table");
      return;
    }
    
    // Check if table is already playing
    if (table.gameStarted && !table.roundFinished) {
      toast.error("Game already in progress. Wait for next round");
      return;
    }
    
    const updatedTables = [...tables];
    updatedTables[tableIndex].spots[spotIndex] = {
      occupied: true,
      isBot: false,
      name: user.name || "Player",
      hands: [],
      activeHandIndex: 0
    };
    
    // Mark table as active and start countdown if this is the first player
    if (!updatedTables[tableIndex].isActive) {
      updatedTables[tableIndex].isActive = true;
      updatedTables[tableIndex].countdown = 10;
      updatedTables[tableIndex].deck = createDeck();
      
      // Start countdown
      startCountdown(tableId);
    }
    
    setTables(updatedTables);
    setActiveTable(tableId);
    setUserSpots([...userSpots, tableId * 10 + spotIndex]);
    
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-quick-win-video-game-notification-269.mp3');
    toast.success(`Joined ${table.name} at spot ${spotIndex + 1}`);
  };

  // Add a bot to a table
  const addBot = (tableId: number, spotIndex: number) => {
    const tableIndex = tables.findIndex(t => t.id === tableId);
    if (tableIndex === -1) return;
    
    const table = tables[tableIndex];
    
    // Check if spot is available
    if (table.spots[spotIndex].occupied) {
      toast.error("This spot is already taken");
      return;
    }
    
    const updatedTables = [...tables];
    const botNames = ["Bot Alice", "Bot Bob", "Bot Charlie", "Bot Dave", "Bot Eve"];
    const randomName = botNames[Math.floor(Math.random() * botNames.length)];
    
    updatedTables[tableIndex].spots[spotIndex] = {
      occupied: true,
      isBot: true,
      name: randomName,
      hands: [],
      activeHandIndex: 0
    };
    
    // Mark table as active and start countdown if this is the first player
    if (!updatedTables[tableIndex].isActive) {
      updatedTables[tableIndex].isActive = true;
      updatedTables[tableIndex].countdown = 10;
      updatedTables[tableIndex].deck = createDeck();
      
      // Start countdown
      startCountdown(tableId);
    }
    
    setTables(updatedTables);
    
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-arcade-mechanical-bling-210.mp3');
  };

  // Start the countdown to game start
  const startCountdown = (tableId: number) => {
    const intervalId = setInterval(() => {
      setTables(prevTables => {
        const tableIndex = prevTables.findIndex(t => t.id === tableId);
        if (tableIndex === -1) {
          clearInterval(intervalId);
          return prevTables;
        }
        
        const updatedTables = [...prevTables];
        const table = updatedTables[tableIndex];
        
        if (table.countdown > 0) {
          updatedTables[tableIndex].countdown = table.countdown - 1;
        } else {
          // Start the game
          clearInterval(intervalId);
          startGame(tableId);
        }
        
        return updatedTables;
      });
    }, 1000);
  };

  // Place bet and start the game
  const placeBet = (tableId: number, spotIndex: number, amount: number) => {
    if (!user) {
      toast.error("Please login to play");
      return;
    }
    
    if (user.balance < amount) {
      toast.error("Insufficient balance");
      return;
    }
    
    const tableIndex = tables.findIndex(t => t.id === tableId);
    if (tableIndex === -1) return;
    
    const table = tables[tableIndex];
    const spot = table.spots[spotIndex];
    
    // Check if player is on this spot
    if (!spot.occupied || spot.isBot) return;
    
    // Check if game already started
    if (table.gameStarted && !table.roundFinished) return;
    
    // Check if bet is within table limits
    if (amount < table.minBet || amount > table.maxBet) {
      toast.error(`Bet must be between ${table.minBet} and ${table.maxBet}`);
      return;
    }
    
    // Deduct bet amount
    updateBalance(-amount);
    
    const updatedTables = [...tables];
    const newHand: Hand = {
      cards: [],
      bet: amount,
      standing: false,
      busted: false,
      blackjack: false
    };
    
    // Add the hand to the player
    if (!updatedTables[tableIndex].spots[spotIndex].hands) {
      updatedTables[tableIndex].spots[spotIndex].hands = [];
    }
    
    updatedTables[tableIndex].spots[spotIndex].hands.push(newHand);
    setTables(updatedTables);
    
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-poker-chips-handling-1994.mp3');
  };

  // Start the game for a table
  const startGame = (tableId: number) => {
    const tableIndex = tables.findIndex(t => t.id === tableId);
    if (tableIndex === -1) return;
    
    const updatedTables = [...tables];
    const table = updatedTables[tableIndex];
    
    // Place bets for bots
    table.spots.forEach((spot, spotIndex) => {
      if (spot.occupied && spot.isBot) {
        const botBet = table.minBet + Math.floor(Math.random() * (table.maxBet - table.minBet) / 100) * 100;
        const newHand: Hand = {
          cards: [],
          bet: botBet,
          standing: false,
          busted: false,
          blackjack: false
        };
        spot.hands = [newHand];
      }
    });
    
    // Check if any player has placed bets
    const anyBets = table.spots.some(spot => spot.occupied && spot.hands && spot.hands.length > 0);
    
    if (!anyBets) {
      // No bets placed, reset table
      updatedTables[tableIndex].isActive = false;
      updatedTables[tableIndex].countdown = 10;
      setTables(updatedTables);
      return;
    }
    
    // Deal initial cards
    table.dealer.cards = [
      drawCard(tableId),
      drawCard(tableId, true) // Dealer's second card is hidden
    ];
    table.dealer.value = calculateHandValue(table.dealer.cards);
    
    // Deal cards to players
    table.spots.forEach((spot, spotIndex) => {
      if (spot.occupied && spot.hands && spot.hands.length > 0) {
        spot.hands.forEach((hand, handIndex) => {
          hand.cards = [
            drawCard(tableId),
            drawCard(tableId)
          ];
          
          const handValue = calculateHandValue(hand.cards);
          hand.blackjack = handValue === 21 && hand.cards.length === 2;
          
          // Update hand in state
          updatedTables[tableIndex].spots[spotIndex].hands[handIndex] = hand;
        });
      }
    });
    
    updatedTables[tableIndex].gameStarted = true;
    updatedTables[tableIndex].roundFinished = false;
    setTables(updatedTables);
    
    // Check for blackjacks and proceed with game
    setTimeout(() => {
      checkForBlackjacks(tableId);
    }, 1000);
  };

  // Check for blackjacks at the start of the game
  const checkForBlackjacks = (tableId: number) => {
    const tableIndex = tables.findIndex(t => t.id === tableId);
    if (tableIndex === -1) return;
    
    const updatedTables = [...tables];
    const table = updatedTables[tableIndex];
    
    // Reveal dealer's hidden card if dealer has blackjack
    const dealerCards = [...table.dealer.cards];
    if (dealerCards[1].hidden) {
      dealerCards[1].hidden = false;
    }
    table.dealer.value = calculateHandValue(dealerCards);
    table.dealer.blackjack = table.dealer.value === 21 && dealerCards.length === 2;
    
    // If dealer has blackjack, end the round
    if (table.dealer.blackjack) {
      table.roundFinished = true;
      
      // Settle all bets
      table.spots.forEach((spot, spotIndex) => {
        if (spot.occupied && spot.hands && spot.hands.length > 0) {
          spot.hands.forEach((hand, handIndex) => {
            if (hand.blackjack) {
              // Push (tie) - return bet
              if (!spot.isBot) {
                updateBalance(hand.bet);
                toast.info("Push! You tied with the dealer's blackjack");
              }
            } else {
              // Loss - no action needed as bet was already deducted
              if (!spot.isBot) {
                toast.error("Dealer has blackjack. You lose!");
              }
            }
            
            hand.finalValue = calculateHandValue(hand.cards);
            updatedTables[tableIndex].spots[spotIndex].hands[handIndex] = hand;
          });
        }
      });
      
      // Set timer for next round
      setTimeout(() => {
        resetTable(tableId);
      }, 5000);
    } else {
      // Continue with player turns - start with the first player with bets
      processNextPlayerTurn(tableId);
    }
    
    setTables(updatedTables);
  };

  // Process the next player's turn
  const processNextPlayerTurn = (tableId: number) => {
    const tableIndex = tables.findIndex(t => t.id === tableId);
    if (tableIndex === -1) return;
    
    const table = tables[tableIndex];
    
    // Find the first player/hand that hasn't acted yet
    let nextPlayerFound = false;
    
    for (let spotIndex = 0; spotIndex < table.spots.length; spotIndex++) {
      const spot = table.spots[spotIndex];
      
      if (spot.occupied && spot.hands && spot.hands.length > 0) {
        const activeHandIndex = spot.activeHandIndex;
        
        if (activeHandIndex < spot.hands.length) {
          const hand = spot.hands[activeHandIndex];
          
          if (!hand.standing && !hand.busted && !hand.blackjack) {
            nextPlayerFound = true;
            
            // If it's a bot, make a decision
            if (spot.isBot) {
              makeBotDecision(tableId, spotIndex, activeHandIndex);
            }
            
            break;
          }
        }
      }
    }
    
    // If all players have acted, move to dealer's turn
    if (!nextPlayerFound) {
      playDealerTurn(tableId);
    }
  };

  // Make a decision for a bot player
  const makeBotDecision = (tableId: number, spotIndex: number, handIndex: number) => {
    const tableIndex = tables.findIndex(t => t.id === tableId);
    if (tableIndex === -1) return;
    
    const table = tables[tableIndex];
    const spot = table.spots[spotIndex];
    const hand = spot.hands[handIndex];
    
    const handValue = calculateHandValue(hand.cards);
    
    setTimeout(() => {
      // Bot decision logic
      if (handValue < 17) {
        // Hit
        hit(tableId, spotIndex, handIndex);
      } else {
        // Stand
        stand(tableId, spotIndex, handIndex);
      }
    }, 1000);
  };

  // Hit - take another card
  const hit = (tableId: number, spotIndex: number, handIndex: number) => {
    const tableIndex = tables.findIndex(t => t.id === tableId);
    if (tableIndex === -1) return;
    
    const updatedTables = [...tables];
    const table = updatedTables[tableIndex];
    const spot = table.spots[spotIndex];
    const hand = spot.hands[handIndex];
    
    // Draw a new card
    const newCard = drawCard(tableId);
    hand.cards.push(newCard);
    
    // Check if busted
    const handValue = calculateHandValue(hand.cards);
    
    if (handValue > 21) {
      hand.busted = true;
      
      // Move to next hand or player
      if (handIndex < spot.hands.length - 1) {
        spot.activeHandIndex = handIndex + 1;
      } else {
        // Move to next player with active hands
        processNextPlayerTurn(tableId);
      }
      
      // Notify if it's a real player
      if (!spot.isBot) {
        playSound('https://assets.mixkit.co/sfx/preview/mixkit-retro-arcade-lose-2027.mp3');
        toast.error("Bust! You went over 21.");
      }
    }
    
    updatedTables[tableIndex].spots[spotIndex].hands[handIndex] = hand;
    setTables(updatedTables);
    
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-quick-jump-arcade-game-239.mp3');
    
    // If not busted and not a bot, let player continue
    if (!hand.busted && !spot.isBot) return;
    
    // If busted or bot, check for next action
    if (hand.busted) {
      setTimeout(() => {
        if (handIndex < spot.hands.length - 1) {
          // Move to next hand
        } else {
          // Move to next player
          processNextPlayerTurn(tableId);
        }
      }, 1000);
    } else {
      // Bot continues decision
      setTimeout(() => {
        makeBotDecision(tableId, spotIndex, handIndex);
      }, 1000);
    }
  };

  // Stand - end turn for this hand
  const stand = (tableId: number, spotIndex: number, handIndex: number) => {
    const tableIndex = tables.findIndex(t => t.id === tableId);
    if (tableIndex === -1) return;
    
    const updatedTables = [...tables];
    const table = updatedTables[tableIndex];
    const spot = table.spots[spotIndex];
    const hand = spot.hands[handIndex];
    
    hand.standing = true;
    hand.finalValue = calculateHandValue(hand.cards);
    
    updatedTables[tableIndex].spots[spotIndex].hands[handIndex] = hand;
    
    // Move to next hand or player
    if (handIndex < spot.hands.length - 1) {
      spot.activeHandIndex = handIndex + 1;
    } else {
      // Move to next player with active hands
      processNextPlayerTurn(tableId);
    }
    
    setTables(updatedTables);
    
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3');
  };

  // Play dealer's turn
  const playDealerTurn = (tableId: number) => {
    const tableIndex = tables.findIndex(t => t.id === tableId);
    if (tableIndex === -1) return;
    
    const updatedTables = [...tables];
    const table = updatedTables[tableIndex];
    
    // Reveal dealer's hidden card
    const dealerCards = [...table.dealer.cards];
    if (dealerCards[1].hidden) {
      dealerCards[1].hidden = false;
    }
    table.dealer.cards = dealerCards;
    table.dealer.value = calculateHandValue(dealerCards);
    
    setTables(updatedTables);
    
    // Delay for animation
    setTimeout(() => {
      dealerDrawCards(tableId);
    }, 1000);
  };

  // Dealer draws cards until reaching 17 or busting
  const dealerDrawCards = (tableId: number) => {
    const tableIndex = tables.findIndex(t => t.id === tableId);
    if (tableIndex === -1) return;
    
    const updatedTables = [...tables];
    const table = updatedTables[tableIndex];
    
    // Dealer draws until 17 or higher
    if (table.dealer.value < 17) {
      const newCard = drawCard(tableId);
      table.dealer.cards.push(newCard);
      table.dealer.value = calculateHandValue(table.dealer.cards);
      
      setTables(updatedTables);
      
      playSound('https://assets.mixkit.co/sfx/preview/mixkit-quick-jump-arcade-game-239.mp3');
      
      // Continue drawing
      setTimeout(() => {
        dealerDrawCards(tableId);
      }, 1000);
    } else {
      // Dealer is done drawing
      table.dealer.busted = table.dealer.value > 21;
      
      // Settle all bets
      settleRound(tableId);
    }
  };

  // Settle the round and pay winners
  const settleRound = (tableId: number) => {
    const tableIndex = tables.findIndex(t => t.id === tableId);
    if (tableIndex === -1) return;
    
    const updatedTables = [...tables];
    const table = updatedTables[tableIndex];
    
    // Process each player's hand
    table.spots.forEach((spot, spotIndex) => {
      if (spot.occupied && spot.hands && spot.hands.length > 0) {
        spot.hands.forEach((hand, handIndex) => {
          // Skip hands that were already settled (blackjacks)
          if (hand.blackjack && table.dealer.blackjack) return;
          
          const handValue = hand.finalValue || calculateHandValue(hand.cards);
          hand.finalValue = handValue;
          
          if (hand.busted) {
            // Player busted - loss (no action needed as bet was already deducted)
          } else if (table.dealer.busted) {
            // Dealer busted - win
            const winnings = hand.bet * 2; // Original bet + win
            if (!spot.isBot) {
              updateBalance(winnings);
              toast.success(`Dealer busted! You win ${winnings} gems!`);
            }
          } else if (handValue > table.dealer.value) {
            // Player wins
            const winnings = hand.bet * 2; // Original bet + win
            if (!spot.isBot) {
              updateBalance(winnings);
              toast.success(`You win ${winnings} gems with ${handValue} vs dealer's ${table.dealer.value}!`);
            }
          } else if (handValue === table.dealer.value) {
            // Push (tie)
            if (!spot.isBot) {
              updateBalance(hand.bet); // Return bet
              toast.info(`Push! You tied with the dealer at ${handValue}.`);
            }
          } else {
            // Dealer wins
            if (!spot.isBot) {
              toast.error(`Dealer wins with ${table.dealer.value} vs your ${handValue}.`);
            }
          }
          
          updatedTables[tableIndex].spots[spotIndex].hands[handIndex] = hand;
        });
      }
    });
    
    table.roundFinished = true;
    setTables(updatedTables);
    
    // Set timer for next round
    setTimeout(() => {
      resetTable(tableId);
    }, 5000);
  };

  // Reset the table for a new round
  const resetTable = (tableId: number) => {
    const tableIndex = tables.findIndex(t => t.id === tableId);
    if (tableIndex === -1) return;
    
    const updatedTables = [...tables];
    const table = updatedTables[tableIndex];
    
    // Reset dealer
    table.dealer = {
      cards: [],
      value: 0,
      busted: false,
      blackjack: false
    };
    
    // Reset player hands but keep spots
    table.spots.forEach((spot, spotIndex) => {
      if (spot.occupied) {
        spot.hands = [];
        spot.activeHandIndex = 0;
      }
    });
    
    table.gameStarted = false;
    table.roundFinished = false;
    table.countdown = 10;
    
    // Start countdown for next round
    startCountdown(tableId);
    
    setTables(updatedTables);
  };

  // Leave a table spot
  const leaveSpot = (tableId: number, spotIndex: number) => {
    const tableIndex = tables.findIndex(t => t.id === tableId);
    if (tableIndex === -1) return;
    
    const updatedTables = [...tables];
    const spot = updatedTables[tableIndex].spots[spotIndex];
    
    // Can't leave during an active round
    if (updatedTables[tableIndex].gameStarted && !updatedTables[tableIndex].roundFinished) {
      toast.error("Cannot leave during an active round");
      return;
    }
    
    // Reset the spot
    updatedTables[tableIndex].spots[spotIndex] = {
      occupied: false,
      isBot: false,
      name: "",
      hands: [],
      activeHandIndex: 0
    };
    
    // Remove from user spots
    setUserSpots(userSpots.filter(spot => spot !== tableId * 10 + spotIndex));
    
    // Check if table is now empty
    const tableEmpty = updatedTables[tableIndex].spots.every(s => !s.occupied);
    if (tableEmpty) {
      updatedTables[tableIndex].isActive = false;
    }
    
    setTables(updatedTables);
    
    if (activeTable === tableId && userSpots.filter(spot => Math.floor(spot / 10) === tableId).length === 0) {
      setActiveTable(null);
    }
    
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3');
    toast.info(`Left ${updatedTables[tableIndex].name} spot ${spotIndex + 1}`);
  };

  // Render a card
  const renderCard = (card: BlackjackCard) => {
    if (card.hidden) {
      return (
        <div className="w-10 h-14 sm:w-12 sm:h-16 md:w-16 md:h-20 bg-primary/20 border-2 border-white/10 rounded-md flex items-center justify-center">
          <div className="w-8 h-12 sm:w-10 sm:h-14 md:w-14 md:h-18 bg-primary/40 rounded-md"></div>
        </div>
      );
    }
    
    const isRed = card.suit === '♥' || card.suit === '♦';
    
    return (
      <div className="w-10 h-14 sm:w-12 sm:h-16 md:w-16 md:h-20 bg-white rounded-md flex flex-col items-center justify-between p-1">
        <div className={`text-xs sm:text-sm md:text-base font-bold self-start ${isRed ? 'text-red-600' : 'text-black'}`}>
          {card.value}
        </div>
        <div className={`text-lg sm:text-xl md:text-2xl ${isRed ? 'text-red-600' : 'text-black'}`}>
          {card.suit}
        </div>
        <div className={`text-xs sm:text-sm md:text-base font-bold self-end rotate-180 ${isRed ? 'text-red-600' : 'text-black'}`}>
          {card.value}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1EAEDB] to-[#33C3F0] bg-clip-text text-transparent">
            Blackjack Tables
          </h1>
          <p className="text-muted-foreground mt-2">
            Join any table and play up to 3 hands at once!
          </p>
        </div>

        {/* Table selection */}
        {!activeTable && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {tables.map((table) => (
              <div 
                key={table.id} 
                className="bg-black/40 border border-primary/20 p-6 rounded-xl backdrop-blur-sm"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{table.name}</h2>
                  <div className="text-sm text-muted-foreground">
                    <span className="mr-2">Min Bet: {table.minBet}</span>
                    <span>Max Bet: {table.maxBet}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {table.spots.map((spot, spotIndex) => (
                    <div 
                      key={spotIndex}
                      className={`aspect-square rounded-md border flex items-center justify-center
                        ${spot.occupied ? 'bg-primary/20 border-primary/40' : 'bg-black/50 border-white/10 hover:bg-black/70 cursor-pointer'}`}
                      onClick={() => !spot.occupied && joinTable(table.id, spotIndex)}
                    >
                      {spot.occupied ? (
                        <div className="text-center text-xs">
                          <div className="font-semibold truncate w-16">{spot.name}</div>
                          {spot.isBot && <div className="text-muted-foreground">(Bot)</div>}
                        </div>
                      ) : (
                        <div className="text-center text-xs text-muted-foreground">
                          <div>Open</div>
                          <div>Spot</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    {table.isActive ? (
                      <span className="text-green-400">
                        Game starts in {table.countdown}s
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Waiting for players</span>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => joinTable(table.id, table.spots.findIndex(s => !s.occupied))}
                    disabled={table.spots.every(s => s.occupied)}
                  >
                    Join Table
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active table view */}
        {activeTable && (
          <div className="bg-black/40 border border-primary/20 p-4 md:p-6 rounded-xl backdrop-blur-sm mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold mr-4">
                  {tables.find(t => t.id === activeTable)?.name}
                </h2>
                {tables.find(t => t.id === activeTable)?.isActive && !tables.find(t => t.id === activeTable)?.gameStarted && (
                  <span className="text-green-400 text-sm">
                    Game starts in {tables.find(t => t.id === activeTable)?.countdown}s
                  </span>
                )}
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  const userSpotsOnTable = userSpots.filter(spot => Math.floor(spot / 10) === activeTable);
                  userSpotsOnTable.forEach(spot => {
                    leaveSpot(Math.floor(spot / 10), spot % 10);
                  });
                }}
                disabled={tables.find(t => t.id === activeTable)?.gameStarted && !tables.find(t => t.id === activeTable)?.roundFinished}
              >
                Leave Table
              </Button>
            </div>
            
            {/* Dealer area */}
            <div className="mb-8">
              <div className="text-lg font-semibold mb-2">Dealer</div>
              <div className="flex items-center">
                <div className="flex space-x-2 mb-1">
                  {tables.find(t => t.id === activeTable)?.dealer.cards.map((card, index) => (
                    <div key={index} className="transform transition-transform hover:translate-y-[-10px]">
                      {renderCard(card)}
                    </div>
                  ))}
                </div>
                {tables.find(t => t.id === activeTable)?.dealer.cards.length > 0 && (
                  <div className="ml-4">
                    <span className="text-lg font-semibold">
                      {tables.find(t => t.id === activeTable)?.dealer.value}
                    </span>
                    {tables.find(t => t.id === activeTable)?.dealer.blackjack && (
                      <span className="ml-2 text-yellow-500">Blackjack!</span>
                    )}
                    {tables.find(t => t.id === activeTable)?.dealer.busted && (
                      <span className="ml-2 text-red-500">Busted!</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Player spots */}
            <div className="grid grid-cols-5 gap-4">
              {tables.find(t => t.id === activeTable)?.spots.map((spot, spotIndex) => (
                <div 
                  key={spotIndex}
                  className={`rounded-md border p-2
                    ${spot.occupied ? 'bg-primary/10 border-primary/30' : 'bg-black/50 border-white/10'}`}
                >
                  {spot.occupied ? (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-semibold truncate text-sm">{spot.name}</div>
                        {!spot.isBot && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs"
                            onClick={() => leaveSpot(activeTable, spotIndex)}
                            disabled={tables.find(t => t.id === activeTable)?.gameStarted && !tables.find(t => t.id === activeTable)?.roundFinished}
                          >
                            Leave
                          </Button>
                        )}
                        {spot.isBot && userSpots.some(s => Math.floor(s / 10) === activeTable) && (
                          <span className="text-xs text-muted-foreground">(Bot)</span>
                        )}
                      </div>
                      
                      {/* Player hands */}
                      {spot.hands && spot.hands.length > 0 ? (
                        spot.hands.map((hand, handIndex) => (
                          <div 
                            key={handIndex}
                            className={`mb-2 p-1 rounded
                              ${handIndex === spot.activeHandIndex && !tables.find(t => t.id === activeTable)?.roundFinished && !hand.standing && !hand.busted ? 'bg-primary/20' : ''}`}
                          >
                            <div className="flex space-x-1 mb-1">
                              {hand.cards.map((card, cardIndex) => (
                                <div 
                                  key={cardIndex} 
                                  className="transform transition-transform hover:translate-y-[-5px]"
                                  style={{marginLeft: cardIndex > 0 ? '-8px' : '0'}}
                                >
                                  {renderCard(card)}
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center">
                                <Gem className="h-3 w-3 mr-1 text-gem" />
                                <span>{hand.bet}</span>
                              </div>
                              
                              <div>
                                <span className="font-semibold">{hand.finalValue || calculateHandValue(hand.cards)}</span>
                                {hand.blackjack && <span className="ml-1 text-yellow-500">BJ!</span>}
                                {hand.busted && <span className="ml-1 text-red-500">Bust</span>}
                              </div>
                            </div>
                            
                            {/* Action buttons */}
                            {!spot.isBot && 
                              !tables.find(t => t.id === activeTable)?.roundFinished && 
                              handIndex === spot.activeHandIndex && 
                              !hand.standing && 
                              !hand.busted && 
                              !hand.blackjack && (
                                <div className="flex space-x-1 mt-1">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="h-6 text-xs flex-1"
                                    onClick={() => hit(activeTable, spotIndex, handIndex)}
                                  >
                                    Hit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-xs flex-1"
                                    onClick={() => stand(activeTable, spotIndex, handIndex)}
                                  >
                                    Stand
                                  </Button>
                                </div>
                            )}
                          </div>
                        ))
                      ) : (
                        !tables.find(t => t.id === activeTable)?.gameStarted && !spot.isBot && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">Bet Amount:</span>
                              <span className="text-xs">{currentBet}</span>
                            </div>
                            <input
                              type="range"
                              min={tables.find(t => t.id === activeTable)?.minBet}
                              max={tables.find(t => t.id === activeTable)?.maxBet}
                              value={currentBet}
                              onChange={(e) => setCurrentBet(parseInt(e.target.value))}
                              className="w-full h-1 bg-primary/20 rounded-full appearance-none cursor-pointer"
                            />
                            <Button
                              size="sm"
                              variant="default"
                              className="w-full h-7 text-xs"
                              onClick={() => placeBet(activeTable, spotIndex, currentBet)}
                              disabled={user?.balance < currentBet}
                            >
                              Place Bet
                            </Button>
                          </div>
                        )
                      )}
                      
                      {/* Add bot option */}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="text-xs text-muted-foreground mb-2">Empty Spot</div>
                      <div className="grid grid-cols-2 gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => joinTable(activeTable, spotIndex)}
                          disabled={userSpots.filter(spot => Math.floor(spot / 10) === activeTable).length >= 3}
                        >
                          Join
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => addBot(activeTable, spotIndex)}
                        >
                          Add Bot
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table list button (if on a table) */}
        {activeTable && (
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => setActiveTable(null)}
            >
              View All Tables
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blackjack;
