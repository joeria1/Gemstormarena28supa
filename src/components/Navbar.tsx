import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RocketLogo } from './RocketLogo';
import DepositButton from './DepositButton';
import { useUser } from '../context/UserContext';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  Sword, 
  Boxes, 
  Coins, 
  Target, 
  Trophy, 
  Users, 
  ChevronDown,
  CreditCard,
  Gift,
  User,
  Award,
  Building2,
  CircleDot,
  Gamepad,
  Zap,
  Bird
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import HorseIcon from './HorseRacing/HorseIcon';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const Navbar = () => {
  const location = useLocation();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Calculate progress for the XP bar
  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const xpRequired = level * 1000; // Simple calculation for required XP
  const progress = Math.min((xp / xpRequired) * 100, 100);

  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : 'US';
  };

  // Game links for the dropdown with new styling
  const gameLinks = [
    { to: "/crossroad", label: "CrossRoad", icon: <Bird className="w-5 h-5" color="#ffcc00" />, isNew: true },
    { to: "/crash", label: "Crash", icon: <Zap className="w-5 h-5" color="#ff5252" />, isNew: true },
    { to: "/mines", label: "Mines", icon: <Coins className="w-5 h-5" color="#51d289" />, isNew: true },
    { to: "/case-battles", label: "Case Battles", icon: <Sword className="w-5 h-5" color="#3498db" /> },
    { to: "/horse-racing", label: "Horse Racing", icon: <HorseIcon className="w-5 h-5" color="#9b59b6" /> },
    { to: "/blackjack", label: "Blackjack", icon: <CreditCard className="w-5 h-5" color="#f1c40f" /> },
    { to: "/tower", label: "Towers", icon: <Building2 className="w-5 h-5" color="#8e44ad" /> },
    { to: "/plinko", label: "Plinko", icon: <CircleDot className="w-5 h-5" color="#1abc9c" /> },
    { to: "/cases", label: "Cases", icon: <Boxes className="w-5 h-5" color="#e67e22" /> },
  ];

  // Animation variants for the dropdown menu
  const dropdownVariants = {
    hidden: { opacity: 0, y: -5, height: 0 },
    visible: { 
      opacity: 1, 
      y: 0, 
      height: 'auto',
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -5, 
      height: 0,
      transition: { 
        duration: 0.15,
        ease: "easeIn"
      }
    }
  };

  // Animation variants for menu items
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({ 
      opacity: 1, 
      x: 0,
      transition: { 
        delay: i * 0.05,
        duration: 0.2
      }
    }),
    exit: { opacity: 0, transition: { duration: 0.1 } }
  };

  return (
    <div className="bg-[#0F1623] border-b border-gray-800 py-2 px-4 sticky top-0 z-30">
      <div className="container mx-auto flex justify-between items-center h-16">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center">
            <RocketLogo className="h-8 w-8 text-green-500" />
            <span className="ml-2 text-xl font-bold">DUMP.FUN</span>
          </Link>

          <div className="hidden md:flex space-x-1">
            {/* Custom Play dropdown with animation */}
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "h-10 px-4 py-2 rounded flex items-center",
                      "text-gray-200 hover:text-white hover:bg-gray-800"
                    )}
                  >
                    <Gamepad className="w-4 h-4 mr-2 text-green-500" />
                    <span className="mr-1">Play</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 py-2 bg-[#0C1527] border border-blue-900/50 rounded-lg overflow-hidden">
                  {gameLinks.map((link, index) => (
                    <DropdownMenuItem key={link.to} asChild>
                      <Link 
                        to={link.to} 
                        className={cn(
                          "flex items-center justify-between px-3 py-2.5 text-gray-200 hover:bg-gray-800/40 transition-colors rounded-lg m-1",
                          isActive(link.to) ? "bg-gray-800/40" : ""
                        )}
                        style={{
                          border: '1px solid',
                          borderImage: 'linear-gradient(to right, rgba(59, 130, 246, 0.3), rgba(16, 34, 65, 0.1))',
                          borderImageSlice: 1
                        }}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-800/70 flex items-center justify-center mr-3">
                            {link.icon}
                          </div>
                          <span className="font-medium">{link.label}</span>
                        </div>
                        {link.isNew && (
                          <Badge className="bg-orange-600 text-white text-[10px] px-1.5 py-0.5 uppercase">
                            new
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4 mr-4">
            <NavLink to="/rewards" isActive={isActive("/rewards")} icon={<Gift className="w-4 h-4" />}>
              Rewards
            </NavLink>
            
            <NavLink to="/affiliates" isActive={isActive("/affiliates")} icon={<Users className="w-4 h-4" />}>
              Affiliates
            </NavLink>
          </div>
          
          <div id="user-balance" className="bg-gray-800 px-4 py-2 rounded flex items-center relative">
            <DollarSign className="text-green-500 w-4 h-4 mr-1" />
            <span className="font-bold">${user?.balance?.toFixed(2) || '0.00'}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center">
              <div className="mr-2">
                <div className="flex items-center text-xs text-gray-400">
                  <div className="flex items-center mr-1">
                    <Award className="w-3 h-3 text-yellow-500 mr-1" />
                    <span>Lvl {level}</span>
                  </div>
                  <div className="w-14 h-1.5 bg-gray-700 rounded-full overflow-hidden mx-1">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-green-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center hover:opacity-80">
                    <Avatar className="h-8 w-8 border border-gray-700">
                      <AvatarImage src={user?.avatar || "https://api.dicebear.com/7.x/lorelei/svg?seed=user"} />
                      <AvatarFallback>{getInitials(user?.username || '')}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center text-gray-200 hover:text-white hover:bg-gray-700 cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/rewards" className="flex items-center text-gray-200 hover:text-white hover:bg-gray-700 cursor-pointer">
                      <Gift className="w-4 h-4 mr-2" />
                      Rewards
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <DepositButton />
          </div>
        </div>
      </div>
    </div>
  );
};

interface NavLinkProps {
  to: string;
  isActive: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const NavLink = ({ to, isActive, icon, children }: NavLinkProps) => {
  return (
    <Link to={to}>
      <Button
        variant="ghost"
        className={cn(
          "h-10 px-4 py-2 rounded flex items-center",
          isActive
            ? "bg-gray-800 text-white"
            : "text-gray-400 hover:text-white hover:bg-gray-800"
        )}
      >
        {icon && <span className="mr-2">{icon}</span>}
        <span>{children}</span>
      </Button>
    </Link>
  );
};

export default Navbar;
