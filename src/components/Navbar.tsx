
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import RocketLogo from './RocketLogo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Cases', path: '/cases' },
    { label: 'Mines', path: '/mines' },
    { label: 'Blackjack', path: '/blackjack' },
    { label: 'Tower', path: '/tower' },
    { label: 'Rewards', path: '/rewards' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-black via-black to-violet-950/40 border-b border-violet-950/20 shadow-lg backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 h-16">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2 mr-8">
            <RocketLogo />
            <span className="text-xl font-bold text-white">DUMP.FUN</span>
          </Link>
          
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="px-3 py-2 text-sm rounded-md hover:bg-violet-900/20 text-gray-200 hover:text-white transition-all"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="block md:hidden">
              <Button size="icon" variant="outline" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col space-y-1 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="px-3 py-2 text-sm rounded-md hover:bg-violet-900/20"
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
