
import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { useSound } from '@/components/SoundManager';
import { Button } from '@/components/ui/button';
import { Gem, Menu, User, Volume2, VolumeX } from 'lucide-react';
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
          <Link to="/rainbot" className="text-white hover:text-primary transition-colors">
            Rain Bot
          </Link>
          <Link to="/affiliates" className="text-white hover:text-primary transition-colors">
            Affiliates
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
                <Gem className="h-4 w-4 text-gem" />
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
          
          <Button variant="outline" size="icon" className="md:hidden bg-black/40 border-primary/30">
            <Menu size={18} />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
