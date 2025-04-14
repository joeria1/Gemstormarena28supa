
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { 
  Menu, 
  X, 
  CreditCard, 
  UserCircle, 
  Gift, 
  Users, 
  Home,
  Bomb,
  Rocket,
  Gamepad2,
  Card,  // Replaced PlayingCards with Card
  Castle,
  Swords,
  CircleDot
} from 'lucide-react';
import { Button } from './ui/button';
import DepositButton from './DepositButton';
import { RocketLogo } from './RocketLogo';

const NavbarUpdated: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { to: '/mines', label: 'Mines', icon: <Bomb className="w-5 h-5" /> },
    { to: '/crash', label: 'Crash', icon: <Rocket className="w-5 h-5" /> },
    { to: '/horse-racing', label: 'Horse Racing', icon: <Gamepad2 className="w-5 h-5" /> },
    { to: '/blackjack', label: 'Blackjack', icon: <Card className="w-5 h-5" /> }, // Updated icon
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
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center text-xl font-semibold">
          <RocketLogo className="w-8 h-8 mr-2" />
          DUMP.FUN
        </Link>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button onClick={toggleMenu} className="text-gray-300 hover:text-white focus:outline-none focus:text-white">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Main Navigation Links */}
        <div className={`lg:flex items-center space-x-6 ${isOpen ? 'block' : 'hidden'} lg:block`}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`hover:text-gray-300 flex items-center ${location.pathname === link.to ? 'text-white' : 'text-gray-400'}`}
              onClick={closeMenu}
            >
              {link.icon}
              <span className="ml-2">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* User Info and Actions */}
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

        {/* Mobile User Menu (if user is logged in) */}
        {user && (
          <div className={`lg:hidden ${isOpen ? 'block' : 'none'}`}>
            <div className="mt-4">
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
