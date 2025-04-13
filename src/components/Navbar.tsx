
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { useSound } from '@/components/SoundManager';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent, SheetClose } from '@/components/ui/sheet';
import { Gem, Menu, User, Volume2, VolumeX, CreditCard, Bomb, MessageSquare } from 'lucide-react';
import { RocketLogo } from './RocketLogo';

const Navbar: React.FC = () => {
  const { user, login, logout } = useUser();
  const { isMuted, toggleMute } = useSound();
  
  return (
    <nav className="bg-black/50 backdrop-blur-md border-b border-white/10 py-4 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <RocketLogo className="h-8 w-auto mr-2" />
          <span className="font-bold text-2xl">
            <span className="text-white">DUMP</span>
            <span className="text-primary">.FUN</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link to="/cases" className="text-white hover:text-primary transition-colors">
            Case Battles
          </Link>
          <Link to="/mines" className="text-white hover:text-primary transition-colors">
            Mines
          </Link>
          <Link to="/blackjack" className="text-white hover:text-primary transition-colors">
            Blackjack
          </Link>
          <Link to="/rainbot" className="text-white hover:text-primary transition-colors">
            Rain Bot
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={toggleMute}
            className="bg-black/40 border-primary/30 h-9 w-9"
          >
            {isMuted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-white" />}
          </Button>
          
          {user ? (
            <>
              <div className="bg-black/40 px-3 py-1.5 rounded-md flex items-center gap-2 border border-primary/30">
                <Gem className="h-4 w-4 text-cyan-400" />
                <span className="font-semibold text-white">{user.balance}</span>
              </div>
              
              <Button 
                variant="outline" 
                onClick={logout}
                className="bg-black/40 border-primary/30 hidden md:flex"
              >
                <User size={16} className="mr-2" />
                Profile
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              onClick={login}
              className="bg-black/40 border-primary/30"
            >
              Login
            </Button>
          )}
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden bg-black/40 border-primary/30">
                <Menu size={18} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-black/90 border-primary/30">
              <div className="flex flex-col h-full">
                <div className="py-6">
                  <Link to="/" className="flex items-center mb-10">
                    <RocketLogo className="h-8 w-auto mr-2" />
                    <span className="font-bold text-2xl">
                      <span className="text-white">DUMP</span>
                      <span className="text-primary">.FUN</span>
                    </span>
                  </Link>
                  
                  <nav className="flex flex-col space-y-4">
                    <SheetClose asChild>
                      <Link to="/cases" className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-primary/10">
                        <CreditCard size={18} className="text-primary" />
                        <span>Case Battles</span>
                      </Link>
                    </SheetClose>
                    
                    <SheetClose asChild>
                      <Link to="/mines" className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-primary/10">
                        <Bomb size={18} className="text-primary" />
                        <span>Mines</span>
                      </Link>
                    </SheetClose>
                    
                    <SheetClose asChild>
                      <Link to="/blackjack" className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-primary/10">
                        <CreditCard size={18} className="text-primary" />
                        <span>Blackjack</span>
                      </Link>
                    </SheetClose>
                    
                    <SheetClose asChild>
                      <Link to="/rainbot" className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-primary/10">
                        <MessageSquare size={18} className="text-primary" />
                        <span>Rain Bot</span>
                      </Link>
                    </SheetClose>
                  </nav>
                </div>
                
                <div className="mt-auto mb-6">
                  {user ? (
                    <>
                      <div className="bg-black/40 p-4 rounded-lg mb-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 overflow-hidden">
                          <img 
                            src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username}`}
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Gem className="h-3 w-3 text-cyan-400 mr-1" />
                            {user.balance}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={logout}
                        className="w-full"
                      >
                        <User size={16} className="mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={login}
                      className="w-full"
                    >
                      <User size={16} className="mr-2" />
                      Login
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
