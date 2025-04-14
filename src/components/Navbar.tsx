
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RocketLogo } from './RocketLogo';
import DepositButton from './DepositButton';
import { useUser } from '../context/UserContext';
import { useLocation } from 'react-router-dom';
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
  CircleDot
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

const Navbar = () => {
  const location = useLocation();
  const { user } = useUser();
  const [open, setOpen] = useState(false);

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

  return (
    <div className="bg-[#0F1623] border-b border-gray-800 py-2 px-4 sticky top-0 z-30">
      <div className="container mx-auto flex justify-between items-center h-16">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center">
            <RocketLogo className="h-8 w-8 text-green-500" />
            <span className="ml-2 text-xl font-bold">DUMP.FUN</span>
          </Link>

          <div className="hidden md:flex space-x-1">
            <NavLink to="/blackjack" isActive={isActive("/blackjack")} icon={<CreditCard className="w-4 h-4" />}>
              Blackjack
            </NavLink>
            <NavLink to="/case-battles" isActive={isActive("/case-battles")} icon={<Sword className="w-4 h-4" />}>
              Battles
            </NavLink>
            <NavLink to="/cases" isActive={isActive("/cases")} icon={<Boxes className="w-4 h-4" />}>
              Cases
            </NavLink>
            <NavLink to="/rewards" isActive={isActive("/rewards")} icon={<Gift className="w-4 h-4" />}>
              Rewards
            </NavLink>
            <NavLink to="/plinko" isActive={isActive("/plinko")} icon={<CircleDot className="w-4 h-4" />}>
              Plinko
            </NavLink>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-10 px-4 py-2 rounded flex items-center",
                    isActive("/crash") || isActive("/mines") || isActive("/horse-racing") || isActive("/tower")
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  )}
                >
                  <span className="mr-1">More Games</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                <DropdownMenuItem asChild>
                  <Link to="/crash" className="flex items-center text-gray-200 hover:text-white hover:bg-gray-700 cursor-pointer">
                    <Target className="w-4 h-4 mr-2" />
                    Crash
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/mines" className="flex items-center text-gray-200 hover:text-white hover:bg-gray-700 cursor-pointer">
                    <Coins className="w-4 h-4 mr-2" />
                    Mines
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/horse-racing" className="flex items-center text-gray-200 hover:text-white hover:bg-gray-700 cursor-pointer">
                    <HorseIcon className="w-4 h-4 mr-2" />
                    Racing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/tower" className="flex items-center text-gray-200 hover:text-white hover:bg-gray-700 cursor-pointer">
                    <Building2 className="w-4 h-4 mr-2" />
                    Tower
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <NavLink to="/affiliates" isActive={isActive("/affiliates")} icon={<Users className="w-4 h-4" />}>
              Affiliates
            </NavLink>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-gray-800 px-4 py-2 rounded flex items-center">
            <DollarSign className="text-green-500 w-4 h-4 mr-1" />
            <span className="font-bold">${user?.balance?.toFixed(2) || '0.00'}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center">
              <div className="mr-3">
                <div className="flex items-center text-xs text-gray-400">
                  <div className="flex items-center mr-1">
                    <Award className="w-3 h-3 text-yellow-500 mr-1" />
                    <span>Level {level}</span>
                  </div>
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-green-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="ml-1">{xp}/{xpRequired} XP</span>
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
