import React, { useEffect, useState, useRef } from 'react';
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RocketLogo } from '../components/RocketLogo';
import { useToast } from "../components/ui/use-toast";
import { 
  Trophy, Dice1 as Dice, ChevronRight, Zap, Users, Gift, CircleDot, 
  Rocket, MessageSquare, Award, Gem, Layers, TrendingUp, CloudRain, Clock, Bomb,
  ArrowRight, CreditCard, DollarSign, Flame
} from 'lucide-react';
import HomepagePopup from '../components/HomePage/HomepagePopup';
import { playGameSound } from '../utils/gameSounds';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Enhanced interactive background component using particles and waves
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
      }
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    
    // Create particles
    const particles: any[] = [];
    const particleCount = 70; // Increased number of particles
    
    // Create dynamic colors array for a more vibrant look
    const colors = [
      { r: 100, g: 150, b: 255 }, // Light blue
      { r: 150, g: 100, b: 255 }, // Purple
      { r: 200, g: 120, b: 255 }, // Pink
      { r: 100, g: 200, b: 255 }, // Cyan
      { r: 80, g: 120, b: 200 },  // Blue
    ];
    
    for (let i = 0; i < particleCount; i++) {
      const colorIndex = Math.floor(Math.random() * colors.length);
      const color = colors[colorIndex];
      const size = Math.random() * 3 + 0.5; // More varied sizes
      
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: size,
        baseRadius: size, // Store the base radius for pulsing effect
        color: `rgba(${color.r}, ${color.g}, ${color.b}, ${Math.random() * 0.3 + 0.1})`,
        vx: Math.random() * 0.4 - 0.2, // Faster movement
        vy: Math.random() * 0.4 - 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseDirection: 1, // 1 for growing, -1 for shrinking
        pulseFactor: 0,
        initialY: 0, // For wave effect
        amplitude: Math.random() * 5 + 1, // Wave amplitude
        frequency: Math.random() * 0.02 + 0.01 // Wave frequency
      });
    }
    
    // Animation function
    const animate = () => {
      // Create a gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(30, 58, 138, 0.7)'); // Blue
      gradient.addColorStop(1, 'rgba(76, 29, 149, 0.7)'); // Purple
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Time for wave effect
      const time = Date.now() * 0.001;
      
      // Draw and update particles
      particles.forEach(particle => {
        // Wave effect
        const waveY = Math.sin(time * particle.frequency + particle.x * 0.01) * particle.amplitude;
        
        // Pulse effect
        particle.pulseFactor += particle.pulseSpeed * particle.pulseDirection;
        if (particle.pulseFactor > 0.5) particle.pulseDirection = -1;
        if (particle.pulseFactor < -0.3) particle.pulseDirection = 1;
        
        const currentRadius = particle.baseRadius * (1 + particle.pulseFactor * 0.3);
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y + waveY, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = particle.color;
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Boundary check with wrap-around
        if (particle.x < -10) particle.x = canvas.width + 10;
        if (particle.x > canvas.width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = canvas.height + 10;
        if (particle.y > canvas.height + 10) particle.y = -10;
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
};

// Enhanced GameCard component with more visual interest
const EnhancedGameCard = ({ title, description, imagePath, path, buttonText, buttonClass, icon, isPopular = false }) => {
  return (
    <Link to={path} className="block h-full transition-all duration-300">
      <Card className="relative overflow-hidden bg-black/40 border border-white/10 hover:bg-black/20 transition-colors h-full group">
        {/* Visual background patterns */}
        <div className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity">
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/5 to-transparent rounded-tr-full"></div>
        </div>
        
        {/* Game image */}
        <div className="p-3 pt-4">
          <div className="w-full h-32 rounded-lg bg-gradient-to-b from-gray-800 to-gray-900 mb-3 overflow-hidden flex items-center justify-center relative">
            <img src={imagePath || "/placeholder.svg"} alt={title} className="w-full h-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className={`absolute bottom-0 left-0 w-full h-1 ${buttonClass.includes('from') ? buttonClass : `bg-gradient-to-r ${buttonClass}`}`}></div>
          </div>
          
          {/* Game info */}
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${buttonClass.includes('from') ? 'bg-black/50' : 'bg-blue-900/40'} flex items-center justify-center`}>
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">{title}</h3>
                {isPopular && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-0.5">
                    <Flame className="h-3 w-3 mr-1" /> Popular
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-400">{description}</p>
            </div>
          </div>
        </div>
        
        {/* Bottom gradient bar that matches the button class */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
          <div className={`w-full h-full ${buttonClass.includes('from') ? buttonClass : `bg-gradient-to-r ${buttonClass}`}`}></div>
        </div>
      </Card>
    </Link>
  );
};

const EnhancedHome = () => {
  const { toast } = useToast();
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  
  useEffect(() => {
    // Try to play a sound when the page loads to initialize the audio system
    setTimeout(() => {
      playGameSound('buttonClick', 0.3);
    }, 1000);
    
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
      localStorage.setItem('hasVisitedBefore', 'true');
    } else {
      setShowWelcomePopup(true);
      setTimeout(() => setShowWelcomePopup(false), 5000);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pb-16">
      {/* Hero Section with enhanced background */}
      <div className="container py-8 space-y-12">
        <div className="relative flex flex-col items-center text-center overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-blue-950 to-violet-950 border border-primary/20">
          {/* Enhanced Interactive particle background */}
          <ParticleBackground />
          <div className="relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
            >
              <span className="text-white">DUMP</span>
              <span className="text-primary">.FUN</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-2xl mb-8"
            >
              Profit from market volatility with our innovative gaming platform.
              Open cases, play mines, blackjack and win big!
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
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
            </motion.div>
          </div>
        </div>

        {/* Games Grid with enhanced cards */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Our Games</h2>
            <Link to="/cases" className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-4 py-2 rounded-full flex items-center gap-1 hover:from-blue-700 hover:to-violet-700 transition-all">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="transition-all duration-300"
            >
              <EnhancedGameCard
                title="Case Battles"
                description="Battle against others for the best drops"
                imagePath="/placeholder.svg"
                path="/case-battles"
                buttonText="Open Cases"
                buttonClass="btn-cases"
                icon={<Trophy size={24} className="h-6 w-6" />}
                isPopular={true}
              />
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="transition-all duration-300"
            >
              <EnhancedGameCard
                title="Mines"
                description="Avoid the mines, collect the gems"
                imagePath="/placeholder.svg"
                path="/mines"
                buttonText="Play Mines"
                buttonClass="btn-mines"
                icon={<Bomb className="h-6 w-6" />}
                isPopular={true}
              />
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="transition-all duration-300"
            >
              <EnhancedGameCard
                title="Blackjack"
                description="Beat the dealer to 21"
                imagePath="/placeholder.svg"
                path="/blackjack"
                buttonText="Play Blackjack"
                buttonClass="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                icon={<CreditCard className="h-6 w-6" />}
              />
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="transition-all duration-300"
            >
              <EnhancedGameCard
                title="Tower"
                description="Climb to win big prizes"
                imagePath="/placeholder.svg"
                path="/tower"
                buttonText="Play Tower"
                buttonClass="bg-gradient-to-r from-green-500 to-teal-500 text-white"
                icon={<TrendingUp className="h-6 w-6" />}
              />
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="transition-all duration-300"
            >
              <EnhancedGameCard
                title="Crash"
                description="Cash out before the rocket crashes"
                imagePath="/placeholder.svg"
                path="/crash"
                buttonText="Play Crash"
                buttonClass="bg-gradient-to-r from-red-500 to-rose-500 text-white"
                icon={<Zap className="h-6 w-6" />}
                isPopular={true}
              />
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="transition-all duration-300"
            >
              <EnhancedGameCard
                title="RakeBack"
                description="Earn a percentage of your bets back"
                imagePath="/placeholder.svg"
                path="/rakeback"
                buttonText="Claim RakeBack"
                buttonClass="bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                icon={<DollarSign className="h-6 w-6" />}
              />
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="transition-all duration-300"
            >
              <EnhancedGameCard
                title="Rewards"
                description="Claim daily rewards and bonuses"
                imagePath="/placeholder.svg"
                path="/rewards"
                buttonText="Get Rewards"
                buttonClass="bg-gradient-to-r from-yellow-500 to-amber-500 text-white"
                icon={<Gift className="h-6 w-6" />}
              />
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="transition-all duration-300"
            >
              <EnhancedGameCard
                title="Plinko"
                description="Watch balls bounce for big wins"
                imagePath="/placeholder.svg"
                path="/plinko"
                buttonText="Play Plinko"
                buttonClass="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                icon={<CircleDot className="h-6 w-6" />}
              />
            </motion.div>
          </div>
        </div>
        
        {/* Live Activity Section with enhanced styling */}
        <div>
          <div className="bg-black/40 border border-primary/20 backdrop-blur-md p-6 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                Live Activity
              </h2>
              <Link to="/leaderboard" className="text-primary text-sm hover:underline flex items-center">
                View Leaderboard
                <ArrowRight size={14} className="ml-1" />
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
                      <Avatar className="h-10 w-10 border border-gray-700">
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

        {/* Features Section with enhanced styling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-black/60 to-blue-900/20 border border-primary/20 p-6 rounded-xl flex flex-col items-center text-center hover:bg-black/50 transition-colors"
          >
            <div className="h-14 w-14 rounded-full bg-blue-900/30 border border-blue-500/40 flex items-center justify-center mb-4">
              <CloudRain className="h-7 w-7 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Regular Gem Rain</h3>
            <p className="text-muted-foreground">Free gems every 15 minutes! Just be online and claim your rewards during rain events.</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-black/60 to-indigo-900/20 border border-primary/20 p-6 rounded-xl flex flex-col items-center text-center hover:bg-black/50 transition-colors"
          >
            <div className="h-14 w-14 rounded-full bg-indigo-900/30 border border-indigo-500/40 flex items-center justify-center mb-4">
              <MessageSquare className="h-7 w-7 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Live Community Chat</h3>
            <p className="text-muted-foreground">Connect with other players, share your wins, and discuss strategies in our live chat.</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-black/60 to-orange-900/20 border border-primary/20 p-6 rounded-xl flex flex-col items-center text-center hover:bg-black/50 transition-colors"
          >
            <div className="h-14 w-14 rounded-full bg-amber-900/30 border border-amber-500/40 flex items-center justify-center mb-4">
              <Gift className="h-7 w-7 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Daily Free Rewards</h3>
            <p className="text-muted-foreground">Claim free cases, gems, and special rewards every day just for logging in.</p>
          </motion.div>
        </div>
      </div>

      {/* Welcome Popup */}
      <HomepagePopup isOpen={showWelcomePopup} onClose={() => setShowWelcomePopup(false)} />
    </div>
  );
};

export default EnhancedHome;
