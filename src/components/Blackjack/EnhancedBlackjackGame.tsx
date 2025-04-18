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
import { enhancedPlaySound } from '../../utils/soundTestUtility';

interface CardType {
  suit: string;
  value: string;
  hidden: boolean;
  id?: string;
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
  const [deckAnimation, setDeckAnimation] = useState(false);
  const [cardsDealt, setCardsDealt] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  
  // Store doubled-down cards by hand index
  const [doubledDownCards, setDoubledDownCards] = useState<{[handIndex: number]: CardType}>({}); 
  
  // Still keep a ref for immediate access during callbacks
  const cardStorageRef = useRef<{[handIndex: number]: CardType}>({});
  const handIndexRef = useRef<number>(0);

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

  // Create a function to generate unique IDs for cards
  const generateCardId = () => {
    return `card_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };

  const createDeck = () => {
    let deck: CardType[] = [];
    for (let suit of suits) {
      for (let value of values) {
        const cardId = generateCardId();
        const card = { suit, value, hidden: false, id: cardId };
        // No need to store regular deck cards in the ref
        deck.push(card);
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

    // Set cardsDealt to false at the start of dealing
    setCardsDealt(false);

    updateBalance(-totalBetAmount);
    setBalance(prev => prev - totalBetAmount);
    
    // Play shuffle sound at start
    enhancedPlaySound('/sounds/card-shuffle.mp3', 0.5);
    
    // Animate the deck
    setDeckAnimation(true);
    setTimeout(() => setDeckAnimation(false), 500);
    
    // Reset the card storage reference
    cardStorageRef.current = {};
    
    // Create a shuffled deck with IDs
    const deck = createDeck();
    
    // Initialize empty hands
    const newDealerHand: CardType[] = [];
    const initialHands: BlackjackHand[] = Array(activeHandCount).fill(null).map(() => ({
      cards: [],
      bet: bet,
      result: 'playing',
      doubledDown: false,
      stand: false
    }));
    
    // Set initial empty state
    setDealerHand(newDealerHand);
    setPlayerHands(initialHands);
    setGameState('playing');
    setTotalWon(0);
    
    // Create copies of hands that we'll update throughout the sequence
    let updatedPlayerHands = [...initialHands];
    let updatedDealerHand = [...newDealerHand];
    
    // Sequential dealing animation with improved timing
    const dealSequentially = async () => {
      // First card to each player - slightly longer delays
      for (let i = 0; i < activeHandCount; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setDeckAnimation(true);
        setTimeout(() => setDeckAnimation(false), 200);
        
        enhancedPlaySound('/sounds/card-deal.mp3', 0.4);
        
        // Update the specific hand with new card
        updatedPlayerHands[i] = {
          ...updatedPlayerHands[i],
          cards: [...updatedPlayerHands[i].cards, { ...deck.pop()!, hidden: false }]
        };
        
        // Update state with all hands
        setPlayerHands([...updatedPlayerHands]);
      }
      
      // First card to dealer
      await new Promise(resolve => setTimeout(resolve, 500));
      setDeckAnimation(true);
      setTimeout(() => setDeckAnimation(false), 200);
      
      enhancedPlaySound('/sounds/card-deal.mp3', 0.4);
      updatedDealerHand = [{ ...deck.pop()!, hidden: false }];
      setDealerHand([...updatedDealerHand]);
      
      // Second card to each player
      for (let i = 0; i < activeHandCount; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setDeckAnimation(true);
        setTimeout(() => setDeckAnimation(false), 200);
        
        enhancedPlaySound('/sounds/card-deal.mp3', 0.4);
        
        // Update the specific hand with new card
        updatedPlayerHands[i] = {
          ...updatedPlayerHands[i],
          cards: [...updatedPlayerHands[i].cards, { ...deck.pop()!, hidden: false }]
        };
        
        // Update state with all hands
        setPlayerHands([...updatedPlayerHands]);
      }
      
      // Second card to dealer (hidden)
      await new Promise(resolve => setTimeout(resolve, 500));
      setDeckAnimation(true);
      setTimeout(() => setDeckAnimation(false), 200);
      
      enhancedPlaySound('/sounds/card-deal.mp3', 0.4);
      updatedDealerHand = [...updatedDealerHand, { ...deck.pop()!, hidden: true }];
      setDealerHand([...updatedDealerHand]);
      
      // Check for blackjacks after all cards are dealt
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Find the first hand without blackjack to set as current
      let nextHandIndex = 0;
      
      for (let i = 0; i < activeHandCount; i++) {
        const currentPlayerHand = updatedPlayerHands[i];
        const dealerValue = calculateHandValue([updatedDealerHand[0], { ...updatedDealerHand[1], hidden: false }]);
        const playerValue = calculateHandValue(currentPlayerHand.cards);
        
        if (playerValue === 21) {
          // Player has blackjack
          if (dealerValue === 21) {
            // Dealer also has blackjack - push
            updatedPlayerHands[i] = { 
              ...currentPlayerHand, 
              result: 'push',
              stand: true // Automatically stand on blackjack
            };
          } else {
            // Player wins with blackjack
            updatedPlayerHands[i] = { 
              ...currentPlayerHand, 
              result: 'blackjack',
              stand: true // Automatically stand on blackjack
            };
            enhancedPlaySound('/sounds/win.mp3', 0.5);
          }
          
          // If this is the first hand, find the next hand without blackjack
          if (i === nextHandIndex) {
            // Find next playable hand
            nextHandIndex = findNextPlayableHandIndex(updatedPlayerHands, i);
          }
        }
      }
      
      setPlayerHands([...updatedPlayerHands]);
      setCurrentHandIndex(nextHandIndex);
      
      // Set cardsDealt to true when the dealing sequence is complete
      setCardsDealt(true);
      
      // Check if all hands have blackjack - if so, go to dealer's turn
      const allHandsFinished = updatedPlayerHands.every(hand => 
        hand.result !== 'playing' || hand.stand
      );
      
      if (allHandsFinished) {
        // All hands are blackjack or finished - move to dealer's turn
        setTimeout(() => {
          setGameState('dealerTurn');
          dealerPlay();
        }, 1000);
      }
    };
    
    // Start the sequential dealing process
    dealSequentially();
  };

  // Helper function to find the next playable hand
  const findNextPlayableHandIndex = (hands: BlackjackHand[], currentIndex: number): number => {
    for (let i = currentIndex + 1; i < hands.length; i++) {
      if (!hands[i].stand && hands[i].result === 'playing') {
        return i;
      }
    }
    return -1; // If no more playable hands, return -1 instead of current index
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
            // Time's up, auto-stand for current hand only
            clearInterval(timerRef.current!);
            if (gameState === 'playing') {
              // Create a copy of the current hands
              const updatedHands = [...playerHands];
              updatedHands[currentHandIndex] = {
                ...updatedHands[currentHandIndex],
                stand: true
              };
              setPlayerHands(updatedHands);
              
              // Move to next hand or dealer's turn
              if (currentHandIndex < playerHands.length - 1) {
                setCurrentHandIndex(currentHandIndex + 1);
              } else {
                const allHandsFinished = updatedHands.every(hand => 
                  hand.result !== 'playing' || hand.stand
                );
                
                if (allHandsFinished) {
                  setGameState('dealerTurn');
                  setTimeout(dealerPlay, 500);
                }
              }
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
    if (gameState !== 'playing' || currentHandIndex >= playerHands.length || !cardsDealt || actionInProgress) return;
    
    setActionInProgress(true);
    console.log("Hit button clicked");
    
    const currentHand = playerHands[currentHandIndex];
    
    // Skip if hand is already standing or has blackjack
    if (currentHand.stand || currentHand.result === 'blackjack' || calculateHandValue(currentHand.cards) === 21) {
      console.log("Skipping hit for hand that's already standing, has blackjack, or is at 21");
      
      // Find next playable hand
      const nextHandIndex = findNextPlayableHandIndex(playerHands, currentHandIndex);
      setActionInProgress(false);
      
      if (nextHandIndex > -1) {
        setCurrentHandIndex(nextHandIndex);
      } else {
        // If no more playable hands, go to dealer turn
        setGameState('dealerTurn');
        setTimeout(() => dealerPlay(), 300);
      }
      return;
    }
    
    resetTimer();
    
    const deck = createDeck();
    const newCard = deck.pop()!;
    
    // Animate deck and play card hit sound
    setDeckAnimation(true);
    setTimeout(() => setDeckAnimation(false), 200);
    enhancedPlaySound('/sounds/card-hit.mp3', 0.4);
    
    // Create a copy of player hands for updating
    const updatedHands = [...playerHands];
    const updatedHand = {...updatedHands[currentHandIndex]};
    
    // Add the new card
    updatedHand.cards = [...updatedHand.cards, newCard];
    updatedHands[currentHandIndex] = updatedHand;
    
    // Calculate the new hand value
    const handValue = calculateHandValue(updatedHand.cards);
    
    // Handle bust (over 21)
    if (handValue > 21) {
      console.log("Player busted with", handValue);
      updatedHand.result = 'lose';
      updatedHand.stand = true;
      updatedHands[currentHandIndex] = updatedHand;
      
      // Play lose sound
      enhancedPlaySound('/sounds/lose.mp3', 0.3);
      
      // Update the state with the busted hand
      setPlayerHands(updatedHands);
      
      // Find next playable hand
      const nextHandIndex = findNextPlayableHandIndex(updatedHands, currentHandIndex);
      
      if (nextHandIndex > -1) {
        setActionInProgress(false);
        setCurrentHandIndex(nextHandIndex);
      } else {
        // If no more playable hands, go to dealer turn
        setActionInProgress(false);
        setGameState('dealerTurn');
        setTimeout(() => dealerPlay(), 300);
      }
    } 
    // Handle 21 (auto-stand)
    else if (handValue === 21) {
      console.log("Player reached 21, auto-standing");
      updatedHand.stand = true;
      updatedHands[currentHandIndex] = updatedHand;
      
      // Update the state with the hand at 21
      setPlayerHands(updatedHands);
      
      // Find next playable hand
      const nextHandIndex = findNextPlayableHandIndex(updatedHands, currentHandIndex);
      
      if (nextHandIndex > -1) {
        setActionInProgress(false);
        setCurrentHandIndex(nextHandIndex);
      } else {
        // If no more playable hands, go to dealer turn
        setActionInProgress(false);
        setGameState('dealerTurn');
        setTimeout(() => dealerPlay(), 300);
      }
    } 
    // Hand is still in play
    else {
      console.log("Player hit and now has", handValue);
      // Update the state with the current hand
      setPlayerHands(updatedHands);
      setActionInProgress(false);
    }
  };

  const stand = () => {
    if (gameState !== 'playing' || !cardsDealt || actionInProgress) return;
    
    setActionInProgress(true);
    console.log("Stand button clicked");
    
    // Clear the timer when standing
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setTimerCount(null);
    }
    
    // Play a button click sound when standing
    enhancedPlaySound('/sounds/button-click.mp3', 0.2);
    
    const updatedHands = [...playerHands];
    updatedHands[currentHandIndex] = {
      ...updatedHands[currentHandIndex],
      stand: true
    };
    
    console.log("Setting player hand to stand=true", updatedHands[currentHandIndex]);
    
    // First update the state
    setPlayerHands(updatedHands);
    
    // Check if this is the last hand or if all hands are finished
    const isLastHand = currentHandIndex === playerHands.length - 1;
    const allHandsFinished = updatedHands.every(hand => 
      hand.result !== 'playing' || hand.stand
    );
    
    console.log("Is last hand:", isLastHand, "All hands finished:", allHandsFinished);
    
    // If this is the last hand or all hands are finished, go directly to dealer turn
    if (isLastHand || allHandsFinished) {
      console.log("Moving to dealer turn directly");
      setActionInProgress(false);
      setGameState('dealerTurn');
      setTimeout(() => dealerPlay(), 300);
    } else {
      // Otherwise move to next hand
      console.log("Moving to next hand");
      setActionInProgress(false);
      
      // Find the next playable hand
      const nextHandIndex = findNextPlayableHandIndex(updatedHands, currentHandIndex);
      if (nextHandIndex > -1) {
        setCurrentHandIndex(nextHandIndex);
      } else {
        // If no more playable hands, go to dealer turn
        setGameState('dealerTurn');
        setTimeout(() => dealerPlay(), 300);
      }
    }
  };

  // Modified calculateResults to better handle doubled-down cards
  const calculateResults = (finalDealerHand = dealerHand) => {
    console.log("Calculating results for all hands");
    console.log("Player hands count:", playerHands.length);
    console.log("Doubled down cards:", doubledDownCards);
    
    // Get the dealer value once
    const dealerValue = calculateHandValue(finalDealerHand);
    const dealerBusted = dealerValue > 21;
    
    console.log("Dealer final value:", dealerValue, "Dealer busted:", dealerBusted);
    
    // Fix all doubled-down hands first to ensure they have all their cards
    const fixedHands = playerHands.map((hand, idx) => {
      if (hand.doubledDown && hand.cards.length < 3) {
        // Try to get the doubled card for this hand
        const doubledCard = doubledDownCards[idx] || cardStorageRef.current[idx];
        
        if (doubledCard) {
          console.log(`Fixed hand ${idx+1} by adding doubled card:`, doubledCard);
          return {
            ...hand,
            cards: [...hand.cards, doubledCard]
          };
        }
      }
      return hand;
    });
    
    // Update hands with fixed versions before calculating results
    setPlayerHands(fixedHands);
    
    // Give a little time for the state update to process
    setTimeout(() => {
      let totalWinnings = 0;
      let anyWin = false;
      let anyLoss = false;
      
      // Calculate results for each hand
      const resultHands = fixedHands.map((hand, idx) => {
        // Make a fresh copy of the cards
        const cardsCopy = hand.cards.map(card => ({ ...card }));
        
        // Ensure doubled-down hands have all their cards
        if (hand.doubledDown && cardsCopy.length < 3) {
          const doubledCard = doubledDownCards[idx] || cardStorageRef.current[idx];
          if (doubledCard) {
            cardsCopy.push({ ...doubledCard });
          }
        }
        
        // If hand already has a result, keep it
        if (hand.result === 'blackjack') {
          const winAmount = hand.bet * 2.5;
          totalWinnings += winAmount;
          anyWin = true;
          return { ...hand, cards: cardsCopy, result: 'blackjack' as const };
        }
        
        if (hand.result === 'lose') {
          anyLoss = true;
          return { ...hand, cards: cardsCopy, result: 'lose' as const };
        }
        
        if (hand.result === 'push') {
          totalWinnings += hand.bet;
          return { ...hand, cards: cardsCopy, result: 'push' as const };
        }
        
        // Calculate the hand value
        const handValue = calculateHandValue(cardsCopy);
        
        // Determine the result
        let result: BlackjackHand['result'] = 'playing';
        
        if (handValue > 21) {
          // Player busted
          result = 'lose';
          anyLoss = true;
        } else if (dealerBusted) {
          // Dealer busted, player didn't
          result = 'win';
          totalWinnings += hand.bet * 2;
          anyWin = true;
        } else if (handValue > dealerValue) {
          // Player has higher value
          result = 'win';
          totalWinnings += hand.bet * 2;
          anyWin = true;
        } else if (handValue < dealerValue) {
          // Dealer has higher value
          result = 'lose';
          anyLoss = true;
        } else {
          // Push
          result = 'push';
          totalWinnings += hand.bet;
        }
        
        return {
          ...hand, 
          result, 
          cards: cardsCopy
        };
      });
      
      // Play appropriate sounds based on overall game outcome
      if (anyWin && !anyLoss) {
        // All hands won
        enhancedPlaySound('/sounds/win.mp3', 0.5);
      } else if (anyWin && anyLoss) {
        // Mixed results
        setTimeout(() => enhancedPlaySound('/sounds/win.mp3', 0.3), 300);
      } else if (anyLoss && !anyWin) {
        // All hands lost
        enhancedPlaySound('/sounds/lose.mp3', 0.4);
      }
      
      // Update the state
      setGameState('gameOver');
      setPlayerHands(resultHands);
      
      // Update player balance
      if (totalWinnings > 0) {
        updateBalance(totalWinnings);
        setBalance(prev => prev + totalWinnings);
        setTotalWon(totalWinnings);
        
        // Show win animation if significant win
        const totalBet = fixedHands.reduce((sum, hand) => sum + hand.bet, 0);
        if (totalWinnings >= totalBet * 1.5) {
          setShowAnimation(true);
          setTimeout(() => setShowAnimation(false), 3000);
        }
      }
    }, 300);
  };

  // Function to store a doubled-down card specifically for a hand
  const storeDoubledDownCard = (card: CardType, handIndex: number) => {
    if (!card.id) return;
    
    console.log(`Storing doubled-down card for hand ${handIndex}:`, card);
    
    // Store in both ref and state, indexed by hand index
    cardStorageRef.current[handIndex] = { ...card };
    setDoubledDownCards(prev => ({
      ...prev,
      [handIndex]: { ...card }
    }));
  };

  // Helper function to preserve doubled down cards
  const preserveDoubledDownCards = () => {
    console.log("Preserving doubled down cards");
    
    setPlayerHands(prevHands => {
      return prevHands.map((hand, idx) => {
        if (hand.doubledDown) {
          // For doubled down hands, check if we have all cards
          if (hand.cards.length < 3) {
            // Try to get the doubled card from our storage
            const doubledCard = doubledDownCards[idx] || cardStorageRef.current[idx];
            
            if (doubledCard) {
              console.log(`Adding doubled card back to hand ${idx+1}:`, doubledCard);
              return {
                ...hand,
                cards: [...hand.cards, doubledCard]
              };
            }
          }
        }
        
        return hand;
      });
    });
  };

  // Dealer play function
  const dealerPlay = () => {
    console.log("Dealer play function called", { gameState, playerHandsCount: playerHands.length });
    
    if (gameState !== 'dealerTurn') {
      console.log("Warning: dealerPlay called when not in dealer turn state");
      setGameState('dealerTurn');
    }
    
    // Ensure doubled-down cards are preserved before dealer plays
    preserveDoubledDownCards();
    
    // First make visible any hidden dealer cards
    const revealedDealerHand = dealerHand.map(card => ({
      ...card,
      hidden: false
    }));
    
    // Play card flip sound when revealing
    if (dealerHand.some(card => card.hidden)) {
      enhancedPlaySound('/sounds/card-deal.mp3', 0.4);
      console.log("Revealed dealer's hidden card");
    }
    
    // Update the dealer's hand to show all cards
    setDealerHand(revealedDealerHand);
    
    // Handle dealer drawing cards
    const dealerDrawCards = () => {
      let currentHand = [...revealedDealerHand];
      let currentDeck = createDeck();
      
      const drawNextCard = () => {
        // Preserve doubled-down cards on each dealer action
        preserveDoubledDownCards();
        
        const value = calculateHandValue(currentHand);
        console.log("Dealer current value:", value);
        
        if (value < 17) {
          // Dealer must hit
          console.log("Dealer must hit");
          
          // Animate deck and play sound
          setDeckAnimation(true);
          setTimeout(() => setDeckAnimation(false), 200);
          enhancedPlaySound('/sounds/card-hit.mp3', 0.4);
          
          // Draw a card and add it to dealer's hand
          const newCard = { ...currentDeck.pop()!, hidden: false };
          currentHand = [...currentHand, newCard];
          
          // Update dealer's hand
          setDealerHand(currentHand);
          
          // Preserve cards again after dealer draws
          preserveDoubledDownCards();
          
          // Continue drawing after a delay
          setTimeout(drawNextCard, 700);
        } else {
          // Dealer stands, game is over
          console.log("Dealer stands with", value);
          
          // Final preservation before showing results
          setTimeout(() => {
            preserveDoubledDownCards();
            
            setTimeout(() => {
              calculateResults(currentHand);
            }, 300);
          }, 300);
        }
      };
      
      // Start drawing cards after a delay
      setTimeout(drawNextCard, 600);
    };
    
    // Start dealer's process
    setTimeout(() => {
      dealerDrawCards();
    }, 300);
  };

  // Add effect to monitor and fix any issues with doubled down cards
  useEffect(() => {
    // Force fixes only during dealer turn and game over
    if (gameState === 'dealerTurn' || gameState === 'gameOver') {
      // Check for doubled down hands with missing 3rd card
      const doubledDownHands = playerHands.filter(hand => hand.doubledDown);
      
      if (doubledDownHands.length > 0) {
        let needsFix = false;
        
        doubledDownHands.forEach(hand => {
          if (hand.cards.length < 3) {
            console.warn("Found doubled down hand with missing 3rd card!");
            needsFix = true;
          }
        });
        
        if (needsFix) {
          console.log("Fixing doubled down hands with missing cards");
          preserveDoubledDownCards();
        }
      }
    }
  }, [gameState, playerHands]);

  // Add an additional effect specifically for the game over state
  useEffect(() => {
    if (gameState === 'gameOver') {
      // Set up periodic card preservation during game over state
      const preservationInterval = setInterval(() => {
        // Check if we have any doubled down hands that need fixing
        const doubledDownHands = playerHands.filter(hand => hand.doubledDown);
        
        if (doubledDownHands.some(hand => hand.cards.length < 3)) {
          console.log("Game over state: fixing cards for doubled down hands");
          preserveDoubledDownCards();
        }
      }, 500); // Check every 500ms
      
      // Clean up interval
      return () => clearInterval(preservationInterval);
    }
  }, [gameState]);

  // Function to get the final hand cards for display
  const getFinalHandCards = (hand: BlackjackHand, handIndex: number) => {
    // Special handling for doubled down hands
    if (hand.doubledDown && hand.cards.length < 3) {
      const cardsCopy = [...hand.cards];
      
      // Try to get the doubled card from our storage
      const doubledCard = doubledDownCards[handIndex] || cardStorageRef.current[handIndex];
      
      if (doubledCard) {
        console.log(`Adding doubled card to display for hand ${handIndex+1}:`, doubledCard);
        cardsCopy.push({ ...doubledCard });
      }
      
      return cardsCopy;
    }
    
    return hand.cards;
  };

  // Add special effect to monitor and fix doubled-down cards during game over
  useEffect(() => {
    if (gameState === 'gameOver') {
      const fixInterval = setInterval(() => {
        let needsFix = false;
        
        // Check each hand
        playerHands.forEach((hand, idx) => {
          if (hand.doubledDown && hand.cards.length < 3) {
            needsFix = true;
          }
        });
        
        if (needsFix) {
          console.log("Game over state: fixing doubled-down cards");
          preserveDoubledDownCards();
        }
      }, 300);
      
      return () => clearInterval(fixInterval);
    }
  }, [gameState, playerHands]);

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
    if (gameState !== 'playing' || !canSplitHand(playerHands[currentHandIndex]) || !cardsDealt || actionInProgress) return;
    
    setActionInProgress(true);
    
    resetTimer();
    
    // Check if player has enough funds to split
    const currentBet = playerHands[currentHandIndex].bet;
    if (balance < currentBet) {
      toast("Insufficient funds", {
        description: "You need more gems to split this hand",
        style: { backgroundColor: 'rgb(239, 68, 68)', color: 'white' }
      });
      setActionInProgress(false);
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
    
    // Check for blackjacks on the new hands
    if (calculateHandValue(firstHand.cards) === 21) {
      updatedHands[currentHandIndex].result = 'blackjack';
      updatedHands[currentHandIndex].stand = true;
    }
    
    if (calculateHandValue(secondHand.cards) === 21) {
      updatedHands[currentHandIndex + 1].result = 'blackjack';
      updatedHands[currentHandIndex + 1].stand = true;
    }
    
    setPlayerHands(updatedHands);
    
    toast("Hand Split", {
      description: "You've split your hand into two separate hands",
      style: { backgroundColor: 'rgb(59, 130, 246)', color: 'white' }
    });
    
    // Check if the current hand has blackjack and needs to move to the next hand
    if (updatedHands[currentHandIndex].result === 'blackjack' || updatedHands[currentHandIndex].stand) {
      // Find next playable hand, which should be the second hand we just created
      const nextHandIndex = findNextPlayableHandIndex(updatedHands, currentHandIndex);
      
      if (nextHandIndex > -1) {
        setTimeout(() => {
          setActionInProgress(false);
          setCurrentHandIndex(nextHandIndex);
        }, 500);
      } else {
        // If no playable hands, go to dealer turn (unlikely after a split)
        setTimeout(() => {
          setActionInProgress(false);
          setGameState('dealerTurn');
          dealerPlay();
        }, 500);
      }
    } else {
      // Current hand is still playable
      setActionInProgress(false);
    }
  };

  // Add a function to determine the bet increment based on minBet
  const getBetIncrement = () => {
    if (minBet >= 500) return 500; // VIP Table
    if (minBet >= 100) return 100; // High Roller
    if (minBet >= 50) return 50;   // Standard Table
    return 10;                     // Beginner Table
  };

  // Add this function near other utility functions
  const countCards = (hands) => {
    let total = 0;
    hands.forEach(hand => {
      total += hand.cards.length;
    });
    return total;
  };

  // Add this useEffect after other useEffects
  useEffect(() => {
    if (playerHands.length > 0) {
      // Count all player cards
      const totalCards = countCards(playerHands);
      
      // Check for doubled down hands
      const doubledDownHands = playerHands.filter(hand => hand.doubledDown);
      if (doubledDownHands.length > 0) {
        console.log(`Game state: ${gameState}, Total player cards: ${totalCards}`);
        doubledDownHands.forEach((hand, idx) => {
          console.log(`Doubled hand ${idx}: Cards: ${hand.cards.length}, Card[2]: ${
            hand.cards[2] ? `${hand.cards[2].value}${hand.cards[2].suit}` : 'missing!'
          }`);
        });
      }
    }
  }, [playerHands, gameState]);

  // Add the missing doubleDown function
  const doubleDown = () => {
    if (gameState !== 'playing' || playerHands[currentHandIndex].cards.length !== 2 || !cardsDealt || actionInProgress) return;
    
    setActionInProgress(true);
    console.log("Double down clicked on hand", currentHandIndex+1, "of", playerHands.length);
    
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
      setActionInProgress(false);
      return;
    }
    
    updateBalance(-doubleAmount);
    setBalance(prev => prev - doubleAmount);
    
    // Play button sound
    enhancedPlaySound('/sounds/button-click.mp3', 0.2);
    
    // Animate deck and play card sound immediately
    setDeckAnimation(true);
    setTimeout(() => setDeckAnimation(false), 200);
    enhancedPlaySound('/sounds/card-hit.mp3', 0.4);
    
    // Create the new card with a unique ID
    const newCardId = generateCardId();
    const randomValue = values[Math.floor(Math.random() * values.length)];
    const randomSuit = suits[Math.floor(Math.random() * suits.length)];
    
    const newCard: CardType = {
      suit: randomSuit,
      value: randomValue,
      hidden: false,
      id: newCardId
    };
    
    // Store the card for this specific hand
    storeDoubledDownCard(newCard, currentHandIndex);
    
    // Remember which hand we're doubling down on
    handIndexRef.current = currentHandIndex;
    
    console.log("Drew card for double down on hand", currentHandIndex+1, ":", newCard);
    
    // Create deep copies of all hands
    const updatedHands = playerHands.map(hand => ({
      ...hand,
      cards: hand.cards.map(card => ({ ...card }))
    }));
    
    // Update the current hand with the new card and doubled bet
    updatedHands[currentHandIndex] = {
      ...updatedHands[currentHandIndex],
      cards: [...updatedHands[currentHandIndex].cards, { ...newCard }],
      bet: updatedHands[currentHandIndex].bet * 2,
      doubledDown: true,
      stand: true
    };

    // Debug log the updated hand
    console.log(`Updated hand ${currentHandIndex+1} after double down:`, 
      `Cards: ${updatedHands[currentHandIndex].cards.length},`,
      `Values: ${updatedHands[currentHandIndex].cards.map(c => `${c.value}${c.suit}`).join(', ')},`,
      `IDs: ${updatedHands[currentHandIndex].cards.map(c => c.id || 'no-id').join(', ')}`);
    
    // Check for bust
    const handValue = calculateHandValue(updatedHands[currentHandIndex].cards);
    console.log("Hand value after double down:", handValue);
    
    if (handValue > 21) {
      updatedHands[currentHandIndex].result = 'lose';
      // Play lose sound
      enhancedPlaySound('/sounds/lose.mp3', 0.3);
    }
    
    // Update the player hands state
    setPlayerHands(updatedHands);
    
    // Move to next hand or dealer's turn
    const nextHandIndex = findNextPlayableHandIndex(updatedHands, currentHandIndex);
    
    setTimeout(() => {
      if (nextHandIndex > -1) {
        // Move to next hand after a delay
        setTimeout(() => {
          setActionInProgress(false);
          setCurrentHandIndex(nextHandIndex);
        }, 700);
      } else {
        // If no more playable hands, go to dealer turn
        setTimeout(() => {
          // First reveal dealer card
          revealDealerHiddenCard();
          
          setTimeout(() => {
            setActionInProgress(false);
            setGameState('dealerTurn');
            
            // Add a delay before dealer play
            setTimeout(() => {
              dealerPlay();
            }, 300);
          }, 300);
        }, 700);
      }
    }, 300);
  };

  // Also add the missing revealDealerHiddenCard function
  const revealDealerHiddenCard = () => {
    console.log("Revealing dealer hidden card");
    
    // Play card flip sound
    enhancedPlaySound('/sounds/card-deal.mp3', 0.4);
    
    // Update dealer hand with all cards revealed
    setDealerHand(prev => prev.map(card => ({
      ...card,
      hidden: false
    })));
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
                  </Card>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Deck display - moved from absolute positioning to being part of the container */}
          <motion.div
            animate={{
              scale: deckAnimation ? 0.95 : 1,
              rotate: deckAnimation ? 5 : 0,
            }}
            transition={{ duration: 0.2 }}
            className="relative ml-16"
          >
            <div className="w-20 h-32 bg-gradient-to-br from-blue-800 to-blue-600 rounded-lg border-2 border-blue-500 shadow-lg transform rotate-6 absolute -top-1 -left-1"></div>
            <div className="w-20 h-32 bg-gradient-to-br from-blue-800 to-blue-600 rounded-lg border-2 border-blue-500 shadow-lg transform rotate-3 absolute -top-0.5 -left-0.5"></div>
            <Card className="w-20 h-32 flex items-center justify-center bg-gradient-to-br from-blue-800 to-blue-600 text-white border-2 border-blue-500 shadow-lg relative">
              <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0wIDIwQzAgOC45NTQzMSA4Ljk1NDMxIDAgMjAgMEMzMS4wNDU3IDAgNDAgOC45NTQzMSA0MCAyMEM0MCAzMS4wNDU3IDMxLjA0NTcgNDAgMjAgNDBDOC45NTQzMSA0MCAwIDMxLjA0NTcgMCAyMFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmYiIG9wYWNpdHk9IjAuMiIvPgogICAgPHBhdGggZD0iTTIwIDVMMjAgMjBMMzUgMjAiIHN0cm9rZT0iI2ZmZmYiIG9wYWNpdHk9IjAuMyIgc3Ryb2tlLXdpZHRoPSIyLjUiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4=')] bg-center opacity-30"></div>
            </Card>
          </motion.div>
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
                    {/* Use getFinalHandCards to properly render doubled-down hands */}
                    {getFinalHandCards(hand, handIndex).map((card, cardIndex) => {
                      // This is a doubled down card if it's the 3rd card (index 2) in a doubled hand
                      const isDoubledDownCard = hand.doubledDown && cardIndex === 2;
                      
                      return (
                        <ItemGlowEffect 
                          key={`card-${handIndex}-${cardIndex}-${card.id || 'noId'}`}
                          isActive={(gameState === 'gameOver' && hand.result === 'win') || isDoubledDownCard}
                          color={isDoubledDownCard ? "rgba(0, 255, 128, 0.6)" : "rgba(0, 255, 0, 0.5)"}
                        >
                          <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ 
                              y: 0, 
                              opacity: 1,
                              scale: isDoubledDownCard ? [1, 1.05, 1] : 1,
                              transition: {
                                scale: { repeat: gameState === 'gameOver' ? 0 : 3, duration: 0.8 }
                              }
                            }}
                            transition={{ duration: 0.5, delay: cardIndex * 0.1 + 0.2 }}
                            className={`relative ${isDoubledDownCard ? 'ring-2 ring-green-500 shadow-lg shadow-green-800/40' : ''}`}
                            data-doubled={hand.doubledDown}
                            data-cardindex={cardIndex}
                            data-handindex={handIndex}
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
                            {isDoubledDownCard && (
                              <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md border-2 border-white z-10">
                                2x
                              </div>
                            )}
                          </motion.div>
                        </ItemGlowEffect>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mt-2 flex justify-between items-center">
                  <div className={`font-bold ${
                    calculateHandValue(getFinalHandCards(hand, handIndex)) > 21 
                      ? 'text-red-400' 
                      : calculateHandValue(getFinalHandCards(hand, handIndex)) === 21 
                        ? 'text-green-400' 
                        : 'text-white'
                  }`}>
                    Value: {calculateHandValue(getFinalHandCards(hand, handIndex))}
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
            <PulseAnimation isActive={cardsDealt} intensity="low" className="col-span-1">
              <Button 
                onClick={hit}
                disabled={!cardsDealt || playerHands[currentHandIndex].stand || actionInProgress}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-3 rounded-lg border border-blue-400/30"
              >
                {actionInProgress ? 'Processing...' : 'Hit'}
              </Button>
            </PulseAnimation>
            
            <Button 
              onClick={stand}
              disabled={!cardsDealt || playerHands[currentHandIndex].stand || actionInProgress}
              className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold py-3 rounded-lg border border-red-400/30 col-span-1"
            >
              {actionInProgress ? 'Processing...' : 'Stand'}
            </Button>
            
            <Button 
              onClick={doubleDown}
              disabled={!cardsDealt || playerHands[currentHandIndex].cards.length > 2 || balance < playerHands[currentHandIndex].bet || playerHands[currentHandIndex].stand || actionInProgress}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold py-3 rounded-lg border border-purple-400/30 col-span-1 relative overflow-hidden"
            >
              <span className="relative z-10">{actionInProgress ? 'Processing...' : 'Double'}</span>
              {cardsDealt && playerHands[currentHandIndex].cards.length === 2 && balance >= playerHands[currentHandIndex].bet && !playerHands[currentHandIndex].stand && !actionInProgress && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="absolute h-10 w-10 bg-purple-400/20 rounded-full animate-ping"></span>
                </span>
              )}
            </Button>
            
            <Button 
              onClick={splitHand}
              disabled={!cardsDealt || !canSplitHand(playerHands[currentHandIndex]) || balance < playerHands[currentHandIndex].bet || actionInProgress}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-bold py-3 rounded-lg border border-amber-400/30 col-span-1 relative overflow-hidden"
            >
              <Scissors className="mr-1 h-4 w-4" />
              <span className="relative z-10">{actionInProgress ? 'Processing...' : 'Split'}</span>
              {cardsDealt && canSplitHand(playerHands[currentHandIndex]) && balance >= playerHands[currentHandIndex].bet && !actionInProgress && (
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
