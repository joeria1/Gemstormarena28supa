
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Bell, Menu } from 'lucide-react';
import RocketLogo from './RocketLogo';
import DepositButton from './DepositButton';
import SoundManager from './SoundManager';
import { useUser } from '../context/UserContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, login, logout } = useUser();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? "border-b-2 border-primary" : "";
  };

  // Auth status
  const isLoggedIn = !!user;

  const handleLogin = () => {
    login("user123", "Demo User");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-gray-900/80 shadow backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <RocketLogo className="h-9 w-9 text-blue-400" />
              <span className="ml-2 text-xl font-bold text-white">Crypto<span className="text-blue-400">Rocket</span></span>
            </Link>
            
            <div className="hidden md:ml-6 md:flex md:space-x-4 items-center">
              <Link to="/" className={`text-gray-300 hover:text-white px-3 py-2 ${isActive('/')}`}>
                Home
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`text-gray-300 hover:text-white px-3 py-2 ${location.pathname.includes('/games') ? isActive('/games') : ''}`}>
                    Games
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 text-white border-gray-700 w-48">
                  <DropdownMenuLabel>Featured Games</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem asChild>
                    <Link to="/blackjack" className="focus:bg-gray-700 cursor-pointer">Blackjack</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/mines" className="focus:bg-gray-700 cursor-pointer">Mines</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/crash" className="focus:bg-gray-700 cursor-pointer">Crash</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/tower" className="focus:bg-gray-700 cursor-pointer">Tower</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/horse-racing" className="focus:bg-gray-700 cursor-pointer">Horse Racing</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuLabel>Case Opening</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem asChild>
                    <Link to="/cases" className="focus:bg-gray-700 cursor-pointer">Cases</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/case-battles" className="focus:bg-gray-700 cursor-pointer">Case Battles</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Link to="/affiliates" className={`text-gray-300 hover:text-white px-3 py-2 ${isActive('/affiliates')}`}>
                Affiliates
              </Link>
              
              <Link to="/rewards" className={`text-gray-300 hover:text-white px-3 py-2 ${isActive('/rewards')}`}>
                Rewards
              </Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center">
            <SoundManager />
            
            {isLoggedIn ? (
              <>
                <div className="flex items-center bg-gray-800 rounded-full px-3 py-1 mr-3">
                  <span className="text-green-400 text-sm font-semibold mr-1">$</span>
                  <span className="text-white font-medium">{user.balance.toFixed(2)}</span>
                </div>
                
                <DepositButton />
                
                <button className="ml-3 p-1.5 text-gray-400 hover:text-white">
                  <Bell className="h-5 w-5" />
                </button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="ml-3 flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 text-white border-gray-700">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="focus:bg-gray-700 cursor-pointer">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/rake-back" className="focus:bg-gray-700 cursor-pointer">Rake Back</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem onClick={logout} className="focus:bg-gray-700 cursor-pointer text-red-400">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700">
                Login
              </Button>
            )}
          </div>
          
          <div className="flex md:hidden items-center">
            {isLoggedIn && (
              <div className="flex items-center bg-gray-800 rounded-full px-3 py-1 mr-3">
                <span className="text-green-400 text-sm font-semibold mr-1">$</span>
                <span className="text-white font-medium">{user.balance.toFixed(2)}</span>
              </div>
            )}
            
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-800"
              onClick={toggleMobileMenu}
            >
              Home
            </Link>
            <Link
              to="/blackjack"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={toggleMobileMenu}
            >
              Blackjack
            </Link>
            <Link
              to="/mines"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={toggleMobileMenu}
            >
              Mines
            </Link>
            <Link
              to="/crash"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={toggleMobileMenu}
            >
              Crash
            </Link>
            <Link
              to="/tower"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={toggleMobileMenu}
            >
              Tower
            </Link>
            <Link
              to="/cases"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={toggleMobileMenu}
            >
              Cases
            </Link>
            <Link
              to="/case-battles"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={toggleMobileMenu}
            >
              Case Battles
            </Link>
            <Link
              to="/horse-racing"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={toggleMobileMenu}
            >
              Horse Racing
            </Link>
            <Link
              to="/affiliates"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={toggleMobileMenu}
            >
              Affiliates
            </Link>
            <Link
              to="/rewards"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={toggleMobileMenu}
            >
              Rewards
            </Link>
            
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                  onClick={toggleMobileMenu}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    toggleMobileMenu();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  handleLogin();
                  toggleMobileMenu();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
