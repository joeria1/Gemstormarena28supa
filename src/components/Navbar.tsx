
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { RocketLogo } from './RocketLogo';
import DepositButton from './DepositButton';
import { UserContext } from '../context/UserContext';
import { useLocation } from 'react-router-dom';
import { 
  DollarSign, 
  Sword, 
  Boxes, 
  Coins, 
  Target, 
  Trophy, 
  GitBranch, 
  Users, 
  ChevronDown,
  CreditCard
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

const Navbar = () => {
  const location = useLocation();
  const { user } = useContext(UserContext);
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-10 px-4 py-2 rounded flex items-center",
                    isActive("/crash") || isActive("/mines") || isActive("/horse-racing")
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
            <span className="font-bold">${user.balance.toFixed(2)}</span>
          </div>
          <DepositButton />
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
