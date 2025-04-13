
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { Menu, X, Gem } from 'lucide-react';
import DepositButton from './DepositButton';
import { RocketLogo } from './RocketLogo';
import { useUser } from '../context/UserContext';

const Navbar = () => {
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, login } = useUser();

  const navLinks = [
    { name: 'Cases', path: '/cases' },
    { name: 'Case Battles', path: '/case-battles' },
    { name: 'Crash', path: '/crash' },
    { name: 'Mines', path: '/mines' },
    { name: 'Tower', path: '/tower' },
    { name: 'Blackjack', path: '/blackjack' },
    { name: 'Rewards', path: '/rewards' },
    { name: 'Rakeback', path: '/rakeback' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="flex items-center space-x-2">
            <RocketLogo className="h-6 w-6" />
            <span className="font-bold">DUMP.FUN</span>
          </Link>
          <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.path
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="outline"
              size="icon"
              className="mr-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 sm:max-w-xs">
            <SheetHeader>
              <SheetTitle className="flex items-center space-x-2">
                <RocketLogo className="h-6 w-6" />
                <span>DUMP.FUN</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2 mt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md ${
                    pathname === link.path
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="md:hidden mr-auto flex items-center space-x-2">
          <RocketLogo className="h-6 w-6" />
          <span className="font-bold">DUMP.FUN</span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {user && (
            <div className="flex items-center mr-2 bg-gray-800 rounded-md px-3 py-1.5 border border-gray-700">
              <Gem className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-white font-bold">{user.balance}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <DepositButton />
            {user ? (
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            ) : (
              <Button onClick={login}>Sign In</Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
