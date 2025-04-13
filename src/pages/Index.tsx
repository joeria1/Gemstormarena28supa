
import React from 'react';
import { Link } from 'react-router-dom';
import { RocketLogo } from '@/components/RocketLogo';
import GameCard from '@/components/GameCard';
import { ArrowRight, ArrowRightFromLine, Bomb, Gem, Rocket, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-black">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-center md:text-left mb-12 md:mb-0">
              <div className="inline-flex items-center mb-2 bg-primary/20 rounded-full px-3 py-1">
                <Rocket className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm font-medium">Take a dive into profits</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="text-white block">Invest in</span>
                <span className="bg-gradient-to-r from-[#4066FF] to-primary bg-clip-text text-transparent">
                  Market Dumps
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                Profit from market volatility with our innovative platform. Open cases, play mines, and win big with DUMP.FUN!
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Link to="/cases">
                  <Button className="btn-primary h-12 px-8">
                    Start Playing
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/mines">
                  <Button variant="outline" className="btn-outline h-12 px-8">
                    Try Mines
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="md:w-1/2 flex justify-center md:justify-end">
              <div className="relative">
                <div className="animate-pulse w-64 h-64 bg-primary/10 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"></div>
                <RocketLogo className="w-72 h-72 relative z-10" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent z-0"></div>
      </section>
      
      {/* Features Section */}
      <section className="py-12 md:py-24 bg-black/80 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="text-primary">DUMP.FUN</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Our platform offers exciting games with fair mechanics and transparent odds,
              all while providing real chances to profit.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black/40 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Payouts</h3>
              <p className="text-muted-foreground">
                Instant withdrawals and deposits with no waiting periods. Get your profits immediately!
              </p>
            </div>
            
            <div className="bg-black/40 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Provably Fair</h3>
              <p className="text-muted-foreground">
                All games use verifiable algorithms that can be audited for fairness and true randomness.
              </p>
            </div>
            
            <div className="bg-black/40 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Gem className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Exclusive Rewards</h3>
              <p className="text-muted-foreground">
                Daily bonuses, rain events, and affiliate rewards help you maximize profits.
              </p>
            </div>
          </div>
        </div>
        
        {/* Background grid pattern */}
        <div className="bg-grid-pattern absolute inset-0 z-0"></div>
      </section>
      
      {/* Games Section */}
      <section className="py-12 md:py-24 bg-black relative">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Featured Games</h2>
            <Link to="/games" className="text-primary flex items-center gap-1 hover:underline">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <GameCard
              title="Case Battles"
              description="Compete with others opening virtual cases for the best rewards."
              imagePath="/lovable-uploads/e0c048ce-4a7d-4e27-bfa6-aabfb3e7a55c.png"
              path="/cases"
              buttonText="Open Cases"
              buttonClass="btn-cases"
            />
            
            <GameCard
              title="Mines"
              description="Navigate through a minefield to win gems without hitting bombs."
              imagePath="/lovable-uploads/4e40aed5-2e3d-4f03-ab31-3c8f5e9b1604.png"
              path="/mines"
              buttonText="Play Mines"
              buttonClass="btn-mines"
              isNew={true}
            />
            
            <GameCard
              title="Rain Bot"
              description="Join regular gem rains for rewards every 30 minutes."
              imagePath="/placeholder.svg"
              path="/rainbot"
              buttonText="Join Rains"
              buttonClass="btn-primary"
            />
          </div>
          
          <div className="text-center">
            <Link to="/games">
              <Button variant="outline" className="btn-outline">
                Explore All Games
                <ArrowRightFromLine className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-12 md:py-24 bg-gradient-to-b from-black to-black/90">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Platform Statistics
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Join thousands of traders already profiting on our platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-black/40 border border-white/10 rounded-xl p-6 text-center backdrop-blur-sm">
              <div className="text-4xl font-bold bg-gradient-to-r from-[#4066FF] to-primary bg-clip-text text-transparent mb-2">
                $2.5M+
              </div>
              <div className="text-muted-foreground">Total Volume</div>
            </div>
            
            <div className="bg-black/40 border border-white/10 rounded-xl p-6 text-center backdrop-blur-sm">
              <div className="text-4xl font-bold bg-gradient-to-r from-[#4066FF] to-primary bg-clip-text text-transparent mb-2">
                120K+
              </div>
              <div className="text-muted-foreground">Cases Opened</div>
            </div>
            
            <div className="bg-black/40 border border-white/10 rounded-xl p-6 text-center backdrop-blur-sm">
              <div className="text-4xl font-bold bg-gradient-to-r from-[#4066FF] to-primary bg-clip-text text-transparent mb-2">
                15K+
              </div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            
            <div className="bg-black/40 border border-white/10 rounded-xl p-6 text-center backdrop-blur-sm">
              <div className="text-4xl font-bold bg-gradient-to-r from-[#4066FF] to-primary bg-clip-text text-transparent mb-2">
                $350K+
              </div>
              <div className="text-muted-foreground">Payouts</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Recent Winners */}
      <section className="py-12 md:py-16 bg-black/90">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Recent Winners</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-black/60 border border-white/10 rounded-lg p-4 flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/20 rounded-full"></div>
                <div>
                  <p className="font-medium">User{index + 1}</p>
                  <p className="text-sm text-muted-foreground flex items-center">
                    won <Gem className="h-3 w-3 text-gem mx-1" /> 
                    <span className="text-gem">{(Math.random() * 10000).toFixed(0)}</span>
                  </p>
                </div>
                <div className="ml-auto text-xs text-muted-foreground">
                  {Math.floor(Math.random() * 50) + 1}m ago
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 md:py-24 bg-gradient-to-b from-black/90 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to <span className="text-primary">DUMP</span> your way to profits?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Join our platform today and start turning market volatility into real gains. 
              No complicated trading, just fun games with real rewards.
            </p>
            <Link to="/cases">
              <Button className="btn-primary h-12 px-8 text-lg">
                Start Playing Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
