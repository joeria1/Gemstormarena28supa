
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import GameCard from '@/components/GameCard';
import ChatWindow from '@/components/Chat/ChatWindow';
import { 
  ArrowRight, Bomb, CloudRain, CreditCard, Gem, 
  Rocket, MessageSquare, Award, Gift, Layers, 
  TrendingUp, Users, Zap, DollarSign, Clock
} from 'lucide-react';

const Index: React.FC = () => {
  return (
    <div className="container py-8 space-y-12">
      {/* Hero Section */}
      <div className="relative flex flex-col items-center text-center overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-blue-950 to-violet-950 border border-primary/20">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="text-white">DUMP</span>
            <span className="text-primary">.FUN</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-8">
            Profit from market volatility with our innovative gaming platform.
            Open cases, play mines, blackjack and win big!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
      </div>

      {/* Games Grid */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Our Games</h2>
          <Link to="/cases" className="text-primary flex items-center gap-1 hover:underline">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <GameCard
            title="Case Battles"
            description="Open virtual cases to win big prizes and compete with other players."
            imagePath="/placeholder.svg"
            path="/cases"
            buttonText="Open Cases"
            buttonClass="btn-cases"
            icon={<Layers className="h-6 w-6" />}
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
          
          <GameCard
            title="Tower"
            description="Climb the tower by choosing the right path and avoid traps to win big rewards."
            imagePath="/placeholder.svg"
            path="/tower"
            buttonText="Play Tower"
            buttonClass="bg-gradient-to-r from-green-500 to-teal-500 text-white"
            icon={<TrendingUp className="h-6 w-6" />}
          />
          
          <GameCard
            title="Crash"
            description="Watch the multiplier increase and cash out before it crashes to secure your profit."
            imagePath="/placeholder.svg"
            path="/crash"
            buttonText="Play Crash"
            buttonClass="bg-gradient-to-r from-red-500 to-rose-500 text-white"
            icon={<Zap className="h-6 w-6" />}
          />
          
          <GameCard
            title="RakeBack"
            description="Earn a percentage of your bets back as rakeback rewards."
            imagePath="/placeholder.svg"
            path="/rakeback"
            buttonText="Claim RakeBack"
            buttonClass="bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
            icon={<DollarSign className="h-6 w-6" />}
          />
          
          <GameCard
            title="Rewards"
            description="Claim daily rewards, promotional bonuses, and special event prizes."
            imagePath="/placeholder.svg"
            path="/rewards"
            buttonText="Get Rewards"
            buttonClass="bg-gradient-to-r from-yellow-500 to-amber-500 text-white"
            icon={<Gift className="h-6 w-6" />}
          />
          
          <Card className="relative overflow-hidden bg-gradient-to-b from-blue-900/40 to-violet-900/40 border border-white/10 flex flex-col items-center justify-center p-6 min-h-[240px]">
            <div className="text-center">
              <Badge className="mb-4 bg-primary/20 text-primary">Coming Soon</Badge>
              <h3 className="text-xl font-bold mb-2">More Games</h3>
              <p className="text-sm text-muted-foreground">New exciting games coming soon to DUMP.FUN</p>
            </div>
          </Card>
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
                  { type: 'cases', description: 'won a Mythical item', amount: Math.floor(Math.random() * 5000) + 1000, icon: <Layers className="h-4 w-4 text-primary" /> },
                  { type: 'mines', description: 'found 10 gems in mines', amount: Math.floor(Math.random() * 2000) + 500, icon: <Bomb className="h-4 w-4 text-red-400" /> },
                  { type: 'blackjack', description: 'got a blackjack', amount: Math.floor(Math.random() * 1000) + 300, icon: <CreditCard className="h-4 w-4 text-amber-400" /> },
                  { type: 'rain', description: 'claimed from the rain', amount: Math.floor(Math.random() * 500) + 100, icon: <CloudRain className="h-4 w-4 text-blue-400" /> },
                  { type: 'tower', description: 'reached level 8', amount: Math.floor(Math.random() * 3000) + 1500, icon: <TrendingUp className="h-4 w-4 text-green-400" /> },
                  { type: 'rakeback', description: 'claimed rakeback bonus', amount: Math.floor(Math.random() * 800) + 200, icon: <Award className="h-4 w-4 text-purple-400" /> },
                ];
                
                const activity = activities[index % activities.length];
                const username = ['CryptoKing', 'DiamondHands', 'MoonShooter', 'GemCollector', 'SatoshiLover', 'RocketRider'][index];
                const timeAgo = ['2m ago', '5m ago', '12m ago', '18m ago', '25m ago', '31m ago'][index];
                
                return (
                  <Card key={index} className="bg-black/60 border-white/10 p-4 flex items-center justify-between group hover:bg-black/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`} alt={username} />
                        <AvatarFallback>{username[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{username}</p>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {timeAgo}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center">
                          {activity.icon}
                          <span className="ml-1">{activity.description}</span>
                        </p>
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
        <div className="bg-black/40 border border-primary/20 p-6 rounded-xl flex flex-col items-center text-center hover:bg-black/50 transition-colors">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <CloudRain className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Regular Gem Rain</h3>
          <p className="text-muted-foreground">Free gems every 15 minutes! Just be online and claim your rewards during rain events.</p>
        </div>
        
        <div className="bg-black/40 border border-primary/20 p-6 rounded-xl flex flex-col items-center text-center hover:bg-black/50 transition-colors">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Live Community Chat</h3>
          <p className="text-muted-foreground">Connect with other players, share your wins, and discuss strategies in our live chat.</p>
        </div>
        
        <div className="bg-black/40 border border-primary/20 p-6 rounded-xl flex flex-col items-center text-center hover:bg-black/50 transition-colors">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Gift className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Daily Free Rewards</h3>
          <p className="text-muted-foreground">Claim free cases, gems, and special rewards every day just for logging in.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
