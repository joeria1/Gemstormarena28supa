
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { 
  Menu, 
  X, 
  ChevronDown,
  CreditCard, 
  UserCircle, 
  Gift, 
  Users, 
  Bomb,
  Rocket,
  Gamepad2,
  Castle,
  Swords,
  CircleDot
} from 'lucide-react';
import { Button } from './ui/button';
import DepositButton from './DepositButton';
import { RocketLogo } from './RocketLogo';
import { useSound } from './ui/sound-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NavbarUpdated: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const location = useLocation();
  const { isMuted, toggleMute } = useSound();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const gameLinks = [
    { to: '/mines', label: 'Mines', icon: <Bomb className="w-5 h-5" /> },
    { to: '/crash', label: 'Crash', icon: <Rocket className="w-5 h-5" /> },
    { to: '/horse-racing', label: 'Horse Racing', icon: <Gamepad2 className="w-5 h-5" /> },
    { to: '/blackjack', label: 'Blackjack', icon: <CreditCard className="w-5 h-5" /> },
    { to: '/tower', label: 'Tower', icon: <Castle className="w-5 h-5" /> },
    { to: '/case-battles', label: 'Case Battles', icon: <Swords className="w-5 h-5" /> },
    { to: '/plinko', label: 'Plinko', icon: <CircleDot className="w-5 h-5" /> },
  ];

  const userNavLinks = [
    { to: '/profile', label: 'Profile', icon: <UserCircle className="w-5 h-5" /> },
    { to: '/rewards', label: 'Rewards', icon: <Gift className="w-5 h-5" /> },
    { to: '/affiliates', label: 'Affiliates', icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <nav className="bg-gray-900 text-white py-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center text-xl font-semibold">
          <RocketLogo className="w-8 h-8 mr-2" />
          DUMP.FUN
        </Link>

        <div className="flex items-center space-x-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                Play <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700">
              {gameLinks.map((link) => (
                <DropdownMenuItem key={link.to} asChild>
                  <Link 
                    to={link.to} 
                    className={`flex items-center text-gray-200 hover:text-white hover:bg-gray-700 cursor-pointer ${location.pathname === link.to ? 'bg-gray-700' : ''}`}
                  >
                    {link.icon}
                    <span className="ml-2">{link.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <>
                {userNavLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`hover:text-gray-300 flex items-center ${location.pathname === link.to ? 'text-white' : 'text-gray-400'}`}
                  >
                    {link.icon}
                    <span className="ml-2">{link.label}</span>
                  </Link>
                ))}
                <DepositButton />
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-gray-300">Login</Link>
                <Link to="/register" className="hover:text-gray-300">Register</Link>
              </>
            )}
          </div>
        </div>

        <div className="lg:hidden">
          <button onClick={toggleMenu} className="text-gray-300 hover:text-white focus:outline-none focus:text-white">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {user && (
          <div className={`lg:hidden ${isOpen ? 'block' : 'none'}`}>
            <div className="mt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start">
                    Play <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700">
                  {gameLinks.map((link) => (
                    <DropdownMenuItem key={link.to} asChild>
                      <Link 
                        to={link.to} 
                        onClick={closeMenu}
                        className={`flex items-center text-gray-200 hover:text-white hover:bg-gray-700 cursor-pointer ${location.pathname === link.to ? 'bg-gray-700' : ''}`}
                      >
                        {link.icon}
                        <span className="ml-2">{link.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {userNavLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block py-2 hover:text-gray-300 ${location.pathname === link.to ? 'text-white' : 'text-gray-400'}`}
                  onClick={closeMenu}
                >
                  <div className="flex items-center">
                    {link.icon}
                    <span className="ml-2">{link.label}</span>
                  </div>
                </Link>
              ))}
              <div className="mt-2">
                <DepositButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavbarUpdated;
