import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useSound } from '@/components/SoundManager';
import { CreditCard, ChevronsDown, ChevronsUp, Gem, Play, RefreshCw, Volume2, VolumeX, Users, Copy, Plus } from 'lucide-react';
import ChatWindow from '@/components/Chat/ChatWindow';

// Card suits: spades (♠), hearts (♥), diamonds (♦), clubs (♣)
const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

interface PlayingCard {
  suit: string;
  value: string;
  numericValue: number;
}

interface Hand {
  cards: PlayingCard[];
  doubled: boolean;
  stand: boolean;
  bet: number;
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  hands: Hand[];
  position: 'left' | 'bottom' | 'right' | 'top';
  isUser: boolean;
}

const Blackjack: React.FC = () => {
  const { user, updateBalance } = useUser();
  const { playSound, isMuted } = useSound();
  const [betAmount, setBetAmount] = useState(100);
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [activeHandIndex, setActiveHandIndex] = useState(0);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealer-turn' | 'complete'>('betting');
  const [result, setResult] = useState<'pending' | 'player-blackjack' | 'player-win' | 'dealer-win' | 'push'>('pending');
  const [showSettings, setShowSettings] = useState(false);
  const [playerCount, setPlayerCount] = useState(1);
  
  // Calculate hand value
  const calculateHandValue = (hand: PlayingCard[]): number => {
    let value = 0;
    let aceCount = 0;
    
    for (const card of hand) {
      if (card.value === 'A') {
        aceCount++;
        value += 11;
      } else {
        value += card.numericValue;
      }
    }
    
    // Adjust for aces
    while (value > 21 && aceCount > 0) {
      value -= 10;
      aceCount--;
    }
    
    return value;
  };
  
  // Set up initial players
  useEffect(() => {
    resetPlayers();
  }, []);
  
  const resetPlayers = () => {
    const positions: ('left' | 'bottom' | 'right' | 'top')[] = ['bottom', 'left', 'right', 'top'];
    const newPlayers: Player[] = [];
    
    // Add user as the first player in bottom position
    newPlayers.push({
      id: user ? user.id : 'user',
      name: user ? user.username : 'You',
      avatar: user ? user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=You' : 'https://api.dicebear.com/7.x/adventurer/svg?seed=You',
      hands: [],
      position: 'bottom',
      isUser: true
    });
    
    // Random AI names
    const aiNames = ['GemHunter', 'CryptoKing', 'CardShark', 'LuckyDraw'];
    
    // Add AI players based on player count (exclude bottom position)
    const aiPositions = positions.filter(p => p !== 'bottom');
    for (let i = 0; i < Math.min(3, playerCount - 1); i++) {
      newPlayers.push({
        id: `ai-${i}`,
        name: aiNames[i],
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${aiNames[i]}`,
        hands: [],
        position: aiPositions[i],
        isUser: false
      });
    }
    
    setPlayers(newPlayers);
  };
  
  // Create a fresh shuffled deck
  const createDeck = (): PlayingCard[] => {
    const newDeck: PlayingCard[] = [];
    
    for (const suit of suits) {
      for (const value of values) {
        let numericValue: number;
        
        if (value === 'A') {
          numericValue = 11;
        } else if (['J', 'Q', 'K'].includes(value)) {
          numericValue = 10;
        } else {
          numericValue = parseInt(value);
        }
        
        newDeck.push({ suit, value, numericValue });
      }
    }
    
    // Shuffle the deck
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    
    return newDeck;
  };
  
  // Draw card from the deck
  const drawCard = (): PlayingCard => {
    const card = deck[0];
    setDeck(prev => prev.slice(1));
    return card;
  };
  
  // Start a new game
  const startGame = () => {
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-interface-click-1126.mp3');
    
    if (!user) {
      toast.error('Please login to play');
      return;
    }
    
    if (betAmount <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }
    
    if (user.balance < betAmount) {
      toast.error('Insufficient balance');
      return;
    }
    
    // Deduct bet amount
    updateBalance(-betAmount);
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-cards-spread-out-on-a-table-1932.mp3');
    
    // Create a fresh deck
    const newDeck = createDeck();
    let currentDeck = [...newDeck];
    
    // Initialize dealer's hand
    const dealerCard1 = currentDeck[0];
    const dealerCard2 = currentDeck[1];
    currentDeck = currentDeck.slice(2);
    setDealerHand([dealerCard1, dealerCard2]);
    
    // Initialize player hands
    let cardIndex = 2;
    const updatedPlayers = players.map(player => {
      const playerCard1 = currentDeck[cardIndex];
      const playerCard2 = currentDeck[cardIndex + 1];
      cardIndex += 2;
      
      return {
        ...player,
        hands: [
          {
            cards: [playerCard1, playerCard2],
            doubled: false,
            stand: false,
            bet: player.isUser ? betAmount : betAmount / 2
          }
        ]
      };
    });
    
    setPlayers(updatedPlayers);
    setActivePlayerIndex(0);
    setActiveHandIndex(0);
    setDeck(currentDeck.slice(cardIndex));
    setGameState('playing');
    setResult('pending');
    
    // Check for blackjack
    const userHand = updatedPlayers[0].hands[0];
    const userHandValue = calculateHandValue(userHand.cards);
    const dealerHandValue = calculateHandValue([dealerCard1, dealerCard2]);
    
    if (userHandValue === 21) {
      if (dealerHandValue === 21) {
        // Both have blackjack, it's a push
        handleGameEnd('push');
      } else {
        // Player has blackjack, pays 3:2
        handleGameEnd('player-blackjack');
      }
    }
  };
  
  // Get current active player and hand
  const getActivePlayer = (): Player | undefined => {
    return players[activePlayerIndex];
  };
  
  const getActiveHand = (): Hand | undefined => {
    const player = getActivePlayer();
    return player ? player.hands[activeHandIndex] : undefined;
  };
  
  // Player hits (draws another card)
  const playerHit = () => {
    if (gameState !== 'playing') return;
    
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-quick-win-video-game-notification-269.mp3');
    
    const player = {...getActivePlayer()!};
    const hand = {...getActiveHand()!};
    const card = drawCard();
    hand.cards = [...hand.cards, card];
    
    // Update player's hand
    const updatedHands = [...player.hands];
    updatedHands[activeHandIndex] = hand;
    
    const updatedPlayers = [...players];
    updatedPlayers[activePlayerIndex] = {
      ...player,
      hands: updatedHands
    };
    
    setPlayers(updatedPlayers);
    
    // Check for bust
    const value = calculateHandValue(hand.cards);
    if (value > 21) {
      playSound('https://assets.mixkit.co/sfx/preview/mixkit-retro-arcade-lose-2027.mp3');
      
      // Mark hand as stand
      hand.stand = true;
      updatedHands[activeHandIndex] = hand;
      updatedPlayers[activePlayerIndex] = {
        ...player,
        hands: updatedHands
      };
      setPlayers(updatedPlayers);
      
      // Move to next hand or player
      moveToNextHandOrPlayer();
    }
  };
  
  // Player doubles down
  const playerDoubleDown = () => {
    if (gameState !== 'playing') return;
    
    const player = getActivePlayer()!;
    const hand = getActiveHand()!;
    
    if (hand.cards.length !== 2) {
      toast.error('You can only double down on your initial two cards');
      return;
    }
    
    if (player.isUser && user!.balance < hand.bet) {
      toast.error('Insufficient balance to double down');
      return;
    }
    
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-coins-handling-1939.mp3');
    
    // Deduct the additional bet if it's the user
    if (player.isUser) {
      updateBalance(-hand.bet);
    }
    
    // Draw one card and stand
    const card = drawCard();
    
    const updatedHand: Hand = {
      cards: [...hand.cards, card],
      doubled: true,
      stand: true,
      bet: hand.bet * 2
    };
    
    const updatedHands = [...player.hands];
    updatedHands[activeHandIndex] = updatedHand;
    
    const updatedPlayers = [...players];
    updatedPlayers[activePlayerIndex] = {
      ...player,
      hands: updatedHands
    };
    
    setPlayers(updatedPlayers);
    
    // Move to next hand or player
    moveToNextHandOrPlayer();
  };
  
  // Player stands
  const playerStand = () => {
    if (gameState !== 'playing') return;
    
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-classic-click-1117.mp3');
    
    // Mark current hand as stand
    const player = getActivePlayer()!;
    const updatedPlayers = [...players];
    const updatedHands = [...player.hands];
    updatedHands[activeHandIndex].stand = true;
    
    updatedPlayers[activePlayerIndex] = {
      ...player,
      hands: updatedHands
    };
    
    setPlayers(updatedPlayers);
    
    // Move to next hand or player
    moveToNextHandOrPlayer();
  };
  
  // Move to next hand or player
  const moveToNextHandOrPlayer = () => {
    // Check if there's another hand for this player
    const player = getActivePlayer()!;
    if (activeHandIndex < player.hands.length - 1) {
      // Move to next hand
      setActiveHandIndex(activeHandIndex + 1);
      return;
    }
    
    // Move to next player
    if (activePlayerIndex < players.length - 1) {
      setActivePlayerIndex(activePlayerIndex + 1);
      setActiveHandIndex(0);
      
      // Handle AI player turn
      setTimeout(() => {
        playAITurn();
      }, 1000);
    } else {
      // All players are done, dealer's turn
      setGameState('dealer-turn');
      playDealerTurn();
    }
  };
  
  // Play AI turn automatically
  const playAITurn = () => {
    const player = getActivePlayer();
    if (!player || player.isUser || gameState !== 'playing') return;
    
    // Simple AI strategy: hit until 17 or higher
    const playAIHand = (handIndex: number) => {
      const hand = player.hands[handIndex];
      let handValue = calculateHandValue(hand.cards);
      
      // Stand if 17 or higher
      if (handValue >= 17) {
        playerStand();
        return;
      }
      
      // Otherwise hit
      playerHit();
      
      // Continue playing this hand if not bust or standing
      const updatedPlayer = getActivePlayer()!;
      const updatedHand = updatedPlayer.hands[activeHandIndex];
      
      // If same hand and not standing, continue playing after delay
      if (updatedPlayer.id === player.id && 
          activeHandIndex === handIndex && 
          !updatedHand.stand) {
        setTimeout(() => playAIHand(handIndex), 800);
      }
    };
    
    // Start playing current hand
    playAIHand(activeHandIndex);
  };
  
  // Handle AI players' turns automatically
  useEffect(() => {
    const player = getActivePlayer();
    if (player && !player.isUser && gameState === 'playing') {
      setTimeout(() => {
        playAITurn();
      }, 1000);
    }
  }, [activePlayerIndex, activeHandIndex, gameState]);
  
  // Play dealer turn
  const playDealerTurn = () => {
    // Check if all player hands are busted
    const allBusted = players.every(player => 
      player.hands.every(hand => calculateHandValue(hand.cards) > 21)
    );
    
    if (allBusted) {
      // Skip dealer's turn if all player hands are busted
      handleGameEnd('dealer-win');
      return;
    }
    
    // Dealer draws cards until they have 17 or more
    let currentDealerHand = [...dealerHand];
    let currentDeck = [...deck];
    let dealerHandValue = calculateHandValue(currentDealerHand);
    
    const dealerPlay = () => {
      if (dealerHandValue < 17) {
        // Dealer draws a card
        playSound('https://assets.mixkit.co/sfx/preview/mixkit-quick-win-video-game-notification-269.mp3');
        
        const card = currentDeck[0];
        currentDealerHand = [...currentDealerHand, card];
        currentDeck = currentDeck.slice(1);
        
        // Update state
        setDealerHand(currentDealerHand);
        setDeck(currentDeck);
        
        dealerHandValue = calculateHandValue(currentDealerHand);
        
        // Continue dealer's turn after a delay
        setTimeout(dealerPlay, 800);
      } else {
        // Dealer is done drawing, determine the winner
        handleGameResults();
      }
    };
    
    // Start dealer's turn
    setTimeout(dealerPlay, 800);
  };
  
  // Handle multiple players' results
  const handleGameResults = () => {
    const finalDealerValue = calculateHandValue(dealerHand);
    const dealerBusted = finalDealerValue > 21;
    
    let userWinnings = 0;
    let userWins = 0;
    let dealerWins = 0;
    let pushes = 0;
    
    // Process player results
    players.forEach(player => {
      player.hands.forEach(hand => {
        const handValue = calculateHandValue(hand.cards);
        
        if (handValue > 21) {
          // Player hand busted
          dealerWins++;
        } else if (dealerBusted) {
          // Dealer busted, player wins
          if (player.isUser) {
            userWins++;
            userWinnings += hand.bet * 2;
          }
        } else if (handValue > finalDealerValue) {
          // Player has higher value
          if (player.isUser) {
            userWins++;
            userWinnings += hand.bet * 2;
          }
        } else if (finalDealerValue > handValue) {
          // Dealer has higher value
          dealerWins++;
        } else {
          // Equal values, push
          pushes++;
          if (player.isUser) {
            userWinnings += hand.bet; // Return original bet
          }
        }
      });
    });
    
    // Update user balance with winnings
    if (userWinnings > 0) {
      updateBalance(userWinnings);
    }
    
    // Determine overall result for display
    let overallResult: 'player-win' | 'dealer-win' | 'push';
    
    if (userWins > 0) {
      overallResult = 'player-win';
      playSound('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
    } else if (dealerWins > 0) {
      overallResult = 'dealer-win';
      playSound('https://assets.mixkit.co/sfx/preview/mixkit-retro-arcade-lose-2027.mp3');
    } else {
      overallResult = 'push';
      playSound('https://assets.mixkit.co/sfx/preview/mixkit-neutral-game-notification-937.mp3');
    }
    
    // Display results
    setGameState('complete');
    setResult(overallResult);
    
    // Show toast with results
    if (overallResult === 'player-win') {
      toast.success(`You win!`, {
        description: `You won ${userWinnings} gems!`
      });
    } else if (overallResult === 'dealer-win') {
      toast('Dealer wins. Better luck next time!');
    } else {
      toast('Push! Your bet is returned.');
    }
  };
  
  // Handle game end and payout
  const handleGameEnd = (gameResult: 'player-blackjack' | 'player-win' | 'dealer-win' | 'push') => {
    setGameState('complete');
    setResult(gameResult);
    
    let payout = 0;
    
    switch (gameResult) {
      case 'player-blackjack':
        // Blackjack usually pays 3:2
        payout = betAmount * 2.5;
        toast.success('Blackjack! You win!', {
          description: `You won ${payout} gems!`
        });
        break;
        
      case 'player-win':
        // Regular win pays 1:1
        payout = betAmount * 2;
        toast.success('You win!', {
          description: `You won ${payout} gems!`
        });
        break;
        
      case 'push':
        // Push returns the original bet
        payout = betAmount;
        toast('Push! Your bet is returned.');
        break;
        
      case 'dealer-win':
        // No payout on loss
        toast('Dealer wins. Better luck next time!');
        break;
    }
    
    if (payout > 0) {
      updateBalance(payout);
    }
  };
  
  // Reset the game
  const resetGame = () => {
    playSound('https://assets.mixkit.co/sfx/preview/mixkit-classic-click-1117.mp3');
    resetPlayers();
    setDealerHand([]);
    setDeck([]);
    setGameState('betting');
    setResult('pending');
    setActivePlayerIndex(0);
    setActiveHandIndex(0);
  };
  
  // Update player count
  const updatePlayerCount = (count: number) => {
    setPlayerCount(Math.max(1, Math.min(4, count)));
    resetPlayers();
  };
  
  // Render a card
  const renderCard = (card: PlayingCard | null, isHidden = false) => {
    if (!card) return null;
    
    const isSuitRed = card.suit === '♥' || card.suit === '♦';
    
    return (
      <div className={`
        relative w-16 h-24 rounded-md flex items-center justify-center
        ${isHidden ? 'bg-primary/20 border-2 border-primary/30' : 'bg-gradient-to-b from-white to-gray-100'} shadow-md
        ${isHidden ? '' : 'animate-flip'}
      `}>
        {!isHidden ? (
          <div className="flex flex-col items-center relative">
            <span className={`text-lg font-bold ${isSuitRed ? 'text-red-500' : 'text-black'}`}>
              {card.value}
            </span>
            <span className={`text-2xl ${isSuitRed ? 'text-red-500' : 'text-black'}`}>
              {card.suit}
            </span>
            <div className="absolute inset-0 pointer-events-none bg-white/5 rounded-md"></div>
          </div>
        ) : (
          <div className="w-10 h-14 bg-gradient-to-b from-primary/30 to-primary/60 rounded flex items-center justify-center">
            <span className="text-2xl text-white opacity-20">?</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center relative">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">DUMP.FUN Blackjack</h1>
          <p className="text-muted-foreground mt-2">Beat the dealer without going over 21</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar - Game controls */}
          <div className="col-span-1 space-y-6">
            {gameState === 'betting' && (
              <div className="bg-black/40 border border-primary/20 p-6 rounded-xl space-y-6 backdrop-blur-sm">
                <div className="space-y-3">
                  <label className="block text-sm font-medium">Bet Amount</label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                      min={10}
                      className="bg-card/70"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => setBetAmount(prev => Math.max(10, prev * 2))}
                    >
                      2x
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[50, 100, 200, 500].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setBetAmount(amount)}
                        className="text-xs"
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium">Players</label>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updatePlayerCount(playerCount - 1)}
                        disabled={playerCount <= 1}
                      >
                        -
                      </Button>
                      <span className="w-4 text-center">{playerCount}</span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updatePlayerCount(playerCount + 1)}
                        disabled={playerCount >= 4}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Your Balance:</span>
                  <span className="flex items-center">
                    <Gem className="h-4 w-4 text-cyan-400 mr-1" />
                    <span className="font-semibold">{user?.balance || 0}</span>
                  </span>
                </div>
                
                <Button 
                  onClick={startGame}
                  disabled={!user || user?.balance < betAmount}
                  className="w-full btn-primary"
                >
                  <Play className="mr-2 h-4 w-4" /> Deal Cards
                </Button>
              </div>
            )}
            
            {gameState !== 'betting' && (
              <div className="bg-black/40 border border-primary/20 p-6 rounded-xl space-y-4 backdrop-blur-sm">
                <div className="bg-muted/50 p-4 rounded-lg text-center backdrop-blur-sm">
                  <div className="text-sm text-white/80 mb-1">Current Bet</div>
                  <div className="flex items-center justify-center gap-1.5">
                    <Gem className="h-5 w-5 text-cyan-400" />
                    <span className="text-2xl font-bold text-white">
                      {getActiveHand()?.bet || betAmount}
                    </span>
                  </div>
                </div>
                
                {gameState === 'playing' && getActivePlayer()?.isUser && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={playerHit}
                        className="bg-primary hover:bg-primary/90"
                        disabled={!getActiveHand() || getActiveHand()?.stand}
                      >
                        <ChevronsUp className="mr-2 h-4 w-4" /> Hit
                      </Button>
                      <Button 
                        onClick={playerStand}
                        variant="secondary"
                        disabled={!getActiveHand() || getActiveHand()?.stand}
                      >
                        <ChevronsDown className="mr-2 h-4 w-4" /> Stand
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        onClick={playerDoubleDown}
                        variant="outline"
                        className="border-amber-500 text-amber-500 hover:bg-amber-500/10"
                        disabled={
                          !getActiveHand() || 
                          getActiveHand()?.stand || 
                          getActiveHand()?.cards.length !== 2 ||
                          user?.balance < (getActiveHand()?.bet || 0)
                        }
                      >
                        Double Down
                      </Button>
                    </div>
                  </div>
                )}
                
                {gameState === 'complete' && (
                  <div>
                    {result === 'player-blackjack' && (
                      <div className="bg-green-500/20 border border-green-500/30 p-3 rounded-lg text-center mb-4 backdrop-blur-sm">
                        <h3 className="font-semibold text-white">Blackjack!</h3>
                        <p className="text-sm text-white/80">You won {(betAmount * 2.5).toFixed(0)} gems</p>
                      </div>
                    )}
                    {result === 'player-win' && (
                      <div className="bg-green-500/20 border border-green-500/30 p-3 rounded-lg text-center mb-4 backdrop-blur-sm">
                        <h3 className="font-semibold text-white">You Win!</h3>
                      </div>
                    )}
                    {result === 'dealer-win' && (
                      <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-lg text-center mb-4 backdrop-blur-sm">
                        <h3 className="font-semibold text-white">Dealer Wins</h3>
                        <p className="text-sm text-white/80">Better luck next time!</p>
                      </div>
                    )}
                    {result === 'push' && (
                      <div className="bg-yellow-500/20 border border-yellow-500/30 p-3 rounded-lg text-center mb-4 backdrop-blur-sm">
                        <h3 className="font-semibold text-white">Push</h3>
                        <p className="text-sm text-white/80">Your bet is returned</p>
                      </div>
                    )}
                    
                    <Button 
                      onClick={resetGame}
                      className="w-full"
                      variant="outline"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Play Again
                    </Button>
                  </div>
                )}
                
                {(gameState === 'playing' && !getActivePlayer()?.isUser) || gameState === 'dealer-turn' ? (
                  <div className="text-center p-3 border border-dashed border-white/20 rounded-lg">
                    <p className="text-sm text-white/80 animate-pulse">
                      {gameState === 'dealer-turn' ? "Dealer's turn..." : "AI player thinking..."}
                    </p>
                  </div>
                ) : null}
              </div>
            )}
            
            <ChatWindow className="lg:hidden" />
          </div>
          
          {/* Game table */}
          <div className="col-span-1 lg:col-span-2">
            <div className="bg-gradient-to-b from-[#0A1F39] to-[#0E2E4A] rounded-xl border border-primary/30 p-6 aspect-square relative shadow-xl">
              {/* Dealer area (top) */}
              <div className="absolute top-6 left-0 right-0 flex flex-col items-center">
                <div className="flex items-center justify-between w-full px-6 mb-4">
                  <h3 className="font-semibold text-white">Dealer</h3>
                  {dealerHand.length > 0 && gameState !== 'betting' && (
                    <div className="px-3 py-1 bg-black/30 rounded-full text-sm backdrop-blur-sm">
                      {gameState === 'playing' ? '?' : calculateHandValue(dealerHand)}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 justify-center">
                  {dealerHand.map((card, index) => (
                    <div key={`dealer-${index}-${card.suit}-${card.value}`} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      {renderCard(card, index === 1 && gameState === 'playing')}
                    </div>
                  ))}
                  {dealerHand.length === 0 && gameState === 'betting' && (
                    <div className="flex items-center justify-center border-2 border-dashed border-white/20 rounded-md w-16 h-24">
                      <CreditCard className="text-white/30" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Player areas */}
              {players.map((player, playerIndex) => {
                // Position players around the table
                let positionClass = '';
                switch (player.position) {
                  case 'bottom':
                    positionClass = 'bottom-6 left-1/2 transform -translate-x-1/2';
                    break;
                  case 'left':
                    positionClass = 'left-6 top-1/2 transform -translate-y-1/2';
                    break;
                  case 'right':
                    positionClass = 'right-6 top-1/2 transform -translate-y-1/2';
                    break;
                  case 'top':
                    positionClass = 'top-24 left-1/2 transform -translate-x-1/2';
                    break;
                }
                
                const isActivePlayer = playerIndex === activePlayerIndex;
                
                return (
                  <div key={player.id} className={`absolute ${positionClass}`}>
                    <div className={`flex flex-col items-center ${player.position === 'left' ? 'items-start' : player.position === 'right' ? 'items-end' : 'items-center'}`}>
                      <div className={`flex gap-2 mb-2 ${player.position === 'left' || player.position === 'right' ? 'flex-col' : 'flex-row'}`}>
                        {player.hands.map((hand, handIndex) => {
                          const isActiveHand = isActivePlayer && handIndex === activeHandIndex;
                          const handValue = calculateHandValue(hand.cards);
                          
                          return (
                            <div 
                              key={`hand-${playerIndex}-${handIndex}`}
                              className={`
                                ${isActiveHand && gameState === 'playing' ? 'ring-2 ring-primary animate-pulse' : ''}
                                ${player.position === 'left' || player.position === 'right' ? 'mb-2' : 'mx-2'}
                                relative
                              `}
                            >
                              <div className={`
                                flex ${player.position === 'left' || player.position === 'right' ? 'flex-col' : 'flex-row'} gap-1
                              `}>
                                {hand.cards.map((card, cardIndex) => (
                                  <div 
                                    key={`player-${playerIndex}-hand-${handIndex}-card-${cardIndex}`}
                                    className="animate-fade-in" 
                                    style={{ animationDelay: `${cardIndex * 100}ms` }}
                                  >
                                    {renderCard(card)}
                                  </div>
                                ))}
                                {hand.cards.length === 0 && gameState === 'betting' && (
                                  <div className="flex items-center justify-center border-2 border-dashed border-white/20 rounded-md w-16 h-24">
                                    <CreditCard className="text-white/30" />
                                  </div>
                                )}
                              </div>
                              
                              {hand.cards.length > 0 && (
                                <div className={`absolute ${player.position === 'left' ? 'right-0 top-0' : player.position === 'right' ? 'left-0 top-0' : 'top-0 right-0'} px-2 py-0.5 rounded-full text-xs backdrop-blur-md ${
                                  handValue > 21 ? 'bg-red-500/50' : 
                                  handValue === 21 ? 'bg-green-500/50' : 
                                  'bg-black/50'
                                }`}>
                                  {handValue}
                                </div>
                              )}
                              
                              {gameState !== 'betting' && (
                                <div className={`
                                  absolute ${player.position === 'left' ? '-left-2 -bottom-2' : player.position === 'right' ? '-right-2 -bottom-2' : '-bottom-2 left-1/2 transform -translate-x-1/2'}
                                  px-2 py-1 rounded-full text-xs bg-primary/20 border border-primary/40 flex items-center gap-1
                                `}>
                                  <Gem className="h-3 w-3 text-cyan-400" />
                                  <span>{hand.bet}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className={`
                        flex items-center gap-2 
                        ${player.position === 'left' ? 'flex-row-reverse' : player.position === 'right' ? 'flex-row' : 'flex-row'}
                      `}>
                        <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/40 overflow-hidden">
                          <img 
                            src={player.avatar} 
                            alt={player.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className={`text-sm font-medium ${player.isUser ? 'text-primary' : 'text-white'}`}>
                          {player.name}
                          {isActivePlayer && gameState === 'playing' && (
                            <span className="ml-1 inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Right sidebar - Chat & stats */}
          <ChatWindow className="hidden lg:flex" />
        </div>
      </div>
    </div>
  );
};

export default Blackjack;
