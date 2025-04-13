
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import GameCard from '@/components/GameCard';
import ChatWindow from '@/components/Chat/ChatWindow';
import { ArrowRight, Bomb, CloudRain, CreditCard, Gem, Rocket, MessageSquare } from 'lucide-react';

const Index: React.FC = () => {
  return (
    <div className="container py-8 space-y-12">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          <span className="text-white">DUMP</span>
          <span className="text-primary">.FUN</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-8">
          Profit from market volatility with our innovative gaming platform.
          Open cases, play mines, blackjack and win big!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/cases">
            <Button className="btn-primary">
              Start Playing
            </Button>
          </Link>
          <Link to="/mines">
            <Button variant="outline" className="border-primary/50 bg-black/30 text-white hover:bg-primary/10">
              Try Mines
            </Button>
          </Link>
        </div>
      </div>

      {/* Games Grid */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Our Games</h2>
          <Link to="/cases" className="text-primary flex items-center gap-1 hover:underline">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GameCard
            title="Case Battles"
            description="Open virtual cases to win big prizes and compete with other players."
            imagePath="/placeholder.svg"
            path="/cases"
            buttonText="Open Cases"
            buttonClass="btn-cases"
            icon={<CreditCard className="h-6 w-6" />}
          />
          
          <GameCard
            title="Mines"
            description="Tap on tiles to find gems while avoiding hidden mines. How far will you go?"
            imagePath="/placeholder.svg"
            path="/mines"
            buttonText="Play Mines"
            buttonClass="btn-mines"
            icon={<Bomb className="h-6 w-6" />}
          />
          
          <GameCard
            title="Blackjack"
            description="The classic card game where you aim to beat the dealer without going over 21."
            imagePath="/placeholder.svg"
            path="/blackjack"
            buttonText="Play Blackjack"
            buttonClass="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
            icon={<CreditCard className="h-6 w-6" />}
          />
        </div>
      </div>
      
      {/* Live Activity & Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-black/40 border border-primary/20 backdrop-blur-md p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                Live Activity
              </h2>
              <Link to="/leaderboard" className="text-primary text-sm hover:underline">
                View Leaderboard
              </Link>
            </div>
            
            <div className="space-y-4">
              {[...Array(6)].map((_, index) => {
                const activities = [
                  { type: 'cases', description: 'won a Mythical item', amount: Math.floor(Math.random() * 5000) + 1000 },
                  { type: 'mines', description: 'found 10 gems in mines', amount: Math.floor(Math.random() * 2000) + 500 },
                  { type: 'blackjack', description: 'got a blackjack', amount: Math.floor(Math.random() * 1000) + 300 },
                  { type: 'rain', description: 'claimed from the rain', amount: Math.floor(Math.random() * 500) + 100 },
                ];
                
                const activity = activities[index % 4];
                const username = ['CryptoKing', 'DiamondHands', 'MoonShooter', 'GemCollector', 'SatoshiLover', 'RocketRider'][index];
                
                return (
                  <Card key={index} className="bg-black/60 border-white/10 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`} alt={username} />
                        <AvatarFallback>{username[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-white">{username}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-lg font-bold gem-text">
                      <Gem className="h-4 w-4 text-cyan-400 mr-1" />
                      {activity.amount}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="col-span-1">
          <ChatWindow className="h-full" />
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
        <div className="bg-black/40 border border-primary/20 p-6 rounded-xl flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <CloudRain className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Regular Gem Rain</h3>
          <p className="text-muted-foreground">Free gems every 15 minutes! Just be online and claim your rewards during rain events.</p>
        </div>
        
        <div className="bg-black/40 border border-primary/20 p-6 rounded-xl flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Live Community Chat</h3>
          <p className="text-muted-foreground">Connect with other players, share your wins, and discuss strategies in our live chat.</p>
        </div>
        
        <div className="bg-black/40 border border-primary/20 p-6 rounded-xl flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Rocket className="h-6 w-6 text-primary rotate-180" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Market Volatility</h3>
          <p className="text-muted-foreground">Our games simulate the excitement of market volatility with high-risk, high-reward mechanics.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
